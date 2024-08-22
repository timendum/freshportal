import React from "react";
import type { HandleCommandType } from "./interfaces";

interface WidgetMoveProp {
  handleCommand: HandleCommandType;
}

export default function WidgetMove({ handleCommand }: WidgetMoveProp) {
  return (
    <form className="dark:boder-zinc-400 border-b border-slate-500 bg-zinc-800 p-3 dark:bg-black">
      <div className="grid grid-rows-2 justify-items-center gap-y-2 text-slate-200 lg:gap-y-3 ">
        <div className="col-span-2">
          <button
            type="button"
            onClick={() => handleCommand("move", "up")}
            className="btn-primary w-20 bg-blue-800 px-1 md:px-2"
          >
            Up
          </button>
        </div>
        <div className="justify-self-end">
          <button
            type="button"
            onClick={() => handleCommand("move", "left")}
            className="btn-primary mx-2 w-20 bg-blue-800 px-1 md:px-2"
          >
            Left
          </button>
        </div>
        <div className="justify-self-start">
          <button
            type="button"
            onClick={() => handleCommand("move", "right")}
            className="btn-primary mx-2 w-20 bg-blue-800 px-1 md:px-2"
          >
            Right
          </button>
        </div>
        <div className="col-span-2">
          <button
            type="button"
            onClick={() => handleCommand("move", "down")}
            className="btn-primary w-20 bg-blue-800 px-1 md:px-2"
          >
            Down
          </button>
        </div>
      </div>
    </form>
  );
}
