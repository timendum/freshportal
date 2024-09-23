import React from "react";
import { FeedContent, freshRss, FullFeed } from "../freshrss";
import { wTypes, type WidgetType, type HandleCommandType } from "./interfaces";

import Loading from "./loading";
import WidgetConfig from "./widgetConfig";
import WidgetHeader from "./widgetHeader";
import WidgetLink from "./widgetLink";
import WidgetMove from "./widgetMove";
import WidgetPagination from "./widgetPagination";

interface WidgetProp {
  feed: FullFeed;
  config: WidgetType;
  updateConfig: (widget: WidgetType, remove?: boolean) => void;
  updateFeed: (feed: FullFeed) => void;
  move: (id: string, direction: string) => void;
}

export default function Widget({ feed, config, updateConfig, updateFeed, move }: WidgetProp) {
  const [isCollapsed, setCollapsed] = React.useState(false);
  const [isMoving, setMoving] = React.useState(false);
  const [isConfiguring, setConfiguring] = React.useState(false);
  const [sizeLimit, setSizeLimit] = React.useState(config.sizeLimit || 10);
  const [wType, setWType] = React.useState(config.wType || "excerpt");
  const [color, setColor] = React.useState(config.color || "gray");
  const [pag, setPag] = React.useState([""]);
  const [rows, setRows] = React.useState<FeedContent[]>([]);
  const { unread } = feed;
  React.useEffect(() => {
    if (!isCollapsed) {
      let c = "";
      if (pag.length > 0) {
        c = pag[pag.length - 1];
      }
      freshRss
        .getContent(feed.id, sizeLimit, c)
        .then(setRows)
        .catch((error) => {
          console.error("getContent error", error);
        });
    }
  }, [feed, pag, sizeLimit, isCollapsed]);
  const handleCommand: HandleCommandType = (
    name: HandleCommandType["name"],
    data?: string | number
  ) => {
    switch (name) {
      case "toggleCollapse":
        setCollapsed(!isCollapsed);
        break;
      case "toggleConfiguring":
        setConfiguring(!isConfiguring);
        setSizeLimit(config.sizeLimit || 10);
        setWType(config.wType || "excerpt");
        setSizeLimit(config.sizeLimit || 10);
        setColor(config.color || "gray");
        setMoving(false);
        break;
      case "size":
        if (typeof data === "string") {
          setSizeLimit(parseInt(data, 10));
        }
        break;
      case "wType": {
        const awType = wTypes.find((validName) => validName === data);
        if (awType) {
          setWType(awType);
        }
        break;
      }
      case "color":
        if (typeof data === "string") {
          setColor(data);
        }
        break;
      case "reset":
        setSizeLimit(config.sizeLimit || 10);
        setWType(config.wType || "excerpt");
        setColor(config.color || "gray");
        break;
      case "save":
        updateConfig({
          id: feed.id,
          sizeLimit,
          wType,
          color
        });
        setConfiguring(false);
        break;
      case "remove":
        updateConfig({ id: feed.id, color }, true);
        setConfiguring(false);
        break;
      case "move":
        if (typeof data === "string") {
          move(feed.id, data);
        }
        break;
      case "startMoving":
        setConfiguring(false);
        setMoving(!isMoving);
        break;
      case "readAll":
        {
          const unreadRows = rows
            .slice(0, sizeLimit)
            .filter((e) => e.categories.indexOf("user/-/state/com.google/read") === -1);
          let markAction = () =>
            freshRss.markReadFeed(feed.id).catch((error) => {
              console.error("markReadFeed error", error);
            });
          if (unreadRows.length === unread || data == "current") {
            markAction = () =>
              freshRss.markReadItems(unreadRows.map((e) => e.id)).catch((error) => {
                console.error("markReadItems error", error);
              });
          }
          markAction()
            .then(() => {
              const newRows = [...rows];
              let marked = 0;
              newRows.forEach((row) => {
                if (row.categories.indexOf("user/-/state/com.google/read") === -1) {
                  marked += 1;
                  row.categories.push("user/-/state/com.google/read");
                }
              });
              if (data != "current") {
                marked = feed.unread;
              }
              feed.unread = Math.max(0, feed.unread - marked);
              updateFeed(feed);
              setRows(newRows);
            })
            .catch((error) => {
              console.error("markAction error", error);
            });
        }
        break;
    }
  };
  const setContinuation = (c: string) => {
    const idx = pag.indexOf(c);
    if (idx > -1) {
      setPag(pag.splice(0, idx + 1));
      return;
    }
    const newPag = [...pag];
    newPag.push(c);
    setPag(newPag);
  };
  const updateLink = (id: string) => {
    for (const row of rows) {
      if (row.id === id) {
        const idx = row.categories.indexOf("user/-/state/com.google/read");
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
