import React from "react";
import he from "he";

import { ttRss } from "../ttrss.js";

export default function WidgetLink({ row, wType, updateLink }) {
  const isRead = !row.unread;
  const excerpt = he.decode(row.excerpt).trim();
  const markRead = () => {
    ttRss.markReadItems([row.id]).then(() => {
      updateLink(row.id);
    });
  };

  return (
    <li
      className={
        "truncate" + (!isRead ? " dark:text-zinc-200" : " text-slate-400 dark:text-zinc-400")
      }
    >
      <a
        href={row.link}
        target="_blank"
        className="underline"
        title={wType === "excerpt" ? row.title : excerpt}
        rel="noreferrer"
        onMouseDown={!isRead ? markRead : undefined}
      >
        {row.title}
      </a>
      {wType === "excerpt" ? (
        <div className="pl-1 text-sm" title={excerpt}>
          {excerpt}
        </div>
      ) : undefined}
    </li>
  );
}
