import { useState, useEffect, useRef, Component, type ReactNode } from "react";

import Loading from "./components/loading";
import Main from "./components/main";
import MainLogin from "./components/mainLogin";

import { darkPreference } from "./components/interfaces";
import { freshRss } from "./freshrss";
import { DragDropProvider } from "@dnd-kit/react";

/**
 * Checks if error is from a Drag&Drop event.
 */
function isDndCommitError(message: unknown): boolean {
  if (typeof message !== "string") return false;
  return (
    (message.includes("removeChild") && message.includes("not a child")) ||
    message.includes("useInsertionEffect must not schedule updates")
  );
}

interface RemountBoundaryProps {
  onCrash: () => void;
  children: ReactNode;
}


class RemountBoundary extends Component<RemountBoundaryProps> {
  componentDidCatch(error: Error) {
    if (isDndCommitError(error.message)) {
      // Known dnd-kit DOM desync after a cross-column drop.
      this.props.onCrash();
    } else {
      throw error;
    }
  }
  render() {
    return this.props.children;
  }
}

/**
 * Wraps <Main> and remounts it.
 */
function DragSafeMain({ handleLogin }: { handleLogin: (v: boolean | undefined) => void }) {
  const [remountKey, setRemountKey] = useState(0);
  // Debounce so a burst of errors from a single drop triggers one remount.
  const pendingRef = useRef(false);

  const requestRemount = () => {
    if (pendingRef.current) return;
    pendingRef.current = true;
    // Defer to a microtask so React finishes its current (failing) commit first.
    queueMicrotask(() => {
      pendingRef.current = false;
      setRemountKey((k) => k + 1);
    });
  };

  useEffect(() => {
    const onError = (e: ErrorEvent) => {
      if (isDndCommitError(e.message) || isDndCommitError(e.error?.message)) {
        e.preventDefault();
        requestRemount();
      }
    };
    window.addEventListener("error", onError);
    return () => window.removeEventListener("error", onError);
  }, []);

  return (
    <RemountBoundary key={remountKey} onCrash={requestRemount}>
      <Main handleLogin={handleLogin} />
    </RemountBoundary>
  );
}

export default function App() {
  const [isLoggedIn, setLoggedIn] = useState<boolean | undefined>(undefined);
  useEffect(() => {
    if (darkPreference()) {
      document.body.classList.add("dark");
    }
    try {
      freshRss.session = localStorage.getItem("FRSession");
      freshRss.base = localStorage.getItem("FRHost");
    } catch (err) {
      console.log(err);
    }
    freshRss.isLoggedIn().then(setLoggedIn).catch(console.log);
  }, []);
  useEffect(() => {
    if (isLoggedIn && freshRss.session && freshRss.base) {
      try {
        localStorage.setItem("FRSession", freshRss.session);
        localStorage.setItem("FRHost", freshRss.base);
      } catch (err) {
        console.warn(err);
      }
    }
  }, [isLoggedIn]);
  if (isLoggedIn === false) {
    return <MainLogin handleLogin={setLoggedIn} />;
  }
  if (isLoggedIn === true) {
    return (
      <DragDropProvider>
        <DragSafeMain handleLogin={setLoggedIn} />
      </DragDropProvider>
    );
  }
  // loading screen
  return (
    <div className="mx-auto dark:bg-black">
      <Loading />
    </div>
  );
}
