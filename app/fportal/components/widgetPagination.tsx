import React from "react";

import { FeedContent } from "../freshrss";

interface WidgetPaginationProp {
  pag: string[];
  oldest: FeedContent["timestampUsec"];
  setContinuation: (c: string) => void;
}

export default function WidgetPagination({ pag, oldest, setContinuation }: WidgetPaginationProp) {
  function makeButton(newPage: number | "-" | "+" | "…" | "-…") {
    let disabled = newPage === pag.length - 1;
    let text = "";
    let tooltip: string | undefined = "Go to page " + text;
    let target: string = pag[pag.length - 1];
    if (newPage === "-") {
      text = "<";
      tooltip = "Previous page";
      if (pag.length > 1) {
        target = pag[pag.length - 2];
      } else {
        disabled = true;
      }
    } else if (newPage === "+") {
      text = ">";
      tooltip = "Next page";
      target = oldest;
    } else if (newPage === pag.length) {
      target = oldest;
    } else if (newPage === "…" || newPage === "-…") {
      text = "…";
      tooltip = undefined;
      disabled = true;
    } else if (newPage < 0) {
      text = " ";
      tooltip = undefined;
      disabled = true;
    } else {
      text = String(newPage + 1);
      target = pag[newPage];
    }
    let classes = "md:px-1 xl:px-2 btn-primary mx-auto block";
    if (newPage === pag.length - 1) {
      classes +=
        " bg-teal-500 dark:text-gray-600 dark:border-teal-400 dark:bg-teal-400 disabled:hover:bg-teal-500 disabled:hover:dark:bg-teal-400";
    }
    return (
      <li key={text + String(newPage)} className="basis-[12.5%]">
        <button
          type="button"
          title={tooltip}
          className={classes}
          disabled={disabled}
          onClick={() => setContinuation(target)}
        >
          {text}
        </button>
      </li>
    );
  }
  return (
    <nav className="dark:boder-zinc-400 overflow-hidden border-t border-slate-500 dark:text-zinc-400">
      <ul className="mx-auto flex flex-row md:px-1 md:py-1 lg:px-2">
        {makeButton("-")}
        {pag.length > 4 && makeButton(0)}
        {pag.length > 4 && makeButton("-…")}
        {(pag.length > 4 ? [1, 0] : [3, 2, 1, 0])
          .filter((e) => e < pag.length)
          .map((e) => makeButton(pag.length - e - 1))}
        {makeButton(pag.length)}
        {makeButton("…")}
        {[4, 3, 2, 1].filter((e) => e > pag.length).map((e) => makeButton(-e))}
        {makeButton("+")}
      </ul>
    </nav>
  );
}
