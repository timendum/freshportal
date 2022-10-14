import React from "react";

import { colors, darkPreference } from "./utils";
import Loading from "./loading";
import Topbar from "./topbar";
import Widget from "./widget";
import AddWidget from "./addWidget";
import ExpImp from "./expimp";
import ttRss from "../ttrss";

function setWidgetsFromStorage(setWidgets) {
  try {
    const sWidgets = JSON.parse(localStorage.getItem("TTRssWidgets"));
    if (sWidgets && sWidgets.length > 0) {
      console.debug("from storage", sWidgets);
      setWidgets(sWidgets);
    }
  } catch (e) {
    localStorage.removeItem("TTRssWidgets");
  }
}

const refreshUnread = (feeds, widgets) => {
  const ids = widgets.map((w) => parseInt(w.id, 10));
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
    document.title = "Tiny Tiny Portal";
    return;
  }
  document.title = `Tiny Tiny Portal (${c})`;
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
  const [isAddWidget, setAddWiget] = React.useState(false);
  const [isExpImp, setExpImp] = React.useState(false);
  const [widgets, setWidgets] = React.useState([]);
  const [feeds, setFeeds] = React.useState(false);
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
    setWidgetsFromStorage(setWidgets);
  }, []);
  /* Util funct to generate widgets */
  const makeWidget = (col) => widgets
    .filter((_, i) => i % 3 === col)
    .map((widget, i) => {
      if (!Object.prototype.hasOwnProperty.call(widget, "id")) {
        return <div key={`index-${i}`} />;
      }
      let widgetFeed = null;
      for (const feed of feeds) {
        if (parseInt(feed.id, 10) === parseInt(widget.id, 10)) {
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
    localStorage.setItem("TTRssTheme", !darkMode ? "dark" : "light");
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
      const newW = [{ id, color: newColor }];
      const idx = widgets.findIndex((e) => Object.prototype.hasOwnProperty.call(e, "id"));
      let newArray = [...widgets];
      if (idx > -1) {
        // empty widget, fill first
        newArray[idx] = newW;
      } else {
        newArray = newArray.concat(newW);
      }
      localStorage.setItem("TTRssWidgets", JSON.stringify(newArray));
      setWidgets(newArray);
    }
  };
  const moveWidget = (id, direction) => {
    if (!id) {
      return;
    }
    const idx = widgets.findIndex((e) => parseInt(e.id, 10) === parseInt(id, 10));
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
      localStorage.setItem("TTRssWidgets", JSON.stringify(newWidgets));
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
    const idx = widgets.findIndex((e) => parseInt(e.id, 10) === parseInt(widget.id, 10));
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
    localStorage.setItem("TTRssWidgets", JSON.stringify(newWidgets));
    setWidgets(newWidgets);
  };
  const updateFeed = (feed) => {
    const newFeeds = [...feeds];
    const idx = newFeeds.findIndex((e) => e.id === feed.id);
    if (idx < 0) {
      console.log("updateFeed: feed not found", feed);
      return;
    }
    newFeeds[idx] = feed;
    setFeeds(newFeeds);
  };
  /* Init feeds */
  React.useEffect(() => {
    let intervalId;
    ttRss
      .checkCategories()
      .then((resp) => {
        if (!resp) {
          return { id: null, title: "Portal category not found on TT-RSS" };
        }
        return ttRss.getFeeds();
      })
      .then((newFeeds) => {
        setFeeds(newFeeds);
        intervalId = setInterval(() => {
          console.debug("Trigger refresh");
          ttRss.getFeeds().then(setFeeds);
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
        skip={widgets.map((w) => parseInt(w.id, 10))}
      />
      <ExpImp open={isExpImp} doReset={handleExpImp} />
    </div>
  );
}
