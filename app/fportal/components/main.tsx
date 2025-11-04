import React from "react";

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

function setWidgetsFromStorage(setWidgets: setWidgetsType) {
  const sFRWidgets = localStorage.getItem("FRWidgets");
  if (!sFRWidgets) {
    localStorage.removeItem("FRWidgets");
    return;
  }
  const sWidgets = JSON.parse(sFRWidgets) as unknown;
  if (!isWidgetList(sWidgets)) {
    console.log("Invalid FRWidgets", sWidgets);
    localStorage.removeItem("FRWidgets");
    return;
  }
  if (sWidgets && sWidgets.length > 0) {
    console.debug("from storage", sWidgets);
    setWidgets(sWidgets);
  }
}

interface MainProp {
  handleLogin: HandleStateChangeType;
}

export default function Main({ handleLogin }: MainProp) {
  const [isAddWidget, setAddWiget] = React.useState(false); // is Add widget modal open?
  const [isExpImp, setExpImp] = React.useState(false); // is Export import modal open?
  const [isShortcutsHelpOpen, setShortcutsHelpOpen] = React.useState(false); // is ShortcutsHelpOpen modal open?
  const [widgets, setWidgets] = React.useState<WidgetList>([[], [], []]); // list of widgets
  const [feeds, setFeeds] = React.useState<FullFeed[] | false>(false); // list of feeds from FreshRSS
  const [darkMode, setDarkMode] = React.useState(darkPreference());
  const [hoveredComponent, setHoveredComponent] = React.useState<HoverableComponent | null>(null); // handler from element under the mouse
  const saveWidgets: setWidgetsType = (widgets) => {
    // Generate a new array, to update the state
    // const newWidgets: WidgetList = [...widgets];
    localStorage.setItem("FRWidgets", JSON.stringify(widgets));
    setWidgets(widgets);
  };
  /* Init code for theme and widgets from configuration */
  React.useEffect(() => {
    if (feeds && widgets.length > 0) {
      refreshUnread(
        feeds,
        widgets.flatMap((w) => w)
      );
    }
    return () => {
      // on "unmount" set uncount = 0
      refreshUnread([], []);
    };
  }, [widgets, feeds]);
  React.useEffect(() => {
    // only on "mount", check if localStorage and restore from it
    setWidgetsFromStorage(setWidgets);
  }, []);
  // Capture and handle keyboard events
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key == "?") {
        setShortcutsHelpOpen(!isShortcutsHelpOpen);
        return;
      }
      if (e.key == "Escape") {
        setExpImp(false);
        setShortcutsHelpOpen(false);
        setAddWiget(false);
      }
      hoveredComponent?.handleKeyboardEvent(e);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [hoveredComponent, isShortcutsHelpOpen]);
  /** Utility function to find a widget index by id in widgets. */
  type findWidgetType = (id: string) => [number, number];
  const findWidget: findWidgetType = (id) => {
    let idx = -1;
    for (const col of widgets) {
      idx = col.findIndex((w) => w.id === id);
      if (idx > -1) {
        return [widgets.indexOf(col), idx];
      }
    }
    return [-1, -1];
  };
  /* Util funct to generate widgets */
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
    setAddWiget(false);
    if (id) {
      const currentColors = widgets.flatMap((w) => w).map((w) => w.color);
      const missingColors = colors.filter((e) => currentColors.indexOf(e) === -1);
      const newColor = missingColors.shift() || colors[widgets.length % colors.length];
      const newW: WidgetType = { id, color: newColor };
      const [c, idx] = findWidget(id);
      const newWidgets: WidgetList = [...widgets];
      if (c > -1) {
        // widget update
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
        const newCol = [...widgets[toC]];
        newCol.push(newW);
        newWidgets[toC] = newCol;
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
      newWidgets[ic] = newWidgets[ic].filter((_, i) => i != idx);
      const tc = parseInt(to[to.length - 1], 10);
      const newCol = [...newWidgets[tc]];
      newCol.push(w);
      newWidgets[tc] = newCol;
      saveWidgets(newWidgets);
      return;
    }
    const [tc, tdx] = findWidget(to);
    if (tdx < 0) {
      console.log("moveWidget: widget not found", to);
      return;
    }
    const newWidgets: WidgetList = [...widgets];
    newWidgets[ic] = newWidgets[ic].filter((_, i) => i != idx);
    const position = top ? tdx : tdx + 1;
    const newCol = [...newWidgets[tc]];
    newCol.splice(position, 0, w);
    newWidgets[tc] = newCol;
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
      newWidgets[c][idx] = widget;
    }
    saveWidgets(newWidgets);
  };
  const updateFeed = (feed: FullFeed) => {
    if (feeds === false) {
      return;
    }
    // Update a single feed, usually triggered from within the Widget with the feed
    const newFeeds = [...feeds];
    const idx = newFeeds.findIndex((e) => e.id === feed.id);
    if (idx < 0) {
      console.log("updateFeed: feed not found", feed);
      return;
    }
    newFeeds[idx] = feed;
    setFeeds(newFeeds);
  };
  /* Init feeds and setup refresh */
  React.useEffect(() => {
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
          setAddWiget={setAddWiget}
          isLoggedIn
          setExpImp={setExpImp}
          toggleDark={changeTheme}
        />
        {feeds === false && (
          <div className="py-5">
            <Loading />
          </div>
        )}
        {feeds !== false && (
          <div className="flex flex-row px-1 py-1 xl:py-3">
            <div className="flex w-1/3 flex-col gap-1 px-1 xl:gap-3 xl:px-2">{makeWidget(0)}</div>
            <div className="flex w-1/3 flex-col gap-1 px-1 xl:gap-3 xl:px-2">{makeWidget(1)}</div>
            <div className="flex w-1/3 flex-col gap-1 px-1 xl:gap-3 xl:px-2">{makeWidget(2)}</div>
          </div>
        )}
        {feeds !== false && (
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
