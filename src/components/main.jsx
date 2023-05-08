import React from "react";

import { colors, darkPreference } from "./utils";
import Loading from "./loading";
import Topbar from "./topbar";
import Widget from "./widget";
import AddWidget from "./addWidget";
import ExpImp from "./expimp";
import freshRss from "../freshrss";

function setWidgetsFromStorage(setWidgets) {
  try {
    const sWidgets = JSON.parse(localStorage.getItem("FRWidgets"));
    if (sWidgets && sWidgets.length > 0) {
      console.debug("from storage", sWidgets);
      setWidgets(sWidgets);
    }
  } catch (e) {
    localStorage.removeItem("FRWidgets");
  }
}
const refreshUnread = (feeds, widgets) => {
  // Update the faviconc according to the unread count.
  const ids = widgets.map((w) => w.id);
  let c = feeds
    .filter((e) => ids.indexOf(e.id) > -1)
    .map((e) => e.unread)
    .reduce((a, b) => a + b, 0);
  const link = document.querySelector("link[type='image/x-icon']");
  if (!link.dataset.originalUrl) {
    link.dataset.originalUrl = link.href;
  }
  if (!link.dataset.blankicon) {
    // cache blank img
    const canvas = document.getElementById("faviconc");
    canvas.width = 32;
    canvas.height = 32;
    const ctx = canvas.getContext("2d");
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
  const canvas = document.getElementById("faviconc");
  canvas.width = 32;
  canvas.height = 32;
  const ctx = canvas.getContext("2d");
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
    ctx.strokeText(c, 16, 18);
    ctx.fillText(c, 16, 18);

    link.href = canvas.toDataURL("image/x-icon");
  };
};

export default function Main({ handleLogin }) {
  const [isAddWidget, setAddWiget] = React.useState(false); // is Add widget modal open?
  const [isExpImp, setExpImp] = React.useState(false); // is Export import modal open?
  const [widgets, setWidgets] = React.useState([]); // list of widgets
  const [feeds, setFeeds] = React.useState(false); // list of feeds from FreshRSS
  const [darkMode, setDarkMode] = React.useState(darkPreference());
  /* Init code for theme and widgets from configuration */
  React.useEffect(() => {
    if (feeds && widgets.length > 0) {
      refreshUnread(feeds, widgets);
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
  /* Util funct to generate widgets */
  const makeWidget = (col) =>
    widgets
      .filter((_, i) => i % 3 === col)
      .map((widget, i) => {
        if (!Object.prototype.hasOwnProperty.call(widget, "id")) {
          return <div key={`index-${i}`} />;
        }
        let widgetFeed = null;
        for (const feed of feeds) {
          if (feed.id === widget.id) {
            widgetFeed = feed;
            break;
          }
        }
        if (!widgetFeed) {
          return (
            <div key={widget.id}>
              <div>Feed not found</div>
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
  const addWidget = (id) => {
    setAddWiget(false);
    if (id) {
      const currentColors = widgets.map((w) => w.color);
      const missingColors = colors.filter((e) => currentColors.indexOf(e) === -1);
      let newColor = colors[widgets.length % colors.length];
      if (missingColors.length > 0) {
        newColor = missingColors.shift();
      }
      const newW = { id, color: newColor };
      const idx = widgets.findIndex(
        (e) => Object.prototype.hasOwnProperty.call(e, "id") && e.id == id
      );
      let newArray = [...widgets];
      if (idx > -1) {
        // widget update
        newArray[idx] = newW;
      } else {
        // new widget
        newArray = newArray.concat([newW]);
      }
      localStorage.setItem("FRWidgets", JSON.stringify(newArray));
      setWidgets(newArray);
    }
  };
  const moveWidget = (id, direction) => {
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
      const newWidgets = [...widgets];
      if (newIdx >= newWidgets.length) {
        newWidgets.push({});
      }
      [newWidgets[idx], newWidgets[newIdx]] = [newWidgets[newIdx], newWidgets[idx]];
      localStorage.setItem("FRWidgets", JSON.stringify(newWidgets));
      setWidgets(newWidgets);
    }
  };
  const handleExpImp = (refresh) => {
    if (refresh) {
      window.location.replace(window.location);
    } else {
      setExpImp(false);
    }
  };
  /* Update and persist widgets config on change */
  const updateConfig = (widget) => {
    const idx = widgets.findIndex((e) => e.id === widget.id);
    if (idx < 0) {
      console.log("updateConfig: widget not found", widget);
      return;
    }
    const newWidgets = [...widgets];
    if (widget.remove === true) {
      newWidgets.splice(idx, 1);
    } else {
      newWidgets[idx] = widget;
    }
    localStorage.setItem("FRWidgets", JSON.stringify(newWidgets));
    setWidgets(newWidgets);
  };
  const updateFeed = (feed) => {
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
    let intervalId;
    let lastFeeds = [];
    freshRss.getFeedsFull().then((newFeeds) => {
      lastFeeds = newFeeds;
      setFeeds(newFeeds);
      intervalId = setInterval(() => {
        console.debug("Trigger refresh");
        freshRss.getFeedsFull().then((updatedFeeds) => {
          /* This function changes the feed objects in `feeds` ONLY
            if the object is in a different state (ie: unread count or update timestamp).
            If the object is the same, React will not trigger the update and so the API call.
          */
          const newFeeds = [...lastFeeds]; // Create a new array, so it will perform Main refresh/redraw.
          for (const feed of updatedFeeds) {
              const idx = newFeeds.findIndex((e) => e.id === feed.id);
              if (idx < 0) {
                  // new feed!
                  newFeeds.append(feed);
              }
              const oldFeed = newFeeds[idx];
              if (feed.unread != oldFeed.unread || feed.newestItemTimestampUsec != oldFeed.newestItemTimestampUsec) {
                  // need refresh, so create use the new object
                  newFeeds[idx] = feed;
                  console.debug("Changed:", feed, oldFeed);
              }
              // else, keep the old one
          }
          lastFeeds = newFeeds;
          setFeeds(newFeeds);
        });
      }, 1000 * 60 * 10);
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
      <AddWidget
        feeds={feeds}
        open={isAddWidget}
        addWidget={addWidget}
        skip={widgets.map((w) => w.id)}
      />
      <ExpImp open={isExpImp} doReset={handleExpImp} />
    </div>
  );
}
