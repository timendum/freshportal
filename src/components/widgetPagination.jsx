import React from "react";

export default function WidgetPagination({ pag, oldest, setContinuation }) {
  function makeButton(newPage) {
    let disabled = newPage === pag.length - 1;
    let text = String(newPage + 1);
    let target = undefined;
    if (newPage === "-") {
      text = "<";
      if (pag.length > 1) {
        target = pag[pag.length - 2];
      } else {
        disabled = true;
      }
    } else if (newPage === "+") {
      text = ">";
      target = oldest;
    } else if (newPage === pag.length) {
      target = oldest;
    } else if (newPage === "…") {
      text = "…";
      disabled = true;
    } else if (newPage < 0) {
      text = " ";
      disabled = true;
    } else {
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
      <ul className="mx-auto flex flex-row gap-0.5 md:gap-1 md:px-1 md:py-1 lg:gap-3 lg:px-2">
        {makeButton("-")}
        {[3, 2, 1, 0].filter((e) => e < pag.length).map((e) => makeButton(pag.length - e - 1))}
        {makeButton(pag.length)}
        {makeButton("…")}
        {[-1, -2, -3, -4].filter((e) => -e > pag.length).map((e) => makeButton(e))}
        {makeButton("+")}
      </ul>
    </nav>
  );
}
