import { useEffect, useState } from "react";
import { freshRss, type FeedContent, type FullFeed } from "../freshrss";

const READ_TAG = "user/-/state/com.google/read";

export default function useWidgetRows(
  feed: FullFeed,
  sizeLimit: number,
  pag: string[],
  isCollapsed: boolean,
  updateFeed: (feed: FullFeed) => void
) {
  const [rows, setRows] = useState<FeedContent[]>([]);

  useEffect(() => {
    if (isCollapsed){
      return;
    }
    const c = pag.length > 0 ? pag[pag.length - 1] : "";
    freshRss
      .getContent(feed.id, sizeLimit, c)
      .then(setRows)
      .catch((error) => console.error("getContent error", error));
  }, [feed, pag, sizeLimit, isCollapsed]);

  const toggleReadLink = (id: string) => {
    const row = rows.find((r) => r.id === id);
    if (!row) {
      return;
    }
    const isRead = row.categories.indexOf(READ_TAG) !== -1;

    const action = isRead ? freshRss.markUnreadItems([row.id]) : freshRss.markReadItems([row.id]);
    action
      .then((ret) => {
        if (!ret) return;
        setRows((prev) =>
          prev.map((r) =>
            r.id === id
              ? {
                  ...r,
                  categories: isRead
                    ? r.categories.filter((c) => c !== READ_TAG)
                    : [...r.categories, READ_TAG]
                }
              : r
          )
        );
        updateFeed({ ...feed, unread: feed.unread + (isRead ? 1 : -1) });
      })
      .catch((error) => console.error("toggleRead error", error));
  };

  const markAllRead = (scope?: string) => {
    const unreadRows = rows
      .slice(0, sizeLimit)
      .filter((e) => e.categories.indexOf(READ_TAG) === -1);

    const markAction =
      unreadRows.length === feed.unread || scope === "current"
        ? () => freshRss.markReadItems(unreadRows.map((e) => e.id))
        : () => freshRss.markReadFeed(feed.id);

    markAction()
      .then((ret) => {
        if (!ret) return;
        let marked = 0;
        const newRows = rows.map((row) => {
          if (row.categories.indexOf(READ_TAG) === -1) {
            marked += 1;
            return { ...row, categories: [...row.categories, READ_TAG] };
          }
          return row;
        });
        if (scope !== "current") marked = feed.unread;
        updateFeed({ ...feed, unread: Math.max(0, feed.unread - marked) });
        setRows(newRows);
      })
      .catch((error) => console.error("markAllRead error", error));
  };

  return { rows, toggleReadLink, markAllRead };
}
