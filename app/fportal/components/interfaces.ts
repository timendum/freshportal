import type { FullFeed } from "../freshrss";

type HandleStateChangeType = (state: boolean) => void;
type MoveWidgetType = (id: FullFeed["id"], to: FullFeed["id"], top: boolean) => void;

const wTypes = ["simple", "excerpt"] as const;

interface WidgetType {
  id: string;
  color: string;
  sizeLimit?: number;
  wType?: (typeof wTypes)[number];
}

interface DragItem {
  id: FullFeed["id"];
  type: string;
}

type HandleCommandType = {
  (name: "toggleCollapse"): void;
  (name: "toggleConfiguring"): void;
  (name: "size", data: string): void;
  (name: "wType", data: string): void;
  (name: "color", data: WidgetType["color"]): void;
  (name: "reset"): void;
  (name: "save"): void;
  (name: "remove"): void;
  (name: "readAll", data?: string): void;
};

type WidgetList = [WidgetType[] | [], WidgetType[] | [], WidgetType[] | []];

/* eslint-disable @typescript-eslint/no-explicit-any */
function isWidgetList(obj: any): obj is WidgetList {
  /* eslint-disable
    @typescript-eslint/no-unsafe-member-access */
  return (
    Array.isArray(obj) &&
    obj.length === 3 &&
    obj.every(
      (col) =>
        Array.isArray(col) &&
        col.every(
          (widget) =>
            typeof widget === "object" &&
            typeof widget.id === "string" &&
            typeof widget.color === "string" &&
            (widget.sizeLimit === undefined ||
              (typeof widget.sizeLimit === "number" && widget.sizeLimit > 0)) &&
            (widget.wType === undefined || widget.wType == "simple" || widget.wType == "excerpt")
        )
    )
  );
}
/* eslint-enable @typescript-eslint/no-explicit-any */

export {
  wTypes,
  type HandleStateChangeType,
  type WidgetType,
  type HandleCommandType,
  type DragItem,
  type MoveWidgetType,
  type WidgetList,
  isWidgetList
};
