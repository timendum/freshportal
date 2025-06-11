import React from "react";
import type { HoverContextType } from "../HoverContext";
import { HoverContext } from "../HoverProvider";
import type { FullFeed } from "../freshrss";
import type { HandleCommandType } from "./interfaces";
import { faCaretDown, faCaretUp, faCircleXmark, faGear, faUpDownLeftRight } from "./icons";
import type { ConnectDragSource } from "react-dnd";

interface WidgetHeaderProp {
  feed: FullFeed;
  unread: FullFeed["unread"];
  isCollapsed: boolean;
  handleCommand: HandleCommandType;
  drag: ConnectDragSource;
}

export default function WidgetHeader({
  feed,
  unread,
  isCollapsed,
  handleCommand,
  drag
}: WidgetHeaderProp) {
  const hoverContextRef = React.useContext<HoverContextType>(HoverContext);

  const handleKeyboard = {
    handleKeyboardEvent: (event: KeyboardEvent) => {
      if (event.key.toLowerCase() == "r") {
        handleCommand("readAll", event.shiftKey ? undefined : "current");
      } else if (event.key.toLowerCase() == "c") {
        handleCommand("toggleCollapse");
      }
    }
  };
  return (
    <div
      className="flex dark:text-zinc-300 md:px-1"
      onMouseEnter={() => {
        hoverContextRef.setHoveredComponent(handleKeyboard);
      }}
      onMouseLeave={() => hoverContextRef.setHoveredComponent(null)}
    >
      <button
        type="button"
        className="btn-primary md:px-1 lg:px-1"
        title={isCollapsed ? "Expand" : "Collapse"}
        onClick={() => {
          handleCommand("toggleCollapse");
        }}
      >
        {isCollapsed ? faCaretUp : faCaretDown}
      </button>
      <button
        type="button"
        disabled={unread < 1}
        onClick={(e) => {
          handleCommand("readAll", e.ctrlKey ? "current" : undefined);
        }}
        className="btn-primary text-[1.1rem] md:px-1 lg:px-1"
        title={unread > 0 ? "Mark all as read" : ""}
      >
        {unread}
      </button>
      <h4 className="grow text-lg md:px-1">
        {(() => {
          if (feed.htmlUrl) {
            return (
              <a href={feed.htmlUrl} target="feed_{feed.id}">
                {feed.title}
              </a>
            );
          }
          if (feed.feeds?.length == 1) {
            return (
              <a href={feed.feeds[0].htmlUrl} target="feed_{feed.id}">
                {feed.title}
              </a>
            );
          }

          return feed.title;
        })()}
      </h4>
      {/* <button
        type="button"
        className="btn-primary md:px-1"
        title="Fetch new articles"
        onClick={() => {
          handleCommand("refresh");
        }}
      >
        <FontAwesomeIcon icon={faArrowsRotate} size="xs" />
      </button> */}
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
          handleCommand("toggleConfiguring");
        }}
      >
        {faGear}
      </button>
      <button
        type="button"
        title="Remove this widget"
        className="btn-primary md:px-1 lg:px-1.5 text-xs"
        onClick={() => {
          handleCommand("remove");
        }}
      >
        {faCircleXmark}
      </button>
    </div>
  );
}
