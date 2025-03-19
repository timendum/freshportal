type HandleStateChangeType = (state: boolean) => void;

const wTypes = ["simple", "excerpt"] as const;

interface WidgetType {
  id: string;
  color: string;
  sizeLimit?: number;
  wType?: (typeof wTypes)[number];
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

export { wTypes, type HandleStateChangeType, type WidgetType, type HandleCommandType };
