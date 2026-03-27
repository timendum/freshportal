import { useState } from "react";
import { isWidgetList, type WidgetList, type WidgetType } from "./interfaces";
import { colors } from "./utils";

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

  const saveWidgets = (widgets: WidgetList) => {
    const deep: WidgetList = widgets.map((col) => [...col]) as WidgetList;
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
    const missingColors = colors.filter((e) => currentColors.indexOf(e) === -1);
    const newColor = missingColors.shift() || colors[widgets.length % colors.length];
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

  const moveWidget = (id: string, to: string, top: boolean) => {
    const [ic, idx] = findWidget(id);
    if (idx < 0) {
      console.log("moveWidget: widget not found", id);
      return;
    }
    const w = widgets[ic][idx];
    if (to.startsWith("empty-")) {
      const newWidgets: WidgetList = [...widgets];
      newWidgets[ic] = newWidgets[ic].filter((_, i) => i !== idx);
      const tc = parseInt(to.replace("empty-", ""), 10);
      newWidgets[tc] = [...newWidgets[tc], w];
      saveWidgets(newWidgets);
      return;
    }
    const [tc, tdx] = findWidget(to);
    if (tdx < 0) {
      console.log("moveWidget: widget not found", to);
      return;
    }
    const newWidgets: WidgetList = [...widgets];
    newWidgets[ic] = newWidgets[ic].filter((_, i) => i !== idx);
    const adjustedTdx = ic === tc && idx < tdx ? tdx - 1 : tdx;
    const position = top ? adjustedTdx : adjustedTdx + 1;
    newWidgets[tc] = [...newWidgets[tc]];
    newWidgets[tc].splice(position, 0, w);
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
