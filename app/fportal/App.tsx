import { useState, useEffect } from "react";

import Loading from "./components/loading";
import Main from "./components/main";
import MainLogin from "./components/mainLogin";

import { darkPreference } from "./components/interfaces";
import { freshRss } from "./freshrss";
import { DragDropProvider } from "@dnd-kit/react";

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
        <Main handleLogin={setLoggedIn} />
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
