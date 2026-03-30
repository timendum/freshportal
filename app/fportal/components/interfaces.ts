import type { FullFeed } from "../freshrss";

type HandleStateChangeType = (state: boolean) => void;
type MoveWidgetType = (id: FullFeed["id"], to: FullFeed["id"], top: boolean) => void;

const wTypes = ["excerpt", "simple"] as const;

const wColors = ["gray", "red", "amber", "green", "amber", "teal", "indigo", "fuchsia"] as const;
// sync with globals.css

interface WidgetType {
  id: string;
  color: (typeof wColors)[number];
  sizeLimit?: number;
  wType?: (typeof wTypes)[number];
}

interface DragItem {
  id: FullFeed["id"];
  type: string;
}

type Command =
  | { name: "toggleCollapse" }
  | { name: "toggleConfiguring" }
  | { name: "size"; data: number }
  | { name: "wType"; data: string }
  | { name: "color"; data: string }
  | { name: "reset" }
  | { name: "save" }
  | { name: "remove" }
  | { name: "readAll"; data?: string };

type HandleCommandType = (cmd: Command) => void;

type WidgetList = [WidgetType[], WidgetType[], WidgetType[]];

function isWidgetType(val: unknown): val is WidgetType {
  if (typeof val !== "object" || val === null) return false;
  const obj = val as Record<string, unknown>;
  return (
    typeof obj.id === "string" &&
    typeof obj.color === "string" &&
    wColors.includes(obj.color as (typeof wColors)[number]) && 
    (obj.sizeLimit === undefined || (typeof obj.sizeLimit === "number" && obj.sizeLimit > 0)) &&
    (obj.wType === undefined || wTypes.includes(obj.wType as (typeof wTypes)[number]))
  );
}

function isWidgetList(obj: unknown): obj is WidgetList {
  return (
    Array.isArray(obj) &&
    obj.length === 3 &&
    obj.every((col: unknown) => Array.isArray(col) && col.every(isWidgetType))
  );
}

const DnDWidgetType = "WIDGET";

const darkPreference = () => {
  if (
    localStorage.FRTheme === "dark" ||
    (!("FRTheme" in localStorage) && window.matchMedia("(prefers-color-scheme: dark)").matches)
  ) {
    return true;
  }
  return false;
};

export {
  wTypes,
  wColors,
  DnDWidgetType,
  darkPreference,
  type HandleStateChangeType,
  type WidgetType,
  type Command,
  type HandleCommandType,
  type DragItem,
  type MoveWidgetType,
  type WidgetList,
  isWidgetList
};
