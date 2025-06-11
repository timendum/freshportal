import React from "react";

import type { HoverContextType } from "../HoverContext";
import { HoverContext } from "../HoverProvider";
import { freshRss, type FeedContent } from "../freshrss";
import type { WidgetType } from "./interfaces";

interface WidgetLinkProp {
  row: FeedContent;
  wType: WidgetType["wType"];
  updateLink: (id: string, state: "read" | "unread") => void;
}

export default function WidgetLink({ row, wType, updateLink }: WidgetLinkProp) {
  const { setHoveredComponent } = React.useContext<HoverContextType>(HoverContext);
  const isRead = row.categories.indexOf("user/-/state/com.google/read") > -1;
  const parser = new DOMParser();
  const doc = parser.parseFromString(row.summary.content, "text/html");
  let excerpt = doc.getElementsByTagName("body")[0]?.textContent?.trim();
  if (excerpt && excerpt.length < 1) {
    excerpt = "\u00A0";
  }
  const markRead = () => {
    freshRss
      .markReadItems([row.id])
      .then(() => {
        updateLink(row.id, "read");
      })
      .catch((error) => {
        console.error("markRead error", error);
      });
  };

  const handleKeyboard = {
    handleKeyboardEvent: (event: KeyboardEvent) => {
      if (event.key.toLowerCase() == "r") {
        if (!isRead) {
          freshRss
            .markReadItems([row.id])
            .then(() => {
              updateLink(row.id, "read");
            })
            .catch((error) => {
              console.error("markRead error", error);
            });
        } else {
          freshRss
            .markUnreadItems([row.id])
            .then(() => {
              updateLink(row.id, "unread");
            })
            .catch((error) => {
              console.error("markRead error", error);
            });
        }
      } else if (event.key.toLowerCase() == "o") {
        window.open(row.canonical[0].href, "_blank");
      }
    }
  };

  return (
    <li
      onMouseEnter={() => {
        setHoveredComponent(handleKeyboard);
      }}
      onMouseLeave={() => setHoveredComponent(null)}
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
