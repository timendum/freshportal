import React from "react";

import { type FullFeed, freshRss } from "../freshrss";
import AddWidget from "./addWidget";
import ExpImp from "./expimp";
import Loading from "./loading";
import Topbar from "./topbar";
import { colors, darkPreference } from "./utils";
import Widget from "./widget";

import {
  isWidgetList,
  type HandleStateChangeType,
  type WidgetList,
  type WidgetType
} from "./interfaces";
import DropWidget from "./dropWidget";

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

const refreshUnread = (feeds: FullFeed[], widgets: WidgetType[]) => {
  // Update the faviconc according to the unread count.
  const ids = widgets.map((w) => w.id);
  let c: string | number = feeds
    .filter((e) => ids.indexOf(e.id) > -1)
    .map((e) => e.unread)
    .reduce((a, b) => a + b, 0);
  const link = document.querySelector("link[type='image/x-icon']") as HTMLLinkElement;
  if (!link) {
    return;
  }
  if (!link.dataset.originalUrl) {
    link.dataset.originalUrl = link.href;
  }
  if (!link.dataset.blankicon) {
    // cache blank img
    const canvas = document.getElementById("faviconc") as HTMLCanvasElement;
    canvas.width = 32;
    canvas.height = 32;
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      return;
    }
    const img = new Image();
    img.src = "./faviconblank.png";
    img.onload = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);
      link.dataset.blankicon = link.href = canvas.toDataURL("image/x-icon");
      refreshUnread(feeds, widgets);
    };
    return;
  }
  if (c < 1) {
    link.href = link.dataset.originalUrl;
    document.title = "FreshRSS Portal";
    return;
  }
  document.title = `FreshRSS Portal (${c})`;
  if (c > 99) {
    c = "\u221E";
  }
  const canvas = document.getElementById("faviconc") as HTMLCanvasElement;
  canvas.width = 32;
  canvas.height = 32;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    return;
  }
  const img = new Image();
  img.src = link.dataset.blankicon;
  img.onload = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0);
    ctx.fillStyle = "#FFF";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.strokeStyle = "#8B0000";
    ctx.font = "bold 21px sans-serif";
    ctx.lineWidth = 4;
    ctx.strokeText(String(c), 16, 18);
    ctx.fillText(String(c), 16, 18);

    link.href = canvas.toDataURL("image/x-icon");
  };
};

interface MainProp {
  handleLogin: HandleStateChangeType;
}

export default function Main({ handleLogin }: MainProp) {
  const [isAddWidget, setAddWiget] = React.useState(false); // is Add widget modal open?
  const [isExpImp, setExpImp] = React.useState(false); // is Export import modal open?
  const [widgets, setWidgets] = React.useState<WidgetList>([[], [], []]); // list of widgets
  const [feeds, setFeeds] = React.useState<FullFeed[] | false>(false); // list of feeds from FreshRSS
  const [darkMode, setDarkMode] = React.useState(darkPreference());
  const saveWidgets: setWidgetsType = (widgets) => {
    // Generate a new array, to update the state
    const newWidgets: WidgetList = [...widgets];
    localStorage.setItem("FRWidgets", JSON.stringify(newWidgets));
    setWidgets(newWidgets);
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
        <div>
          <Widget
            key={widget.id}
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
      if (c > -1) {
        // widget update
        widgets[c][idx] = newW;
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
        widgets[toC] = newCol;
      }
      saveWidgets(widgets);
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
      widgets[ic] = widgets[ic].filter((_, i) => i != idx);
      const tc = parseInt(to[to.length - 1], 10);
      const newCol = [...widgets[tc]];
      newCol.push(w);
      widgets[tc] = newCol;
      saveWidgets(widgets);
      return;
    }
    const [tc, tdx] = findWidget(to);
    if (tdx < 0) {
      console.log("moveWidget: widget not found", to);
      return;
    }
    widgets[ic] = widgets[ic].filter((_, i) => i != idx);
    const position = top ? tdx : tdx + 1;
    const newCol = [...widgets[tc]];
    newCol.splice(position, 0, w);
    widgets[tc] = newCol;
    // console.log(id, "to", to, top);
    saveWidgets(widgets);
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
    if (remove === true) {
      widgets[c] = widgets[c].filter((_, i) => i != idx);
    } else {
      widgets[c][idx] = widget;
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
    </div>
  );
}
