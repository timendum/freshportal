import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowsRotate,
  faGear,
  faXmarkCircle,
  faCaretUp,
  faCaretDown,
  faUpDownLeftRight
} from "@fortawesome/free-solid-svg-icons";

export default function WidgetHeader({ feed, unread, isCollapsed, handleCommand }) {
  return (
    <div className="flex items-center	gap-px dark:text-zinc-300 md:gap-1 md:px-1">
      <button
        className="btn-primary md:px-1"
        onClick={() => {
          handleCommand("toggleCollapse");
        }}
      >
        <FontAwesomeIcon icon={isCollapsed ? faCaretUp : faCaretDown} />
      </button>
      <button
        disabled={unread < 1}
        onClick={() => {
          handleCommand("readAll");
        }}
        className="btn-primary text-[1.1rem] md:px-1"
        title="Mark all as read"
      >
        {unread}
      </button>
      <h4 className="grow text-lg">{feed.title}</h4>
      <button
        className="btn-primary md:px-1"
        onClick={() => {
          handleCommand("refresh");
        }}
      >
        <FontAwesomeIcon icon={faArrowsRotate} size="xs" />
      </button>
      <button
        className="btn-primary md:px-1"
        onClick={() => {
          handleCommand("startMoving");
        }}
      >
        <FontAwesomeIcon icon={faUpDownLeftRight} size="xs" />
      </button>
      <button
        className="btn-primary md:px-1"
        onClick={() => {
          handleCommand("toggleConfiguring");
        }}
      >
        <FontAwesomeIcon icon={faGear} size="xs" />
      </button>
      <button
        className="btn-primary md:px-1"
        onClick={() => {
          handleCommand("remove");
        }}
      >
        <FontAwesomeIcon icon={faXmarkCircle} size="xs" />
      </button>
    </div>
  );
}
