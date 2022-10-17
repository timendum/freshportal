const ttRss = {
  base: null,
  session: null,
  rootId: null,
};

function is_cat(id) {
  return parseInt(id, 10) < 100;
}

function request(op, data) {
  data = data || {};
  data.op = op;
  if (ttRss.session) {
    data.sid = ttRss.session;
  }
  return fetch(ttRss.base, {
    method: "POST",
    body: JSON.stringify(data),
    cache: "no-cache",
    mode: "cors",
  })
    .then((response) => response.json())
    .then((response) => {
      if (response.status !== 0) {
        console.log("API handled error", response);
        throw new Error(response.content.error);
      }
      return response.content;
    });
}

ttRss.isLoggedIn = () => {
  if (ttRss.base === null || ttRss.session === null) {
    return Promise.resolve(false);
  }
  return request("isLoggedIn")
    .then((data) => data.status === true)
    .catch(() => false);
};
ttRss.login = (user, pass) => {
  ttRss.session = null;
  return request("login", { user, password: pass })
    .then((resp) => {
      ttRss.session = resp.session_id;
      return true;
    })
    .catch(() => false);
};
ttRss.logout = () => request("logout")
  .then((data) => data.status === "OK")
  .catch(() => false);

ttRss.checkCategories = () => request("getCategories").then((categories) => {
  const category = categories.find((e) => e.title.toUpperCase() === "PORTAL");
  if (category) {
    ttRss.rootId = category.id;
    return true;
  }
  return false;
});
ttRss.getFeeds = () => request("getFeeds", {
  cat_id: ttRss.rootId,
  include_nested: true,
});
ttRss.getUpdatedContent = (id) => request("updateFeed", { feed_id: id });
ttRss.getContent = (id, limit, skip, onlyUnread) => {
  onlyUnread = onlyUnread || false;
  return request("getHeadlines", {
    feed_id: id,
    is_cat: is_cat(id),
    limit,
    skip,
    show_excerpt: true,
    excerpt_length: 100,
    // show_content: true,
    // all_articles, unread, adaptive, marked, updated
    view_mode: onlyUnread ? "unread" : "all_articles",
    order_by: "feed_dates", // date_reverse, feed_dates, (nothing)
  });
};
ttRss.markReadItems = (ids) => request("updateArticle", {
  article_ids: ids.join(","),
  mode: 0, // 0 - set to false, 1 - set to true, 2 - toggle
  field: 2, // 0 - starred, 1 - published, 2 - unread, 3 - article note since api level 1)
}).then((data) => data.status === "OK")
  .catch(() => false);
ttRss.markReadFeed = (id) => request("catchupFeed", {
  feed_id: id,
  is_cat: is_cat(id),
}).then((data) => data.status === "OK")
  .catch(() => false);

export default ttRss;
