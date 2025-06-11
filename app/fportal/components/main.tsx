import React from "react";

import { HoverableComponent } from "../HoverContext";
import { HoverContext } from "../HoverProvider";
import { freshRss, type FullFeed } from "../freshrss";
import AddWidget from "./addWidget";
import ExpImp from "./expimp";
import { refreshUnread } from "./iconHandler";
import type { HandleStateChangeType, WidgetType } from "./interfaces";
import Loading from "./loading";
import Topbar from "./topbar";
import { colors, darkPreference } from "./utils";
import Widget from "./widget";

type setWidgetsType = (widgets: WidgetType[]) => void;

function setWidgetsFromStorage(setWidgets: setWidgetsType) {
  try {
    const sWidgets = JSON.parse(localStorage.getItem("FRWidgets") as string) as WidgetType[];
    if (sWidgets && sWidgets.length > 0) {
      console.debug("from storage", sWidgets);
      setWidgets(sWidgets);
    }
  } catch (e) {
    console.log("Weird storage reset", e);
    localStorage.removeItem("FRWidgets");
  }
}

interface MainProp {
  handleLogin: HandleStateChangeType;
}

export default function Main({ handleLogin }: MainProp) {
  const [isAddWidget, setAddWiget] = React.useState(false); // is Add widget modal open?
  const [isExpImp, setExpImp] = React.useState(false); // is Export import modal open?
  const [widgets, setWidgets] = React.useState<WidgetType[]>([]); // list of widgets
  const [feeds, setFeeds] = React.useState<FullFeed[] | false>(false); // list of feeds from FreshRSS
  const [darkMode, setDarkMode] = React.useState(darkPreference());
  const [hoveredComponent, setHoveredComponent] = React.useState<HoverableComponent | null>(null); // element under the mouse
  const saveWidgets: setWidgetsType = (widgets: WidgetType[]) => {
    const newWidgets: WidgetType[] = [];
    let fakenum = 0;
    for (const widget of widgets) {
      if (widget.id == "fake") {
        fakenum += 1;
      } else {
        fakenum = 0;
      }
      if (fakenum >= 3) {
        // a row of fakes, delete it
        newWidgets.pop();
        newWidgets.pop();
        fakenum = 0;
      } else {
        newWidgets.push(widget);
      }
    }
    while (fakenum > 0) {
      // remove fake on tail
      newWidgets.pop();
      fakenum -= 1;
    }
    localStorage.setItem("FRWidgets", JSON.stringify(newWidgets));
    setWidgets(newWidgets);
  };
  /* Init code for theme and widgets from configuration */
  React.useEffect(() => {
    if (feeds && widgets.length > 0) {
      refreshUnread(
        feeds,
        widgets.filter((w) => w.id)
      );
    }
    return () => {
      // on "unmount" set uncount = 0
      refreshUnread([], []);
    };
  }, [widgets, feeds]);
  React.useEffect(() => {
    // only on "mount", check if localStorage and restore from it
    setWidgetsFromStorage(saveWidgets);
  }, []);
  // Capture and handle keyboard events
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      hoveredComponent?.handleKeyboardEvent(e);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [hoveredComponent]);
  /* Util funct to generate widgets */
  const makeWidget = (col: number) =>
    widgets
      .filter((_, i) => i % 3 === col)
      .map((widget, i) => {
        if (widget.id == "fake") {
          return <span key={i} style={{ display: "none" }} />;
        }
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
            move={moveWidget}
          />
        );
      });
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
      const currentColors = widgets.map((w) => w.color);
      const missingColors = colors.filter((e) => currentColors.indexOf(e) === -1);
      let newColor = colors[widgets.length % colors.length];
      if (missingColors.length > 0) {
        newColor = missingColors.shift() as string;
      }
      const newW = { id, color: newColor };
      const idx = widgets.findIndex(
        (e) => Object.prototype.hasOwnProperty.call(e, "id") && e.id == id
      );
      if (idx > -1) {
        // widget update
        widgets[idx] = newW;
      } else {
        // new widget
        widgets.push(newW);
      }
      saveWidgets(widgets);
    }
  };
  const moveWidget = (id: string, direction: string) => {
    if (!id) {
      return;
    }
    const idx = widgets.findIndex((e) => e.id === id);
    if (idx < 0) {
      console.log("moveWidget: widget not found", id);
      return;
    }
    let newIdx;
    switch (direction) {
      case "up":
        if (idx >= 3) {
          newIdx = idx - 3;
        }
        break;
      case "down":
        if (idx + 3 < widgets.length) {
          newIdx = idx + 3;
        }
        break;
      case "left":
        if (idx >= 1) {
          newIdx = idx - 1;
        }
        break;
      case "right":
        if (idx % 3 !== 2) {
          newIdx = idx + 1;
        }
        break;
      default:
        console.log("moveWidget: direction unhandled", direction, id);
    }
    if (newIdx !== undefined) {
      if (newIdx >= widgets.length) {
        widgets.push({ id: "fake", color: "fake" });
      }
      [widgets[idx], widgets[newIdx]] = [widgets[newIdx], widgets[idx]];
      saveWidgets(widgets);
    }
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
    const idx = widgets.findIndex((e) => e.id === widget.id);
    if (idx < 0) {
      console.log("updateConfig: widget not found", widget);
      return;
    }
    if (remove === true) {
      widgets[idx] = { id: "fake", color: "fake" };
    } else {
      widgets[idx] = widget;
    }
    saveWidgets(widgets);
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
            skip={widgets.map((w) => w.id)}
          />
        )}
        <ExpImp open={isExpImp} doReset={handleExpImp} />
      </div>
    </HoverContext>
  );
}
