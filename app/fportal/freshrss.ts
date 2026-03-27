/* eslint @typescript-eslint/no-unsafe-member-access: "off", @typescript-eslint/no-unsafe-assignment: "off", @typescript-eslint/no-explicit-any: "off" */

interface Feed {
  id: string;
  title: string;
  htmlUrl?: string;
  feeds?: Feed[];
}

interface UnreadFeed {
  id: string;
  count: number;
  newestItemTimestampUsec: string;
}

interface FullFeed extends Feed {
  unread: number;
  newestItemTimestampUsec: string;
}

interface FeedContentSummary {
  content: string;
}

interface FeedContentCanonical {
  href: string;
}

interface FeedContent {
  id: string;
  title: string;
  categories: string[];
  timestampUsec: string;
  canonical: FeedContentCanonical[];
  summary: FeedContentSummary;
}

interface FreshRss {
  base: string | null;
  session: string | null;
  token: string | null;
  isLoggedIn(): Promise<boolean>;
  login(user: string, pass: string): Promise<boolean>;
  logout(): Promise<boolean>;
  getFeeds(): Promise<Feed[]>;
  markReadFeed(id: string): Promise<boolean>;
  markReadItems(ids: string[]): Promise<boolean>;
  markUnreadItems(ids: string[]): Promise<boolean>;
  getContent(id: string, limit: string | number, c: string): Promise<FeedContent[]>;
  getUnreads(): Promise<UnreadFeed[]>;
  getFeedsFull(): Promise<FullFeed[]>;
}

interface Params {
  output?: string;
  n?: string | number;
  c?: string;
}

interface RequestData {
  T?: string;
  i?: string[];
  a?: string;
  r?: string;
  s?: string;
}

const FETCH_TIMEOUT = 5000;

const freshRss: FreshRss = {
  base: null,
  session: null,
  token: null,
  isLoggedIn: async function () {
    if (freshRss.base === null || freshRss.session === null) {
      return false;
    }
    try {
      const data = await request("reader/api/0/user-info");
      return "userId" in data;
    } catch {
      return false;
    }
  },
  login: async function (user, pass) {
    if (!freshRss.base) {
      throw new Error("Set freshRss.base");
    }
    freshRss.session = null;
    const url = new URL("accounts/ClientLogin", freshRss.base);
    url.searchParams.append("Email", user);
    url.searchParams.append("Passwd", pass);
    try {
      const response = await fetch(url, {
        method: "POST",
        cache: "no-cache",
        mode: "cors",
        signal: AbortSignal.timeout(FETCH_TIMEOUT)
      });
      const resp = await response.text();
      const rows = resp.split("\n").map((r) => r.split("="));
      for (const row of rows) {
        if (row[0] === "Auth") {
          freshRss.session = row[1];
          return true;
        }
      }
      return false;
    } catch {
      return false;
    }
  },
  logout: function () {
    freshRss.session = null;
    freshRss.token = null;
    localStorage.removeItem("FRSession");
    localStorage.removeItem("FRHost");
    return Promise.resolve(true);
  },
  getFeeds: async function () {
    const [subData, tagData]: [
      {
        subscriptions: {
          id: string;
          title: string;
          htmlUrl: string;
          url: string;
          categories: { id: string; label: string }[];
        }[];
      },
      { tags: { id: string; type?: string }[] }
    ] = await Promise.all([
      request("reader/api/0/subscription/list"),
      request("reader/api/0/tag/list")
    ]);
    const subs: Feed[] = subData["subscriptions"];
    const only_feeds = subData["subscriptions"];
    for (const tag of tagData["tags"]) {
      if ("type" in tag) {
        const splitted = tag.id.split("/");
        subs.push({
          id: tag.id,
          title: splitted[splitted.length - 1],
          feeds: only_feeds.filter((feed: { categories: { id: string }[] }) =>
            feed["categories"]?.find((cat: { id: string }) => cat.id === tag.id)
          )
        });
      }
    }
    return subs;
  },
  getContent: async function (id, limit, c) {
    const resp = await request("reader/api/0/stream/contents/" + id, { n: limit, c });
    return resp["items"] as FeedContent[];
  },
  markReadItems: async function (ids) {
    try {
      const resp = await request(
        "reader/api/0/edit-tag",
        { output: "text" },
        { i: ids, a: "user/-/state/com.google/read" },
        true
      );
      return resp === "OK";
    } catch {
      return false;
    }
  },
  markUnreadItems: async function (ids) {
    try {
      const resp = await request(
        "reader/api/0/edit-tag",
        { output: "text" },
        { i: ids, r: "user/-/state/com.google/read" },
        true
      );
      return resp === "OK";
    } catch {
      return false;
    }
  },
  markReadFeed: async function (id) {
    try {
      const data = await request(
        "reader/api/0/mark-all-as-read",
        { output: "text" },
        { s: id },
        true
      );
      return data === "OK";
    } catch {
      return false;
    }
  },
  getUnreads: async function () {
    const resp = await request("reader/api/0/unread-count");
    return resp["unreadcounts"] as UnreadFeed[];
  },
  getFeedsFull: async function () {
    const [feedList, unreadList] = await Promise.all([freshRss.getFeeds(), freshRss.getUnreads()]);
    const feeds = feedList as FullFeed[];
    const unreadMap = new Map(unreadList.map((u) => [u.id, u]));
    for (const feed of feeds) {
      const unread = unreadMap.get(feed.id);
      if (unread) {
        feed.unread = unread.count;
        feed.newestItemTimestampUsec = unread.newestItemTimestampUsec;
      } else {
        console.error("Unread not found for ", feed.id);
      }
    }
    return feeds;
  }
};

async function getToken(): Promise<string> {
  if (freshRss.token) {
    return freshRss.token;
  }
  const resp = await request("reader/api/0/token", { output: "text" });
  if (!resp) {
    throw new Error("Response null");
  }
  freshRss.token = resp;
  if (!freshRss.token) {
    throw new Error("Response without token");
  }
  return freshRss.token;
}

async function request(
  path: string | URL,
  params?: Params,
  data?: RequestData,
  token?: boolean
): Promise<any> {
  data = data || {};
  if (token) {
    data["T"] = await getToken();
  }
  const headers = new Headers();
  if (freshRss.session) {
    headers.append("Authorization", "GoogleLogin auth=" + freshRss.session);
  }
  if (!freshRss.base) {
    throw new Error("Set freshRss.base");
  }
  const url = new URL(path, freshRss.base);
  params = params || {};
  if (!("output" in params)) {
    params["output"] = "json";
  }
  for (const [key, value] of Object.entries(params)) {
    if (value instanceof Array) {
      for (const v of value) {
        url.searchParams.append(key, String(v));
      }
    } else {
      url.searchParams.append(key, String(value));
    }
  }
  const formData = new URLSearchParams();
  for (const [key, value] of Object.entries(data)) {
    if (value instanceof Array) {
      for (const v of value) {
        if (typeof v === "string") {
          formData.append(key, v);
        }
      }
    } else {
      if (typeof value === "string") {
        formData.append(key, value);
      }
    }
  }

  const response = await fetch(url, {
    method: "POST",
    cache: "no-cache",
    body: formData,
    mode: "cors",
    headers: headers,
    signal: AbortSignal.timeout(FETCH_TIMEOUT)
  });
  return params["output"] === "json" ? response.json() : response.text();
}

export { freshRss, type Feed, type UnreadFeed, type FullFeed, type FeedContent };
