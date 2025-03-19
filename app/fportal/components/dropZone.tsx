import React from "react";
import { type WidgetType } from "./interfaces";
import { DnDWidgetType } from "./utils";

import { useDrop } from "react-dnd";

interface DropZoneProp {
  updateConfig: (widget: WidgetType, remove?: boolean) => void;
}

export default function DropZone({ updateConfig }: DropZoneProp) {
  const [{ isOver, canDrop }, drop] = useDrop(() => ({
    accept: DnDWidgetType,
    hover: console.log,
    collect: (monitor) => ({
      isOver: monitor.isOver(),
      canDrop: monitor.canDrop()
    })
  }));
  return (
    <div
      className={`h-max ${canDrop ? "h-px" : "h-[10px]"}`}
      ref={(el) => {
        drop(el);
      }}
    >
      {canDrop && `Drop here ${isOver}, ${canDrop}`}
    </div>
  );
}
