import React, { useState } from "react";
import he from "he";

import { ttRss } from "../ttrss.js";

export default function WidgetLink({ row, wType }) {
  const [isRead, setRead] = useState(!row.unread);
  const excerpt = he.decode(row.excerpt).trim();
  const markRead = () => {
    ttRss.markReadItem(row.id);
    setRead(true);
  };

  return (
    <li
      key={row.id}
      className={
        "truncate" + (!isRead ? " dark:text-zinc-200" : " text-slate-400 dark:text-zinc-400")
      }
    >
      <a
        href={row.link}
        target="_blank"
        className="underline"
        title={excerpt}
        rel="noreferrer"
        onClick={!isRead ? markRead : undefined}
      >
        {row.title}
      </a>
      {wType === "excerpt" ? <div className="pl-1 text-sm">{excerpt}</div> : undefined}
    </li>
  );
}
