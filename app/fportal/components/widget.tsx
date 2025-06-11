import React from "react";
import { useDrag, useDrop, type XYCoord } from "react-dnd";

import { type FeedContent, freshRss, type FullFeed } from "../freshrss";
import {
  wTypes,
  type HandleCommandType,
  type WidgetType,
  type DragItem,
  type MoveWidgetType
} from "./interfaces";

import Loading from "./loading";
import { DnDWidgetType } from "./utils";
import WidgetConfig from "./widgetConfig";
import WidgetHeader from "./widgetHeader";
import WidgetLink from "./widgetLink";
import WidgetPagination from "./widgetPagination";

interface WidgetProp {
  feed: FullFeed;
  config: WidgetType;
  updateConfig: (widget: WidgetType, remove?: boolean) => void;
  updateFeed: (feed: FullFeed) => void;
  move: MoveWidgetType;
}

export default function Widget({ feed, config, updateConfig, updateFeed, move }: WidgetProp) {
  const ref = React.useRef<HTMLDivElement>(null);
  const [isCollapsed, setCollapsed] = React.useState(false);
  const [isConfiguring, setConfiguring] = React.useState(false);
  const [sizeLimit, setSizeLimit] = React.useState(config.sizeLimit || 10);
  const [wType, setWType] = React.useState(config.wType || "excerpt");
  const [color, setColor] = React.useState(config.color || "gray");
  const [pag, setPag] = React.useState([""]);
  const [rows, setRows] = React.useState<FeedContent[]>([]);
  const { unread } = feed;
  const [{ isDragging }, drag, preview] = useDrag<DragItem, string, { isDragging: boolean }>(
    () => ({
      type: DnDWidgetType,
      item: () => {
        return { id: feed.id, type: DnDWidgetType };
      },
      collect: (monitor) => ({
        isDragging: monitor.isDragging()
      })
    })
  );
  const [, drop] = useDrop<DragItem, void, void>({
    accept: DnDWidgetType,
    hover(item: DragItem, monitor) {
      if (!ref.current) {
        return;
      }
      const dragIndex = item.id;
      const hoverIndex = feed.id;

      // Don't replace items with themselves
      if (dragIndex === hoverIndex) {
        return;
      }

      // Determine rectangle on screen
      const hoverBoundingRect = ref.current?.getBoundingClientRect();

      // Get vertical middle
      const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;

      // Determine mouse position
      const clientOffset = monitor.getClientOffset();

      // Get pixels to the top
      const hoverClientY = (clientOffset as XYCoord).y - hoverBoundingRect.top;

      let top = true;
      // Dragging second half
      if (hoverClientY > hoverMiddleY) {
        top = false;
      }
      move(dragIndex, hoverIndex, top);
    }
  });
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
      case "readAll":
        {
          const unreadRows = rows
            .slice(0, sizeLimit)
            .filter((e) => e.categories.indexOf("user/-/state/com.google/read") === -1);
          let markAction = () =>
            freshRss.markReadFeed(feed.id).catch((error) => {
              console.error("markReadFeed error", error);
              return false;
            });
          if (unreadRows.length === unread || data == "current") {
            markAction = () =>
              freshRss.markReadItems(unreadRows.map((e) => e.id)).catch((error) => {
                console.error("markReadItems error", error);
                return false;
              });
          }
          markAction()
            .then((ret) => {
              if (!ret) {
                return;
              }
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
  const updateLink = (id: string, state: "read" | "unread") => {
    for (const row of rows) {
      if (row.id === id) {
        const idx = row.categories.indexOf("user/-/state/com.google/read");
        if (idx === -1 && state === "read") {
          row.categories.push("user/-/state/com.google/read");
          feed.unread = unread - 1;
          updateFeed(feed);
          setRows(rows);
        } else if (idx != -1 && state === "unread") {
          row.categories.splice(idx, 1);
          feed.unread = unread + 1;
          updateFeed(feed);
          setRows(rows);
        }
        return;
      }
    }
  };

  preview(drop(ref));
  return (
    <div
      ref={ref}
      className={`block rounded-lg border widget-${color} shadow-md lg:border-2 ${isDragging ? "opacity-70" : ""}`}
    >
      <WidgetHeader
        feed={feed}
        unread={unread}
        isCollapsed={isCollapsed}
        handleCommand={handleCommand}
        drag={drag}
      />
      {isConfiguring && (
        <WidgetConfig size={sizeLimit} wType={wType} color={color} handleCommand={handleCommand} />
      )}
      <div className="bg-zinc-100 dark:bg-zinc-800">
        <div
          className={`transition-all motion-reduce:transition-none duration-400 ease-in-out 
          ${isCollapsed ? "max-h-0 overflow-hidden" : "max-h-screen"}`}
        >
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
