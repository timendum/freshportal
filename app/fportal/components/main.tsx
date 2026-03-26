import { useEffect, useMemo, useState } from "react";

import { HoverableComponent } from "../HoverContext";
import { HoverContext } from "../HoverProvider";
import { freshRss, type FullFeed } from "../freshrss";
import AddWidget from "./addWidget";
import DropWidget from "./dropWidget";
import ExpImp from "./expimp";
import { refreshUnread } from "./iconHandler";
import {
  isWidgetList,
  type HandleStateChangeType,
  type WidgetList,
  type WidgetType
} from "./interfaces";
import Loading from "./loading";
import Topbar from "./topbar";
import { colors, darkPreference } from "./utils";
import Widget from "./widget";
import ShortcutsHelp from "./shortcutsHelp";

type setWidgetsType = (widgets: WidgetList) => void;

function getWidgetsFromStorage(): WidgetList {
  const sFRWidgets = localStorage.getItem("FRWidgets");
  if (!sFRWidgets) {
    localStorage.removeItem("FRWidgets");
    return [[], [], []];
  }
  const sWidgets = JSON.parse(sFRWidgets) as unknown;
  if (!isWidgetList(sWidgets)) {
    console.log("Invalid FRWidgets", sWidgets);
    localStorage.removeItem("FRWidgets");
    return [[], [], []];
  }
  if (sWidgets.length > 0) {
    console.debug("from storage", sWidgets);
    return sWidgets;
  }
  return [[], [], []];
}

interface MainProp {
  handleLogin: HandleStateChangeType;
}

export default function Main({ handleLogin }: MainProp) {
  const [isAddWidget, setAddWidget] = useState(false); // is Add widget modal open?
  const [isExpImp, setExpImp] = useState(false); // is Export import modal open?
  const [isShortcutsHelpOpen, setShortcutsHelpOpen] = useState(false); // is ShortcutsHelpOpen modal open?
  const [widgets, setWidgets] = useState<WidgetList>(getWidgetsFromStorage); // list of widgets
  const [feeds, setFeeds] = useState<FullFeed[] | undefined>(undefined); // list of feeds from FreshRSS
  const [darkMode, setDarkMode] = useState(darkPreference());
  const [hoveredComponent, setHoveredComponent] = useState<HoverableComponent | null>(null); // handler from element under the mouse
  const saveWidgets: setWidgetsType = (widgets) => {
    const deep: WidgetList = widgets.map((col) => [...col]) as WidgetList;
    localStorage.setItem("FRWidgets", JSON.stringify(deep));
    setWidgets(deep);
  };
  /* Refresh unread count on widget/feed changes */
  useEffect(() => {
    if (feeds && widgets.length > 0) {
      refreshUnread(
        feeds,
        widgets.flatMap((w) => w)
      );
    }
  }, [widgets, feeds]);
  /* On unmount, reset unread count */
  useEffect(() => {
    return () => {
      refreshUnread([], []);
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
        setShortcutsHelpOpen(prev => !prev);
        return;
      }
      hoveredComponent?.handleKeyboardEvent(e);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [hoveredComponent, isShortcutsHelpOpen, isAddWidget, isExpImp]);
  /** Utility function to find a widget index by id in widgets. */
  type findWidgetType = (id: string) => [number, number];
  const findWidget: findWidgetType = (id) => {
    for (let i = 0; i < widgets.length; i++) {
      const idx = widgets[i].findIndex((w) => w.id === id);
      if (idx > -1) {
        return [i, idx];
      }
    }
    return [-1, -1];
  };
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
  /* Add widget and persist widgets config */
  const addWidget = (id: string | null) => {
    setAddWidget(false);
    if (id) {
      const currentColors = widgets.flatMap((w) => w).map((w) => w.color);
      const missingColors = colors.filter((e) => currentColors.indexOf(e) === -1);
      const newColor = missingColors.shift() || colors[widgets.length % colors.length];
      const newW: WidgetType = { id, color: newColor };
      const [c, idx] = findWidget(id);
      const newWidgets: WidgetList = [...widgets];
      if (c > -1) {
        // widget update
        newWidgets[c] = [...newWidgets[c]];
        newWidgets[c][idx] = newW;
      } else {
        // new widget
        let toC = 0;
        // check if other columns have less widgets
        if (widgets[2].length < widgets[1].length && widgets[2].length < widgets[0].length) {
          toC = 2;
        } else if (widgets[1].length < widgets[0].length) {
          toC = 1;
        }
        newWidgets[toC] = [...newWidgets[toC], newW];
      }
      saveWidgets(newWidgets);
    }
  };
  const moveWidget = (
    id: WidgetType["id"],
    to: WidgetType["id"],
    top: Parameters<Parameters<typeof Widget>[0]["move"]>[2]
  ) => {
    const [ic, idx] = findWidget(id);
    if (idx < 0) {
      console.log("moveWidget: widget not found", id);
      return;
    }
    const w = widgets[ic][idx];
    if (to.startsWith("empty-")) {
      const newWidgets: WidgetList = [...widgets];
      newWidgets[ic] = newWidgets[ic].filter((_, i) => i !== idx);
      const tc = parseInt(to.replace("empty-", ""), 10);
      newWidgets[tc] = [...newWidgets[tc], w];
      saveWidgets(newWidgets);
      return;
    }
    const [tc, tdx] = findWidget(to);
    if (tdx < 0) {
      console.log("moveWidget: widget not found", to);
      return;
    }
    const newWidgets: WidgetList = [...widgets];
    newWidgets[ic] = newWidgets[ic].filter((_, i) => i !== idx);
    const adjustedTdx = (ic === tc && idx < tdx) ? tdx - 1 : tdx;
    const position = top ? adjustedTdx : adjustedTdx + 1;
    newWidgets[tc] = [... newWidgets[tc]];
    newWidgets[tc].splice(position, 0, w);
    // console.log(id, "to", to, top);
    saveWidgets(newWidgets);
  };
  const handleExpImp = (refresh: boolean) => {
    if (refresh) {
      window.location.replace(window.location.href);
    } else {
      setExpImp(false);
    }
  };
  /* Update and persist widgets config on change */
  const updateConfig = (widget: WidgetType, remove?: boolean) => {
    const [c, idx] = findWidget(widget.id);
    if (idx < 0) {
      console.log("updateConfig: widget not found", widget);
      return;
    }
    const newWidgets: WidgetList = [...widgets];
    if (remove === true) {
      newWidgets[c] = newWidgets[c].filter((_, i) => i != idx);
    } else {
      newWidgets[c] = [...newWidgets[c]];
      newWidgets[c][idx] = widget;
    }
    saveWidgets(newWidgets);
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
            open={isAddWidget}
            addWidget={addWidget}
            skip={widgets.flatMap((w) => w).map((w) => w.id)}
          />
        )}
        <ExpImp open={isExpImp} doReset={handleExpImp} />
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
