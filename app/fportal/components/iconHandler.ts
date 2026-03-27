import type { FullFeed } from "../freshrss";
import type { WidgetType } from "./interfaces";

const refreshUnread = async (feeds: FullFeed[], widgets: WidgetType[]) => {
  const count = countUnread(feeds, widgets);
  updateTitle(count);

  const link = document.querySelector("link[type='image/x-icon']") as HTMLLinkElement;
  if (!link) {
    return;
  }
  if (!link.dataset.originalUrl) {
    link.dataset.originalUrl = link.href;
  }
  if (!(await ensureBlankIcon(link))) {
    return;
  }

  if (count < 1) {
    link.href = link.dataset.originalUrl;
    return;
  }
  await drawBadge(link, count > 99 ? "\u221E" : String(count));
};

const countUnread = (feeds: FullFeed[], widgets: WidgetType[]): number => {
  const ids = widgets.map((w) => w.id);
  return feeds
    .filter((e) => ids.indexOf(e.id) > -1)
    .map((e) => e.unread)
    .reduce((a, b) => a + b, 0);
};

const updateTitle = (count: number) => {
  document.title = count < 1 ? "FreshRSS Portal" : `FreshRSS Portal (${count})`;
};

const getCanvas = (): { canvas: HTMLCanvasElement; ctx: CanvasRenderingContext2D } | null => {
  const canvas = document.getElementById("faviconc") as HTMLCanvasElement;
  canvas.width = 32;
  canvas.height = 32;
  const ctx = canvas.getContext("2d");
  return ctx ? { canvas, ctx } : null;
};

const ensureBlankIcon = async (link: HTMLLinkElement): Promise<boolean> => {
  if (link.dataset.blankicon) {
    return true;
  }
  const result = getCanvas();
  if (!result) {
    return false;
  }
  const img = await loadImage("./faviconblank.png");
  result.ctx.clearRect(0, 0, 32, 32);
  result.ctx.drawImage(img, 0, 0);
  link.dataset.blankicon = link.href = result.canvas.toDataURL("image/x-icon");
  return true;
};

const drawBadge = async (link: HTMLLinkElement, label: string) => {
  const result = getCanvas();
  if (!result) {
    return;
  }
  const img = await loadImage(link.dataset.blankicon!);
  const { ctx, canvas } = result;
  ctx.clearRect(0, 0, 32, 32);
  ctx.drawImage(img, 0, 0);
  ctx.fillStyle = "#FFF";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.strokeStyle = "#8B0000";
  ctx.font = "bold 21px sans-serif";
  ctx.lineWidth = 4;
  ctx.strokeText(label, 16, 18);
  ctx.fillText(label, 16, 18);
  link.href = canvas.toDataURL("image/x-icon");
};

let blankImg: HTMLImageElement | null = null;

const loadImage = (src: string): Promise<HTMLImageElement> => {
  if (blankImg) {
    return Promise.resolve(blankImg);
  }
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      blankImg = img;
      resolve(img);
    };
    img.onerror = reject;
    img.src = src;
  });
};

export { refreshUnread };
