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
  s?: string;
}

const freshRss: FreshRss = {
  base: null,
  session: null,
  token: null,
  isLoggedIn: function () {
    if (freshRss.base === null || freshRss.session === null) {
      return Promise.resolve(false);
    }
    return request("reader/api/0/user-info")
      .then((data) => "userId" in data)
      .catch(() => false);
  },
  login: function (user, pass) {
    return new Promise((resolve) => {
      if (!freshRss.base) {
        throw new Error("Set freshRss.base");
      }
      freshRss.session = null;
      const url = new URL("accounts/ClientLogin", freshRss.base);
      url.searchParams.append("Email", user);
      url.searchParams.append("Passwd", pass);
      resolve(
        fetch(url, {
          method: "POST",
          cache: "no-cache",
          mode: "cors"
        })
          .then((response) => response.text())
          .then((resp) => {
            const rows = resp.split("\n").map((r) => r.split("="));
            for (const row of rows) {
              if (row[0] == "Auth") {
                freshRss.session = row[1];
                return true;
              }
            }
            return false;
          })
          .catch(() => false)
      );
    });
  },
  logout: function () {
    freshRss.session = null;
    freshRss.token = null;
    localStorage.removeItem("FRSession");
    localStorage.removeItem("FRHost");
    return Promise.resolve(true);
  },
  getFeeds: function () {
    return Promise.all([
      request("reader/api/0/subscription/list"),
      request("reader/api/0/tag/list")
    ]).then(
      (
        values: [
          {
            subscriptions: {
              id: string;
              title: string;
              htmlUrl: string;
              url: string;
              categories: {
                id: string;
                label: string;
              }[];
            }[];
          },
          { tags: { id: string; type?: string }[] }
        ]
      ) => {
        const subs: Feed[] = values[0]["subscriptions"];
        const only_feeds = values[0]["subscriptions"];
        for (const tag of values[1]["tags"]) {
          if (Object.keys(tag).indexOf("type") > -1) {
            const splitted = tag.id.split("/");
            subs.push({
              id: tag.id,
              title: splitted[splitted.length - 1],
              feeds: only_feeds.filter((feed: { categories: { id: string }[] }) =>
                feed["categories"]?.find((cat: { id: string }) => cat.id == tag.id)
              )
            });
          }
        }
        return subs;
      }
    );
  },
  getContent: function (id, limit, c) {
    return request("reader/api/0/stream/contents/" + id, { n: limit, c }).then(
      (resp) => resp["items"] as FeedContent[]
    );
  },
  markReadItems: function (ids) {
    return request(
      "reader/api/0/edit-tag",
      { output: "text" },
      { i: ids, a: "user/-/state/com.google/read" },
      true
    )
      .then((resp) => resp === "OK")
      .catch(() => false);
  },
  markReadFeed: function (id) {
    return request("reader/api/0/mark-all-as-read", { output: "text" }, { s: id }, true)
      .then((data) => data === "OK")
      .catch(() => false);
  },
  getUnreads: function () {
    return request("reader/api/0/unread-count").then((resp) => {
      return resp["unreadcounts"] as UnreadFeed[];
    });
  },
  getFeedsFull: function () {
    return Promise.all([freshRss.getFeeds(), freshRss.getUnreads()]).then((values) => {
      const feeds = values[0] as FullFeed[];
      const unreads = values[1];
      for (const feed of feeds) {
        for (const unread of unreads) {
          if (unread.id == feed.id) {
            feed.unread = unread.count;
            feed.newestItemTimestampUsec = unread.newestItemTimestampUsec;
            break;
          }
        }
        if (Object.keys(feed).indexOf("unread") === -1) {
          console.error("Unread not found for ", feed);
        }
      }
      return feeds;
    });
  }
};

async function getToken(): Promise<string> {
  if (freshRss.token) {
    return Promise.resolve(freshRss.token);
  }
  const resp = await request("reader/api/0/token", { output: "text" });
  if (!resp) {
    return Promise.reject(new Error("Response null"));
  }
  freshRss.token = resp;
  if (!freshRss.token) {
    return Promise.reject(new Error("Response without token"));
  }
  return Promise.resolve(freshRss.token);
}

function request(
  path: string | URL,
  params?: Params,
  data?: RequestData,
  token?: boolean
): Promise<any> {
  token = token || false;
  data = data || {};
  if (token) {
    return getToken().then((token) => {
      data = data || {};
      const nData = data;
      nData["T"] = token;
      return request(path, params, nData, false);
    });
  }
  const headers = new Headers();
  if (freshRss.session) {
    headers.append("Authorization", "GoogleLogin auth=" + freshRss.session);
  }
  if (!freshRss.base) {
    return Promise.reject(new Error("Set freshRss.base"));
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

  return fetch(url, {
    method: "POST",
    cache: "no-cache",
    body: formData,
    mode: "cors",
    headers: headers
  }).then((response) => {
    params = params || {};
    if (params["output"] == "json") return response.json();
    else return response.text();
  });
}

export { freshRss, type Feed, type UnreadFeed, type FullFeed, type FeedContent };
