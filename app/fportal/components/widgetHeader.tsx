import React from "react";

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
  return (
    <div className="flex dark:text-zinc-300 md:px-1">
      <button
        type="button"
        className="btn-primary md:px-0.5 lg:px-1"
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
        className="btn-primary text-[1.1rem] md:px-0.5 lg:px-1"
        title={unread > 0 ? "Mark all as read" : ""}
      >
        {unread}
      </button>
      <h4 className="grow text-lg md:px-0.5">
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
        className="btn-primary md:px-0.5 lg:px-1 text-xs cursor-move"
        title="Drag to move this widget"
      >
        {faUpDownLeftRight}
      </button>
      <button
        type="button"
        className="btn-primary md:px-0.5 lg:px-1 text-xs"
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
        className="btn-primary md:px-0.5 lg:px-1 text-xs"
        onClick={() => {
          handleCommand("remove");
        }}
      >
        {faCircleXmark}
      </button>
    </div>
  );
}
