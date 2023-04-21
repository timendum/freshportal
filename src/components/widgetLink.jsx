import React from "react";
import he from "he";

import freshRss from "../freshrss";

export default function WidgetLink({ row, wType, updateLink }) {
  const isRead = row.categories.indexOf("user/-/state/com.google/read") > -1;
  const parser = new DOMParser();
  const doc = parser.parseFromString(row.summary.content, "application/xml");
  const excerpt = doc.getElementsByTagName("body")[0].textContent
  const markRead = () => {
    freshRss.markReadItems([row.id]).then(() => {
      updateLink(row.id);
    });
  };

  return (
    <li
      className={`truncate${
        !isRead ? " dark:text-zinc-200" : " text-slate-400 dark:text-zinc-400"
      }`}
    >
      <a
        href={row.canonical[0].href}
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
          {excerpt || <>&nbsp;</>}
        </div>
      ) : undefined}
    </li>
  );
}
