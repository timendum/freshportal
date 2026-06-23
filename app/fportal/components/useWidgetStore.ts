import { useState } from "react";
import { wColors, isWidgetList, type WidgetList, type WidgetType } from "./interfaces";

function getWidgetsFromStorage(): WidgetList {
  const sFRWidgets = localStorage.getItem("FRWidgets");
  if (!sFRWidgets) {
    localStorage.removeItem("FRWidgets");
    return [[], [], []];
  }
  const sWidgets = JSON.parse(sFRWidgets) as unknown;
  if (!isWidgetList(sWidgets)) {
    console.log("Invalid FRWidgets", sWidgets);
    localStorage.removeItem("FRWidgets");
    return [[], [], []];
  }
  if (sWidgets.length > 0) {
    console.debug("from storage", sWidgets);
    return sWidgets;
  }
  return [[], [], []];
}

export default function useWidgetStore() {
  const [widgets, setWidgets] = useState<WidgetList>(getWidgetsFromStorage);

  const saveWidgets = (newWidgets: WidgetList) => {
    const deep: WidgetList = newWidgets.map((col) => [...col]) as WidgetList;
    localStorage.setItem("FRWidgets", JSON.stringify(deep));
    setWidgets(deep);
  };

  const findWidget = (id: string): [number, number] => {
    for (let i = 0; i < widgets.length; i++) {
      const idx = widgets[i].findIndex((w) => w.id === id);
      if (idx > -1) {
        return [i, idx];
      }
    }
    return [-1, -1];
  };

  const addWidget = (id: string) => {
    const currentColors = widgets.flatMap((w) => w).map((w) => w.color);
    const missingColors = wColors.filter((e) => currentColors.indexOf(e) === -1);
    const newColor = missingColors.shift() || wColors[widgets.length % wColors.length];
    const newW: WidgetType = { id, color: newColor };
    const [c, idx] = findWidget(id);
    const newWidgets: WidgetList = [...widgets];
    if (c > -1) {
      newWidgets[c] = [...newWidgets[c]];
      newWidgets[c][idx] = newW;
    } else {
      let toC = 0;
      if (widgets[2].length < widgets[1].length && widgets[2].length < widgets[0].length) {
        toC = 2;
      } else if (widgets[1].length < widgets[0].length) {
        toC = 1;
      }
      newWidgets[toC] = [...newWidgets[toC], newW];
    }
    saveWidgets(newWidgets);
  };

  /** Move a widget from its current position to a target column and index. */
  const moveWidget = (id: string, toCol: number, toIndex: number) => {
    const [fromCol, fromIdx] = findWidget(id);
    if (fromIdx < 0) {
      console.log("moveWidget: widget not found", id);
      return;
    }
    if (fromCol === toCol && fromIdx === toIndex) {
      return; // no-op
    }
    const w = widgets[fromCol][fromIdx];
    const newWidgets: WidgetList = widgets.map((col) => [...col]) as WidgetList;
    newWidgets[fromCol].splice(fromIdx, 1);
    newWidgets[toCol].splice(toIndex, 0, w);
    saveWidgets(newWidgets);
  };

  const updateConfig = (widget: WidgetType, remove?: boolean) => {
    const [c, idx] = findWidget(widget.id);
    if (idx < 0) {
      console.log("updateConfig: widget not found", widget);
      return;
    }
    const newWidgets: WidgetList = [...widgets];
    if (remove === true) {
      newWidgets[c] = newWidgets[c].filter((_, i) => i != idx);
    } else {
      newWidgets[c] = [...newWidgets[c]];
      newWidgets[c][idx] = widget;
    }
    saveWidgets(newWidgets);
  };

  return { widgets, addWidget, moveWidget, updateConfig };
}
