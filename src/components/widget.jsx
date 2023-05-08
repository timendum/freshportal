import React from "react";
import freshRss from "../freshrss";

import Loading from "./loading";
import WidgetHeader from "./widgetHeader";
import WidgetConfig from "./widgetConfig";
import WidgetMove from "./widgetMove";
import WidgetLink from "./widgetLink";
import WidgetPagination from "./widgetPagination";

export default function Widget({ feed, config, updateConfig, updateFeed, move }) {
  const [isCollapsed, setCollapsed] = React.useState(false);
  const [isMoving, setMoving] = React.useState(false);
  const [isConfiguring, setConfiguring] = React.useState(false);
  const [sizeLimit, setSizeLimit] = React.useState(config.sizeLimit || 10);
  const [wType, setWType] = React.useState(config.wType || "excerpt");
  const [color, setColor] = React.useState(config.color || "gray");
  const [pag, setPag] = React.useState([undefined]);
  const [rows, setRows] = React.useState([]);
  const { unread } = feed;
  React.useEffect(() => {
    if (!isCollapsed) {
      freshRss.getContent(feed.id, sizeLimit, pag[pag.length - 1], false).then(setRows);
    }
  }, [feed, pag, sizeLimit, isCollapsed]);
  const handleCommand = (name, data) => {
    if (name === "toggleCollapse") {
      setCollapsed(!isCollapsed);
    } else if (name === "toggleConfiguring") {
      setConfiguring(!isConfiguring);
      setSizeLimit(config.sizeLimit || 10);
      setWType(config.wType || "excerpt");
      setSizeLimit(config.sizeLimit || 10);
      setColor(config.color || "gray");
      setMoving(false);
    } else if (name === "size") {
      setSizeLimit(parseInt(data, 10));
    } else if (name === "wType") {
      setWType(data);
    } else if (name === "color") {
      setColor(data);
    } else if (name === "reset") {
      setSizeLimit(config.sizeLimit || 10);
      setWType(config.wType || "excerpt");
      setSizeLimit(config.sizeLimit || 10);
      setColor(config.color || "gray");
    } else if (name === "save") {
      updateConfig({
        id: feed.id,
        sizeLimit,
        wType,
        color
      });
      setConfiguring(false);
    } else if (name === "remove") {
      updateConfig({ id: feed.id, remove: true });
      setConfiguring(false);
    } else if (name === "move") {
      move(feed.id, data);
    } else if (name === "startMoving") {
      setConfiguring(false);
      setMoving(!isMoving);
    } else if (name === "readAll") {
      const unreadRows = rows.filter(
        (e) => e.categories.indexOf("user/-/state/com.google/read") === -1
      );
      let markAction = () => freshRss.markReadFeed(feed.id);
      if (unreadRows.length === unread) {
        markAction = () => freshRss.markReadItems(unreadRows.map((e) => e.id));
      }
      markAction().then(() => {
        const newRows = [...rows];
        newRows.forEach((row) => {
          if (row.categories.indexOf("user/-/state/com.google/read") === -1) {
            row.categories.push("user/-/state/com.google/read");
          }
        });
        feed.unread = 0;
        updateFeed(feed);
        setRows(newRows);
      });
    }
  };
  const setContinuation = (c) => {
    const idx = pag.indexOf(c);
    if (idx > -1) {
      setPag(pag.splice(0, idx + 1));
      return;
    }
    const newPag = [...pag];
    newPag.push(c);
    setPag(newPag);
  };
  const updateLink = (id) => {
    for (const row of rows) {
      if (row.id === id) {
        let idx = row.categories.indexOf("user/-/state/com.google/read");
        if (idx === -1) {
          row.categories.push("user/-/state/com.google/read");
          feed.unread = unread - 1;
          updateFeed(feed);
          setRows(rows);
          break;
        }
        return;
      }
    }
  };

  return (
    <div className={`block rounded-lg border widget-${color} shadow-md lg:border-2`}>
      <WidgetHeader
        feed={feed}
        unread={unread}
        isCollapsed={isCollapsed}
        handleCommand={handleCommand}
      />
      {isConfiguring && (
        <WidgetConfig size={sizeLimit} wType={wType} color={color} handleCommand={handleCommand} />
      )}
      {isMoving && <WidgetMove handleCommand={handleCommand} />}
      <div className="bg-zinc-100 dark:bg-zinc-800">
        <div className={isCollapsed ? "hidden" : "box"}>
          {rows.length < 1 && <Loading />}
          {rows.length > 0 && (
            <ul className="px-1 lg:space-y-1 xl:p-2 xl:px-3">
              {rows.slice(0, sizeLimit).map((row) => (
                <WidgetLink key={row.id} row={row} wType={wType} updateLink={updateLink} />
              ))}
            </ul>
          )}
          {rows.length >= sizeLimit && (
            <WidgetPagination
              pag={pag}
              oldest={rows[sizeLimit - 1].timestampUsec}
              setContinuation={setContinuation}
            />
          )}
        </div>
      </div>
    </div>
  );
}
