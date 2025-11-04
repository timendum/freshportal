import React from "react";

interface ShortcutsHelpProps {
  isOpen: boolean;
  doClose: () => void;
}

export default function ShortcutsHelp({ isOpen, doClose }: ShortcutsHelpProps) {
  const ref = React.useRef<HTMLDivElement>(null);
  if (!isOpen) {
    return null;
  }

  return (
    <div
      onClick={(event: React.MouseEvent<HTMLElement>) => {
        if (isOpen && ref.current && !ref.current.contains(event.target as Element)) {
          doClose();
        }
      }}
      className="fade fixed left-0 top-0 h-full w-full overflow-y-auto overflow-x-hidden bg-neutral-400/50 outline-hidden"
    >
      <div
        ref={ref}
        className="mx-auto mt-20 w-4/5 justify-center rounded-xl border border-gray-800 bg-white p-4 shadow-lg dark:bg-gray-600 dark:shadow-slate-700 md:w-3/5 lg:w-1/2"
      >
        <h2 className="text-2xl dark:text-gray-200 ">Shortcuts</h2>
        <h3 className="text-lg dark:text-gray-200 py-1.5">On widgets header (colored top bar)</h3>
        <ul className="mx-1.5">
          <li className="dark:text-gray-200 py-1">
            <kbd className="keyboardKey">C</kbd>
            &nbsp; collapse the widget
          </li>
          <li className="dark:text-gray-200 py-1">
            <kbd className="keyboardKey">R</kbd>
            &nbsp; mark visible links as read
          </li>
          <li className="dark:text-gray-200 py-1">
            <kbd className="keyboardKey">R</kbd> +<kbd className="ml-1 keyboardKey">Shift</kbd>
            &nbsp; mark all link in feed as read
          </li>
        </ul>
        <h3 className="text-lg dark:text-gray-200 py-1.5">On links (widget rows)</h3>
        <ul className="mx-1.5">
          <li className="dark:text-gray-200 py-1">
            <kbd className="keyboardKey">R</kbd>
            &nbsp; toggle read
          </li>
          <li className="dark:text-gray-200 py-1">
            <kbd className="keyboardKey">O</kbd>
            &nbsp; open link in a new tab
          </li>
        </ul>
      </div>
    </div>
  );
}
