import React from "react";

export default function WidgetHeader({ feeds, open, addWidget, skip }) {
  if (!open) {
    return <React.Fragment />;
  }
  const ref = React.useRef();

  const handleSubmit = (event) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const id = data.get("feedId");
    addWidget(id);
  };
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
        className="mx-auto mt-20 w-1/2 justify-center rounded-xl border border-gray-800 bg-white p-4 shadow-lg dark:bg-gray-600"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <h4 className="text-lg dark:text-gray-200">Feed to be added:</h4>
          <select
            name="feedId"
            className="m-0
      block
      w-full
      rounded
      border border-solid border-gray-300
      bg-slate-100
      px-3
      py-1.5
      focus:border-blue-600
      focus:bg-white focus:text-gray-700 focus:outline-none dark:bg-slate-200"
          >
            {feeds
              .filter((feed) => skip.indexOf(String(feed.id)) == -1)
              .map((feed) => {
                return (
                  <option key={feed.id} value={feed.id}>
                    {feed.title}
                  </option>
                );
              })}
          </select>
          <button
            className="w-full rounded bg-blue-800 px-7 py-3 text-sm uppercase leading-snug text-white shadow-md transition duration-150 ease-in-out hover:bg-blue-700 hover:shadow-lg focus:bg-blue-700 focus:shadow-lg focus:outline-none focus:ring-0 active:bg-blue-800 active:shadow-lg"
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
