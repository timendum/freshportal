import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowsRotate,
  faGear,
  faXmarkCircle,
  faCaretUp,
  faCaretDown
} from "@fortawesome/free-solid-svg-icons";

export default function WidgetHeader({ isCollapsed, feed, handleCommand }) {
  return (
    <div className="flex gap-1 px-1 dark:text-zinc-300">
      <button
        className="btn-primary px-1"
        onClick={() => {
          handleCommand("toggleCollapse");
        }}
      >
        <FontAwesomeIcon icon={isCollapsed ? faCaretUp : faCaretDown} />
      </button>
      <button className="btn-primary text-[1.1rem]] px-1">{feed.unread}</button>
      <h4 className="grow text-lg">{feed.title}</h4>
      <button
        className="btn-primary px-1"
        onClick={() => {
          handleCommand("refresh");
        }}
      >
        <FontAwesomeIcon icon={faArrowsRotate} size="xs" />
      </button>
      <button
        className="btn-primary px-1"
        onClick={() => {
          handleCommand("toggleConfiguring");
        }}
      >
        <FontAwesomeIcon icon={faGear} size="xs" />
      </button>
      <button
        className="btn-primary px-1"
        onClick={() => {
          handleCommand("remove");
        }}
      >
        <FontAwesomeIcon icon={faXmarkCircle} size="xs" />
      </button>
    </div>
  );
}
