import React from "react";
import { useSortable } from "@dnd-kit/react/sortable";

import { type FullFeed } from "../freshrss";
import { wColors, wTypes, type HandleCommandType, type WidgetType } from "./interfaces";
import Loading from "./loading";
import WidgetConfig from "./widgetConfig";
import WidgetHeader from "./widgetHeader";
import WidgetLink from "./widgetLink";
import WidgetPagination from "./widgetPagination";
import useWidgetRows from "./useWidgetRows";

interface WidgetProp {
  feed: FullFeed;
  config: WidgetType;
  updateConfig: (widget: WidgetType, remove?: boolean) => void;
  updateFeed: (feed: FullFeed) => void;
  index: number;
  group: string;
}

export default function Widget({
  feed,
  config,
  updateConfig,
  updateFeed,
  index,
  group
}: WidgetProp) {
  const [isCollapsed, setCollapsed] = React.useState(false);
  const [isConfiguring, setConfiguring] = React.useState(false);
  const [sizeLimit, setSizeLimit] = React.useState(config.sizeLimit || 10);
  const [wType, setWType] = React.useState(config.wType || wTypes[0]);
  const [color, setColor] = React.useState(config.color || wColors[0]);
  const [pag, setPag] = React.useState([""]);

  const { ref, handleRef, isDragging } = useSortable({
    id: feed.id,
    index,
    group,
    type: "widget",
    accept: "widget"
  });

  const { rows, toggleReadLink, markAllRead } = useWidgetRows(
    feed,
    sizeLimit,
    pag,
    isCollapsed,
    updateFeed
  );
  const handleCommand: HandleCommandType = (cmd) => {
    switch (cmd.name) {
      case "toggleCollapse":
        setCollapsed(!isCollapsed);
        break;
      case "toggleConfiguring":
        setConfiguring(!isConfiguring);
        setSizeLimit(config.sizeLimit || 10);
        setWType(config.wType || wTypes[0]);
        setColor(config.color || wColors[0]);
        break;
      case "size":
        setSizeLimit(cmd.data);
        break;
      case "wType": {
        const awType = wTypes.find((validName) => validName === cmd.data);
        if (awType) {
          setWType(awType);
        } else {
          console.error("Invalid type:", cmd.data);
        }
        break;
      }
      case "color": {
        const aColor = wColors.find((validColor) => validColor === cmd.data);
        if (aColor) {
          setColor(aColor);
        } else {
          console.error("Invalid color:", cmd.data);
        }
        break;
      }
      case "reset":
        setSizeLimit(config.sizeLimit || 10);
        setWType(config.wType || wTypes[0]);
        setColor(config.color || "gray");
        break;
      case "save":
        updateConfig({ id: feed.id, sizeLimit, wType, color });
        setConfiguring(false);
        break;
      case "remove":
        updateConfig({ id: feed.id, color }, true);
        setConfiguring(false);
        break;
      case "readAll":
        markAllRead(cmd.data);
        break;
    }
  };
  const setContinuation = (c: string) => {
    const idx = pag.indexOf(c);
    if (idx > -1) {
      setPag(pag.slice(0, idx + 1));
      return;
    }
    setPag([...pag, c]);
  };

  return (
    <div
      ref={ref}
      className={`block rounded-lg border widget-${color} shadow-md lg:border-2 ${isDragging ? "opacity-70" : ""}`}
    >
      <WidgetHeader
        feed={feed}
        isCollapsed={isCollapsed}
        handleCommand={handleCommand}
        handleRef={handleRef}
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
                <WidgetLink key={row.id} row={row} wType={wType} toggleReadLink={toggleReadLink} />
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
