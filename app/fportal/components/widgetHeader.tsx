import React from "react";
import type { HoverContextType } from "../HoverContext";
import { HoverContext } from "../HoverProvider";
import type { FullFeed } from "../freshrss";
import type { HandleCommandType } from "./interfaces";
import { faCaretDown, faCaretUp, faCircleXmark, faGear, faUpDownLeftRight } from "./icons";
import type { ConnectDragSource } from "react-dnd";

interface WidgetHeaderProp {
  feed: FullFeed;
  isCollapsed: boolean;
  handleCommand: HandleCommandType;
  drag: ConnectDragSource;
}

export default function WidgetHeader({ feed, isCollapsed, handleCommand, drag }: WidgetHeaderProp) {
  const { setHoveredComponent } = React.useContext<HoverContextType>(HoverContext);
  const ref = React.useRef<HTMLDivElement>(null);
  const hoverableComponent = {
    handleKeyboardEvent: (event: KeyboardEvent) => {
      if (event.key.toLowerCase() == "r") {
        handleCommand({ name: "readAll", data: event.shiftKey ? undefined : "current" });
      } else if (event.key.toLowerCase() == "c") {
        handleCommand({ name: "toggleCollapse" });
      }
    }
  };

  React.useEffect(() => {
    if (ref.current?.matches(":hover")) {
      setHoveredComponent(hoverableComponent);
    }
    return () => {
      setHoveredComponent(null);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isCollapsed]); // setHoveredComponent and hoveredComponent make no sense here
  return (
    <div
      className="flex dark:text-zinc-300 md:px-1"
      ref={ref}
      onMouseEnter={() => {
        setHoveredComponent(hoverableComponent);
      }}
      onMouseLeave={() => setHoveredComponent(null)}
    >
      <button
        type="button"
        className="btn-primary md:px-1 lg:px-1"
        title={isCollapsed ? "Expand" : "Collapse"}
        onClick={() => {
          handleCommand({ name: "toggleCollapse" });
        }}
      >
        {isCollapsed ? faCaretDown : faCaretUp}
      </button>
      <button
        type="button"
        disabled={feed.unread < 1}
        onClick={(e) => {
          handleCommand({ name: "readAll", data: e.ctrlKey ? "current" : undefined });
        }}
        className="btn-primary text-[1.1rem] md:px-1 lg:px-1"
        title={feed.unread > 0 ? "Mark all as read" : undefined}
      >
        {feed.unread}
      </button>
      <h4 className="grow text-lg md:px-1">
        {(() => {
          if (feed.htmlUrl) {
            return (
              <a href={feed.htmlUrl} target={`feed_${feed.id}`}>
                {feed.title}
              </a>
            );
          }
          if (feed.feeds?.length === 1) {
            return (
              <a href={feed.feeds[0].htmlUrl} target={`feed_{feed.id}`}>
                {feed.title}
              </a>
            );
          }

          return feed.title;
        })()}
      </h4>
      <button
        type="button"
        ref={(el) => {
          drag(el);
        }}
        className="btn-primary md:px-1 lg:px-1.5 text-xs cursor-move"
        title="Drag to move this widget"
      >
        {faUpDownLeftRight}
      </button>
      <button
        type="button"
        className="btn-primary md:px-1 lg:px-1.5 text-xs"
        title="Configure this widget"
        onClick={() => {
          handleCommand({ name: "toggleConfiguring" });
        }}
      >
        {faGear}
      </button>
      <button
        type="button"
        title="Remove this widget"
        className="btn-primary md:px-1 lg:px-1.5 text-xs"
        onClick={() => {
          handleCommand({ name: "remove" });
        }}
      >
        {faCircleXmark}
      </button>
    </div>
  );
}
