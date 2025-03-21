import React from "react";
import { useDrop } from "react-dnd";

import type { DragItem, MoveWidgetType } from "./interfaces";
import { DnDWidgetType } from "./utils";

interface DropWidgetProp {
  id: string;
  move: MoveWidgetType;
}

export default function DropWidget({ id, move }: DropWidgetProp) {
  const ref = React.useRef<HTMLDivElement>(null);
  const [, drop] = useDrop<DragItem, void, void>({
    accept: DnDWidgetType,
    hover(item: DragItem) {
      const dragIndex = item.id;
      move(dragIndex, id, true);
    }
  });

  drop(ref);
  return <div ref={ref} className="block min-h-full"></div>;
}
