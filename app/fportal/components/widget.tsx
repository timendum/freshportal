import React from "react";
import { useDrag, useDrop, type XYCoord } from "react-dnd";

import { type FullFeed } from "../freshrss";
import {
  DnDWidgetType,
  wColors,
  wTypes,
  type DragItem,
  type HandleCommandType,
  type MoveWidgetType,
  type WidgetType
} from "./interfaces";
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
  move: MoveWidgetType;
}

export default function Widget({ feed, config, updateConfig, updateFeed, move }: WidgetProp) {
  const ref = React.useRef<HTMLDivElement>(null);
  const [isCollapsed, setCollapsed] = React.useState(false);
  const [isConfiguring, setConfiguring] = React.useState(false);
  const [sizeLimit, setSizeLimit] = React.useState(config.sizeLimit || 10);
  const [wType, setWType] = React.useState(config.wType || wTypes[0]);
  const [color, setColor] = React.useState(config.color || wColors[0]);
  const [pag, setPag] = React.useState([""]);
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
      case "color":
        const aColor = wColors.find((validColor) => validColor === cmd.data);
        if (aColor) {
          setColor(aColor);
        } else {
          console.error("Invalid color:", cmd.data);
        }
        break;
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
  preview(drop(ref)); // eslint-disable-line react-hooks/refs
  return (
    <div
      ref={ref}
      className={`block rounded-lg border widget-${color} shadow-md lg:border-2 ${isDragging ? "opacity-70" : ""}`}
    >
      <WidgetHeader
        feed={feed}
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
