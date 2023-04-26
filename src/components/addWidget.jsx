import React from "react";

export default function AddWidget({ feeds, open, addWidget, skip }) {
  const ref = React.useRef();
  if (!open) {
    return null;
  }

  const handleSubmit = (event) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const id = data.get("feedId");
    addWidget(id);
  };
  feeds = feeds.filter((feed) => skip.indexOf(feed.id) === -1);
  feeds.sort((a, b) => a.title.localeCompare(b.title))
  return (
    <div
      onClick={(event) => {
        if (open && ref.current && !ref.current.contains(event.target)) {
          addWidget(null);
        }
      }}
      className="fade fixed top-0 left-0 h-full w-full overflow-y-auto overflow-x-hidden bg-neutral-400/50 outline-none"
    >
      <div
        ref={ref}
        className="mx-auto mt-20 w-1/2 justify-center rounded-xl border border-gray-800 bg-white p-4 shadow-lg dark:bg-gray-600 dark:shadow-slate-700"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <h4 className="text-lg dark:text-gray-200">Feed to be added:</h4>
          <select name="feedId" className="input-primary block w-full px-3 py-1.5">
            {feeds
              .map((feed) => (
              <option key={feed.id} value={feed.id}>
                {feed.title}
              </option>
            ))}
          </select>
          <button
            className="btn-primary w-full bg-blue-800 px-7 py-3 text-sm leading-snug text-slate-200"
            type="submit"
            disabled={feeds.length < 1}
          >
            Add
          </button>
        </form>
      </div>
    </div>
  );
}
