type HandleStateChangeType = (state: boolean) => void;

interface WidgetType {
  id: string;
  color: string;
  sizeLimit?: number;
  wType?: "simple" | "excerpt";
}

type HandleCommandType = (name: string, data?: string) => void;

export type { HandleStateChangeType, WidgetType, HandleCommandType };
