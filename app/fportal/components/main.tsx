import { useEffect, useState } from "react";
import { isSortable } from "@dnd-kit/react/sortable";
import { useDroppable, useDragDropMonitor } from "@dnd-kit/react";

import { HoverableComponent } from "../HoverContext";
import { HoverContext } from "../HoverProvider";
import { freshRss, type FullFeed } from "../freshrss";
import AddWidget from "./addWidget";
import ExpImp from "./expimp";
import { refreshUnread } from "./iconHandler";
import { darkPreference, type HandleStateChangeType } from "./interfaces";
import Loading from "./loading";
import Topbar from "./topbar";
import Widget from "./widget";
import ShortcutsHelp from "./shortcutsHelp";
import useWidgetStore from "./useWidgetStore";

interface MainProp {
  handleLogin: HandleStateChangeType;
}

/** Droppable column */
function EmptyColumn({ group }: { group: string }) {
  const { ref } = useDroppable({
    id: `empty-${group}`,
    accept: "widget",
    data: { group }
  });
  return <div ref={ref} className="block min-h-full" />;
}

export default function Main({ handleLogin }: MainProp) {
  const [isAddWidget, setAddWidget] = useState(false);
  const [isExpImp, setExpImp] = useState(false);
  const [isShortcutsHelpOpen, setShortcutsHelpOpen] = useState(false);
  const { widgets, addWidget: storeAddWidget, moveWidget, updateConfig } = useWidgetStore();
  const [feeds, setFeeds] = useState<FullFeed[] | undefined>(undefined);
  const [darkMode, setDarkMode] = useState(darkPreference());
  const [hoveredComponent, setHoveredComponent] = useState<HoverableComponent | null>(null);

  /** Handle drag events */
  useDragDropMonitor({
    onDragEnd(event) {
      const { source, target } = event.operation;
      if (!source || !target) return;
      if (!isSortable(source) || !isSortable(target)) return;

      const toGroup = target.sortable.group;
      const toIndex = target.sortable.index;
      const colIndex = toGroup !== undefined ? Number(toGroup) : -1;
      if (colIndex < 0 || colIndex > 2) return;

      const sourceId = String(source.id);
      moveWidget(sourceId, colIndex, toIndex);
    }
  });

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
    const group = String(col);
    if (widgets[col].length < 1) {
      return <EmptyColumn group={group} />;
    }
    return widgets[col].map((widget, index) => {
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
        <Widget
          key={widget.id}
          feed={widgetFeed}
          config={widget}
          updateConfig={updateConfig}
          updateFeed={updateFeed}
          index={index}
          group={group}
        />
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
                const newFeeds = [...lastFeeds];
                for (const feed of updatedFeeds) {
                  const idx = newFeeds.findIndex((e) => e.id === feed.id);
                  if (idx < 0) {
                    newFeeds.push(feed);
                    continue;
                  }
                  const oldFeed = newFeeds[idx];
                  if (
                    feed.unread != oldFeed.unread ||
                    feed.newestItemTimestampUsec != oldFeed.newestItemTimestampUsec
                  ) {
                    newFeeds[idx] = feed;
                    console.debug("Changed:", feed, oldFeed);
                  }
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
