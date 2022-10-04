import React from "react";

export default function WidgetConfig({ size, wType, color, handleCommand }) {
  const handleReset = (event) => {
    //event.preventDefault();
    handleCommand("reset");
  };
  const handleSave = (event) => {
    event.preventDefault();
    handleCommand("save");
  };
  return (
    <form
      className="dark:boder-zinc-400 border-b border-slate-500 bg-zinc-800 p-3 dark:bg-black"
      onReset={handleReset}
      onSubmit={handleSave}
    >
      <div className="grid grid-cols-2 gap-x-4 gap-y-4 text-right">
        <label className="text-slate-200">Color:</label>
        <select
          defaultValue={color}
          className="bg-slate-100 dark:bg-slate-200"
          onChange={(e) => {
            handleCommand("color", e.currentTarget.value);
          }}
        >
          {["red", "amber", "green", "indigo", "gray", "fuchsia"].map((e) => (
            <option key={e} value={e} className={`widget-${e} dark:text-zinc-300`}>
              {e[0].toUpperCase() + e.substring(1)}
            </option>
          ))}
        </select>
        <label className="text-right text-slate-200">Items to display: </label>
        <input
          className="pl-1 dark:bg-slate-200"
          onChange={(e) => {
            handleCommand("size", e.currentTarget.value);
          }}
          type="number"
          defaultValue={size}
        />
        <label className="text-right text-slate-200">Type: </label>
        <select
          className="px-1 dark:bg-slate-200"
          defaultValue={wType}
          onChange={(e) => {
            handleCommand("wType", e.currentTarget.value);
          }}
        >
          <option value="simple">Simple</option>
          <option value="excerpt">With excerpt</option>
        </select>
        <div className="col-span-2">
          <button className="btn-primary mx-2 bg-slate-500 px-1 md:px-2" type="reset">
            Reset
          </button>
          <button className="btn-primary mx-2 bg-slate-500 px-1 md:px-2" type="submit">
            Save
          </button>
        </div>
      </div>
    </form>
  );
}
