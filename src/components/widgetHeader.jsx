import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowsRotate,
  faGear,
  faXmarkCircle,
  faCaretUp,
  faCaretDown,
  faUpDownLeftRight,
} from "@fortawesome/free-solid-svg-icons";

export default function WidgetHeader({ feed, unread, isCollapsed, handleCommand }) {
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
        <FontAwesomeIcon icon={isCollapsed ? faCaretUp : faCaretDown} />
      </button>
      <button
        type="button"
        disabled={unread < 1}
        onClick={() => {
          handleCommand("readAll");
        }}
        className="btn-primary text-[1.1rem] md:px-0.5 lg:px-1"
        title={unread > 0 ? "Mark all as read" : ""}
      >
        {unread}
      </button>
      <h4 className="grow text-lg md:px-0.5">{feed.title}</h4>
      <button
        type="button"
        className="btn-primary md:px-1"
        title="Fetch new articles"
        onClick={() => {
          handleCommand("refresh");
        }}
      >
        <FontAwesomeIcon icon={faArrowsRotate} size="xs" />
      </button>
      <button
        type="button"
        className="btn-primary md:px-0.5 lg:px-1"
        title="Move this widget"
        onClick={() => {
          handleCommand("startMoving");
        }}
      >
        <FontAwesomeIcon icon={faUpDownLeftRight} size="xs" />
      </button>
      <button
        type="button"
        className="btn-primary md:px-0.5 lg:px-1"
        title="Configure this widget"
        onClick={() => {
          handleCommand("toggleConfiguring");
        }}
      >
        <FontAwesomeIcon icon={faGear} size="xs" />
      </button>
      <button
        type="button"
        title="Remove this widget"
        className="btn-primary md:px-0.5 lg:px-1"
        onClick={() => {
          handleCommand("remove");
        }}
      >
        <FontAwesomeIcon icon={faXmarkCircle} size="xs" />
      </button>
    </div>
  );
}
