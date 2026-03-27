import React from "react";

import type { WidgetType, HandleCommandType } from "./interfaces";

import { colors } from "./utils";

interface WidgetConfigProp {
  size: WidgetType["sizeLimit"];
  wType: WidgetType["wType"];
  color: WidgetType["color"];
  handleCommand: HandleCommandType;
}

export default function WidgetConfig({ size, wType, color, handleCommand }: WidgetConfigProp) {
  const handleReset = () => {
    handleCommand({ name: "reset" });
  };
  const handleSave = (event: React.SyntheticEvent<HTMLFormElement>) => {
    event.preventDefault();
    handleCommand({ name: "save" });
  };
  return (
    <form
      className="dark:border-zinc-400 border-b border-slate-500 bg-zinc-800 p-3 dark:bg-black"
      onReset={handleReset}
      onSubmit={handleSave}
    >
      <div className="grid grid-cols-2 gap-2 text-right lg:gap-4">
        <label className="text-slate-200">Color:</label>
        <select
          defaultValue={color}
          className="input-primary"
          onChange={(e) => {
            handleCommand({ name: "color", data: e.currentTarget.value });
          }}
        >
          {colors.map((e) => (
            <option key={e} value={e} className={`widget-${e} dark:text-zinc-300`}>
              {e[0].toUpperCase() + e.substring(1)}
            </option>
          ))}
        </select>
        <label className="text-right text-slate-200">Items to display: </label>
        <input
          className="input-primary pl-1"
          onChange={(e) => {
            handleCommand({ name: "size", data: parseInt(e.currentTarget.value, 10) });
          }}
          type="number"
          min={0}
          defaultValue={size}
        />
        <label className="text-right text-slate-200">Type: </label>
        <select
          className="input-primary px-1"
          defaultValue={wType}
          onChange={(e) => {
            handleCommand({ name: "wType", data: e.currentTarget.value });
          }}
        >
          <option value="simple">Simple</option>
          <option value="excerpt">With excerpt</option>
        </select>
        <div className="col-span-2">
          <button
            className="btn-primary mx-2 bg-blue-800 px-1 text-slate-200 md:px-2"
            value="reset"
            type="reset"
          >
            Reset
          </button>
          <button
            className="btn-primary mx-2 bg-blue-800 px-1  text-slate-200 md:px-2"
            type="submit"
          >
            Save
          </button>
        </div>
      </div>
    </form>
  );
}
