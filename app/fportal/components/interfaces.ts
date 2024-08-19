type HandleStateChangeType = (state: boolean) => void;

interface WidgetType {
  id: string;
  color: string;
  sizeLimit?: number;
  wType?: "simple" | "excerpt";
}

//type HandleCollapse = (name: "toggleCollapse") => void;
//type HandleColor = (name: "color", data: string) => void;
//type HandleConfiguring = (name: "toggleConfiguring") => void;
//type HandleSave = (name: "save") => void;
//type HandleSize = (name: "size", data: string) => void;
//type HandleReset = (name: "reset") => void;

// type HandleCommandType = HandleCollapse | HandleColor | HandleConfiguring | HandleSave | HandleSize | HandleReset;

type HandleCommandType = (name: string, data?: string) => void;

export type { HandleStateChangeType, WidgetType, HandleCommandType };
