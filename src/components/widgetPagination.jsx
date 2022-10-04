import React from "react";

export default function WidgetPagination({ skip, sizeLimit, setSkip }) {
  const page = Math.floor(skip / sizeLimit) + 1;
  const handleChange = (toPage) => {
    setSkip((toPage - 1) * sizeLimit);
  };
  function makeButton(newPage) {
    let disabled = newPage === page;
    let text = String(newPage);
    if (newPage === 0) {
      text = "<";
      disabled = page === 1;
      newPage = page - 1;
    } else if (newPage === -1) {
      text = ">";
      newPage = page + 1;
    } else if (newPage === "…") {
      disabled = true;
    }
    let classes = "px-1 md:px-2 btn-primary mx-auto block";
    if (newPage == page) {
      classes += " bg-teal-500 dark:text-gray-600 dark:border-teal-400 dark:bg-teal-400";
    }
    return (
      <li key={text + String(newPage)} className="basis-[10%]">
        <button className={classes} disabled={disabled} onClick={() => handleChange(newPage)}>
          {text}
        </button>
      </li>
    );
  }
  return (
    <nav className="dark:boder-zinc-400 overflow-hidden border-t border-slate-500 dark:text-zinc-400">
      <ul className="mx-auto flex flex-row gap-0.5 px-1 py-1" name="md:gap-1 lg:gap-3">
        {makeButton(0)}
        {page > 1 && makeButton(1)}
        {page > 5 && makeButton("…")}
        {[page - 3, page - 2, page - 1].filter((e) => e > 1).map((e) => makeButton(e))}
        {makeButton(page)}
        {[page + 1, page + 2, page + 3, page + 4, page + 5, page + 6, page + 7]
          .filter((e) => (page < 7 && e < 9) || e - page < 3)
          .map((e) => makeButton(e))}
        {makeButton(-1)}
      </ul>
    </nav>
  );
}
