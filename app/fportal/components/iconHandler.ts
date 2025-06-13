import type { FullFeed } from "../freshrss";
import type { WidgetType } from "./interfaces";

const refreshUnread = (feeds: FullFeed[], widgets: WidgetType[]) => {
  // Update the faviconc according to the unread count.
  const ids = widgets.map((w) => w.id);
  let c: string | number = feeds
    .filter((e) => ids.indexOf(e.id) > -1)
    .map((e) => e.unread)
    .reduce((a, b) => a + b, 0);
  const link = document.querySelector("link[type='image/x-icon']") as HTMLLinkElement;
  if (!link) {
    return;
  }
  if (!link.dataset.originalUrl) {
    link.dataset.originalUrl = link.href;
  }
  if (!link.dataset.blankicon) {
    // cache blank img
    const canvas = document.getElementById("faviconc") as HTMLCanvasElement;
    canvas.width = 32;
    canvas.height = 32;
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      return;
    }
    const img = new Image();
    img.src = "./faviconblank.png";
    img.onload = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);
      link.dataset.blankicon = link.href = canvas.toDataURL("image/x-icon");
      refreshUnread(feeds, widgets);
    };
    return;
  }
  if (c < 1) {
    link.href = link.dataset.originalUrl;
    document.title = "FreshRSS Portal";
    return;
  }
  document.title = `FreshRSS Portal (${c})`;
  if (c > 99) {
    c = "\u221E";
  }
  const canvas = document.getElementById("faviconc") as HTMLCanvasElement;
  canvas.width = 32;
  canvas.height = 32;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    return;
  }
  const img = new Image();
  img.src = link.dataset.blankicon;
  img.onload = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0);
    ctx.fillStyle = "#FFF";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.strokeStyle = "#8B0000";
    ctx.font = "bold 21px sans-serif";
    ctx.lineWidth = 4;
    ctx.strokeText(String(c), 16, 18);
    ctx.fillText(String(c), 16, 18);

    link.href = canvas.toDataURL("image/x-icon");
  };
};

export { refreshUnread };
