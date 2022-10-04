import React from "react";

import Loading from "./loading";
import Topbar from "./topbar";
import Widget from "./widget";
import AddWidget from "./addWidget";
import { ttRss } from "../ttrss.js";

function setWidgetsFromStorage(setWidgets) {
  try {
    const sWidgets = JSON.parse(localStorage.getItem("TTRssWidgets"));
    if (sWidgets && sWidgets.length > 0) {
      console.debug("from storage", sWidgets);
      setWidgets(sWidgets);
    }
  } catch (e) {
    // pass
  }
}

export default function Main({ handleLogin }) {
  const [isAddWidget, setAddWiget] = React.useState(false);
  const [widgets, setWidgets] = React.useState([]);
  const [feeds, setFeeds] = React.useState(false);
  const [darkMode, setDarkMode] = React.useState(false);
  /* Init code for theme and widgets from configuration */
  React.useEffect(() => {
    if (
      localStorage.TTRssTheme === "dark" ||
      (!("TTRssTheme" in localStorage) && window.matchMedia("(prefers-color-scheme: dark)").matches)
    ) {
      if (!darkMode) {
        changeTheme();
      }
    }
    setWidgetsFromStorage(setWidgets);
  }, []);
  /* Util funct to generate widgets */
  const makeWidget = (col) => {
    return widgets
      .filter((_, i) => i % 3 === col)
      .map((widget) => {
        let widgetFeed = null;
        for (let feed of feeds) {
          if (parseInt(feed.id, 10) === parseInt(widget.id, 10)) {
            widgetFeed = feed;
            break;
          }
        }
        if (!widgetFeed) {
          return (
            <div key={widget.id}>
              <div>Feed not found</div>;
            </div>
          );
        }
        return (
          <Widget key={widget.id} feed={widgetFeed} config={widget} updateConfig={updateConfig} />
        );
      });
  };
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
      const newArray = [...widgets];
      setWidgets(newArray.concat([{ id: id }]));
      localStorage.setItem("TTRssWidgets", JSON.stringify(widgets.concat([{ id: id }])));
    }
  };
  /* Update and persist widgets config on change */
  const updateConfig = (widget) => {
    const idx = widgets.findIndex((e) => parseInt(e.id) === parseInt(widget.id));
    if (idx < 0) {
      console.log("updateConfig: widget not found", widget);
      return;
    }
    const newArray = [...widgets];
    if (widget.remove === true) {
      newArray.splice(idx, 1);
    } else {
      newArray[idx] = widget;
    }
    localStorage.setItem("TTRssWidgets", JSON.stringify(newArray));
    setWidgets(newArray);
  };
  /* Init feeds */
  React.useEffect(() => {
    ttRss
      .checkCategories()
      .then((resp) => {
        if (!resp) {
          return { id: null, title: "Portal category not found on TT-RSS" };
        }
        return ttRss.getFeeds();
      })
      .then((feeds) => {
        setFeeds(feeds);
        setInterval(() => {
          console.debug("Trigger refresh");
          ttRss.getFeeds().then(setFeeds);
        }, 1000 * 60 * 10);
      });
  }, []);
  return (
    <div className="min-h-screen dark:bg-black">
      <Topbar handleLogin={handleLogin} setAddWiget={setAddWiget} toggleDark={changeTheme} />

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
    </div>
  );
}
