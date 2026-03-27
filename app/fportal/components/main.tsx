import { useEffect, useState } from "react";

import { HoverableComponent } from "../HoverContext";
import { HoverContext } from "../HoverProvider";
import { freshRss, type FullFeed } from "../freshrss";
import AddWidget from "./addWidget";
import DropWidget from "./dropWidget";
import ExpImp from "./expimp";
import { refreshUnread } from "./iconHandler";
import type { HandleStateChangeType } from "./interfaces";
import Loading from "./loading";
import Topbar from "./topbar";
import { darkPreference } from "./utils";
import Widget from "./widget";
import ShortcutsHelp from "./shortcutsHelp";
import useWidgetStore from "./useWidgetStore";

interface MainProp {
  handleLogin: HandleStateChangeType;
}

export default function Main({ handleLogin }: MainProp) {
  const [isAddWidget, setAddWidget] = useState(false);
  const [isExpImp, setExpImp] = useState(false);
  const [isShortcutsHelpOpen, setShortcutsHelpOpen] = useState(false);
  const { widgets, addWidget: storeAddWidget, moveWidget, updateConfig } = useWidgetStore();
  const [feeds, setFeeds] = useState<FullFeed[] | undefined>(undefined);
  const [darkMode, setDarkMode] = useState(darkPreference());
  const [hoveredComponent, setHoveredComponent] = useState<HoverableComponent | null>(null);
  /* Refresh unread count on widget/feed changes */
  useEffect(() => {
    if (feeds && widgets.length > 0) {
      refreshUnread(
        feeds,
        widgets.flatMap((w) => w)
      ).catch((error) => console.error("refreshUnread error", error));
    }
  }, [widgets, feeds]);
  /* On unmount, reset unread count */
  useEffect(() => {
    return () => {
      refreshUnread([], []).catch((error) => console.error("refreshUnread error", error));
    };
  }, []);

  // Capture and handle keyboard events
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") {
        return;
      }
      if (e.key === "Escape") {
        setExpImp(false);
        setShortcutsHelpOpen(false);
        setAddWidget(false);
        return;
      }
      if (isAddWidget || isExpImp || isShortcutsHelpOpen) {
        return;
      }
      if (e.key === "?") {
        setShortcutsHelpOpen((prev) => !prev);
        return;
      }
      hoveredComponent?.handleKeyboardEvent(e);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [hoveredComponent, isShortcutsHelpOpen, isAddWidget, isExpImp]);
  /* Change and persist theme */
  const changeTheme = () => {
    localStorage.setItem("FRTheme", !darkMode ? "dark" : "light");
    if (!darkMode) {
      document.body.classList.add("dark");
    } else {
      document.body.classList.remove("dark");
    }
    setDarkMode(!darkMode);
  };
  const addWidget = (id: string | null) => {
    setAddWidget(false);
    if (id) {
      storeAddWidget(id);
    }
  };
  const handleExpImp = (refresh: boolean) => {
    if (refresh) {
      window.location.replace(window.location.href);
    } else {
      setExpImp(false);
    }
  };
  const updateFeed = (feed: FullFeed) => {
    if (feeds === undefined) {
      return;
    }
    // Update a single feed, usually triggered from within the Widget with the feed
    const newFeeds = [...feeds];
    const idx = newFeeds.findIndex((e) => e.id === feed.id);
    if (idx < 0) {
      console.log("updateFeed: feed not found", feed.id);
      return;
    }
    newFeeds[idx] = feed;
    setFeeds(newFeeds);
  };
  /* Util function to generate widgets, no useMemo, because of react-compiler */
  const makeWidget = (col: number) => {
    if (widgets[col].length < 1) {
      return <DropWidget id={`empty-${col}`} move={moveWidget} />;
    }
    return widgets[col].map((widget) => {
      let widgetFeed = null;
      for (const feed of feeds || []) {
        if (feed.id === widget.id) {
          widgetFeed = feed;
          break;
        }
      }
      if (!widgetFeed) {
        return (
          <div key={widget.id} className="rounded-md border-2 border-red-500 md:px-0.5 lg:px-1">
            {" "}
            <div className="dark:text-zinc-300">Feed {widget.id} not found</div>
          </div>
        );
      }
      return (
        <div key={widget.id}>
          <Widget
            feed={widgetFeed}
            config={widget}
            updateConfig={updateConfig}
            updateFeed={updateFeed}
            move={moveWidget}
          />
        </div>
      );
    });
  };
  /* Init feeds and setup refresh */
  useEffect(() => {
    let intervalId: ReturnType<typeof setTimeout> | undefined;
    let lastFeeds: FullFeed[] = [];
    freshRss
      .getFeedsFull()
      .then((newFeeds) => {
        lastFeeds = newFeeds;
        setFeeds(newFeeds);
        intervalId = setInterval(
          () => {
            console.debug("Trigger refresh");
            freshRss
              .getFeedsFull()
              .then((updatedFeeds) => {
                /* This function changes the feed objects in `feeds` ONLY
            if the object is in a different state (ie: unread count or update timestamp).
            If the object is the same, React will not trigger the update and so the API call.
          */
                const newFeeds = [...lastFeeds]; // Create a new array, so it will perform Main refresh/redraw.
                for (const feed of updatedFeeds) {
                  const idx = newFeeds.findIndex((e) => e.id === feed.id);
                  if (idx < 0) {
                    // new feed!
                    newFeeds.push(feed);
                    continue;
                  }
                  const oldFeed = newFeeds[idx];
                  if (
                    feed.unread != oldFeed.unread ||
                    feed.newestItemTimestampUsec != oldFeed.newestItemTimestampUsec
                  ) {
                    // need refresh, so create use the new object
                    newFeeds[idx] = feed;
                    console.debug("Changed:", feed, oldFeed);
                  }
                  // else, keep the old one
                }
                lastFeeds = newFeeds;
                setFeeds(newFeeds);
              })
              .catch((error) => {
                console.error("getFeedsFull error", error);
              });
          },
          1000 * 60 * 10
        );
      })
      .catch((error) => {
        console.error("getFeedsFull error", error);
      });
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, []);
  return (
    <HoverContext value={{ setHoveredComponent }}>
      <div className="min-h-screen dark:bg-black">
        <Topbar
          handleLogin={handleLogin}
          setAddWidget={setAddWidget}
          isLoggedIn
          setExpImp={setExpImp}
          toggleDark={changeTheme}
        />
        {feeds === undefined && (
          <div className="py-5">
            <Loading />
          </div>
        )}
        {feeds !== undefined && (
          <div className="flex flex-row px-1 py-1 xl:py-3">
            <div className="flex w-1/3 flex-col gap-1 px-1 xl:gap-3 xl:px-2">{makeWidget(0)}</div>
            <div className="flex w-1/3 flex-col gap-1 px-1 xl:gap-3 xl:px-2">{makeWidget(1)}</div>
            <div className="flex w-1/3 flex-col gap-1 px-1 xl:gap-3 xl:px-2">{makeWidget(2)}</div>
          </div>
        )}
        {feeds !== undefined && (
          <AddWidget
            feeds={feeds}
            isOpen={isAddWidget}
            addWidget={addWidget}
            skip={widgets.flatMap((w) => w).map((w) => w.id)}
          />
        )}
        <ExpImp isOpen={isExpImp} doReset={handleExpImp} />
        <ShortcutsHelp
          isOpen={isShortcutsHelpOpen}
          doClose={() => {
            setShortcutsHelpOpen(false);
          }}
        />
      </div>
    </HoverContext>
  );
}
