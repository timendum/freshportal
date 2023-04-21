const freshRss = {
  base: null,
  session: null,
  token: null,
};

function getToken() {
  if (freshRss.token) {
    return Promise.resolve(freshRss.token);
  }
  return request("reader/api/0/token", {output:"text"}).then(resp => {
    freshRss.token = resp;
    return freshRss.token;
  })
}

function request(path, params, data, token) {
  token = token || false;
  if (token){
    return getToken().then((token) => {
      const nData = data;
      nData["T"] = token;
      return request(path, params, nData, false);
    })
  }
  const headers = new Headers();
  if (freshRss.session) {
    headers.append("Authorization", "GoogleLogin auth=" + freshRss.session);
  }
  const url = new URL(path, freshRss.base);
  params = params || {};
  if (!("output" in params)) {
    params["output"] = "json"
  }
  for (const [key, value] of Object.entries(params)) {
    if (value instanceof Array) {
      for (const v of value) {
        url.searchParams.append(key, v);
      }
    } else {
      url.searchParams.append(key, value);
    }
  }
  data = data || {};
  const formData = new URLSearchParams();
  for (const [key, value] of Object.entries(data)) {
    if (value instanceof Array) {
      for (const v of value) {
        formData.append(key, v);
      }
    } else {
      formData.append(key, value);
    }
  }
  
  return fetch(url, {
    method: "POST",
    cache: "no-cache",
    body: formData,
    mode: "cors",
    headers: headers,
  }).then((response) => {
      if (params["output"] == "json")
        return response.json()
      else
        return response.text()
    })
}

freshRss.isLoggedIn = () => {
  if (freshRss.base === null || freshRss.session === null) {
    return Promise.resolve(false);
  }
  return request("reader/api/0/user-info")
    .then((data) => "userId" in data)
    .catch(() => false);
};
freshRss.login = (user, pass) => {
  freshRss.session = null;
  const url = new URL("accounts/ClientLogin", freshRss.base);
  url.searchParams.append("Email", user);
  url.searchParams.append("Passwd", pass);
  return fetch(url, {
    method: "POST",
    cache: "no-cache",
    mode: "cors",
  }).then((response) => response.text())
    .then((resp) => {
      const rows = resp.split("\n").map((r) => r.split("="));
      for (let row of rows) {
        if (row[0] == "Auth") {
          freshRss.session = row[1];
          return true;
        }
      }
      return true;
    })
    .catch(() => false);
};

freshRss.getFeeds = () => request("reader/api/0/subscription/list")
  .then((resp) => resp["subscriptions"]);
freshRss.getUpdatedContent = (id) => request("updateFeed", { feed_id: id });
freshRss.getContent = (id, limit, c) => {
  return request("reader/api/0/stream/contents/" + id, {
    n: limit,
    //c,
  }).then(resp => resp["items"]);
};
freshRss.markReadItems = (ids) => request("reader/api/0/edit-tag", {output: "text"}, {
  i: ids,
  a: "user/-/state/com.google/read",
}, true).then((resp) => resp === "OK")
  .catch(() => false);
freshRss.markReadFeed = (id) => request("/reader/api/0/mark-all-as-read", {
  s: id,
}, true).then((data) => data.status === "OK")
  .catch(() => false);

export default freshRss;
