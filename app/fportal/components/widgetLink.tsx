import React from "react";

import type { HoverContextType } from "../HoverContext";
import { HoverContext } from "../HoverProvider";
import { type FeedContent } from "../freshrss";
import type { WidgetType } from "./interfaces";

const DOM_PARSER = new DOMParser();

interface WidgetLinkProp {
  row: FeedContent;
  wType: WidgetType["wType"];
  toggleReadLink: (id: string) => void;
}

export default function WidgetLink({ row, wType, toggleReadLink }: WidgetLinkProp) {
  const { setHoveredComponent } = React.useContext<HoverContextType>(HoverContext);
  const isRead = row.categories.indexOf("user/-/state/com.google/read") > -1;
  const doc = DOM_PARSER.parseFromString(row.summary.content, "text/html");
  let excerpt = doc.getElementsByTagName("body")[0]?.textContent?.trim();
  if (excerpt && excerpt.length < 1) {
    excerpt = "\u00A0";
  }
  const markRead = () => {
    toggleReadLink(row.id);
  };

  // This workaround to ensure that the latest toggleReadLink is called,
  // even after a re-render (caused by a previous toggleReadLink for example),
  // because a stale hoverableComponent is used if the mouse is not moved after a render.
  const handlerRef = React.useRef<(event: KeyboardEvent) => void>(() => {});
  React.useEffect(() => {
    handlerRef.current = (event: KeyboardEvent) => {
      if (event.key.toLowerCase() === "r") {
        toggleReadLink(row.id);
      } else if (event.key.toLowerCase() === "o") {
        window.open(row.canonical[0].href, "_blank");
      }
    };
  }, [row.id, row.canonical, toggleReadLink]);

  const hoverableComponent = React.useMemo(
    () => ({
      handleKeyboardEvent: (event: KeyboardEvent) => {
        // handlerRef is always the latest instance, because it's a ref
        handlerRef.current(event);
      }
    }),
    []
  );

  return (
    <li
      onMouseEnter={() => {
        setHoveredComponent(hoverableComponent);
      }}
      onMouseLeave={() => setHoveredComponent(null)}
      className={`overflow-hidden whitespace-nowrap text-ellipsis ${!isRead ? "dark:text-zinc-200" : "text-slate-400 dark:text-zinc-400"}`}
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
        <div className=" pl-1 text-sm" title={excerpt}>
          {excerpt || <>&nbsp;</>}
        </div>
      ) : undefined}
    </li>
  );
}
