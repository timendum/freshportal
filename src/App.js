import React from "react";

import Loading from "./components/loading";
import LoginPage from "./components/login";
import Main from "./components/main";

import { ttRss } from "./ttrss.js";
import "./styles.css";

export default function App() {
  const [isLoggedIn, setLoggedIn] = React.useState(null);
  React.useEffect(() => {
    try {
      ttRss.session = localStorage.getItem("TTRssSession");
      ttRss.base = localStorage.getItem("TTRssHost");
    } catch (e) {
      // pass
    }
    ttRss.isLoggedIn().then(setLoggedIn).catch(console.log);
  });
  if (isLoggedIn === false) {
    return <LoginPage handleLogin={setLoggedIn} />;
  } else if (isLoggedIn === true) {
    localStorage.setItem("TTRssSession", ttRss.session);
    localStorage.setItem("TTRssHost", ttRss.base);
    return <Main handleLogin={setLoggedIn} />;
  }
  // loading screen
  return (
    <div className="mx-auto">
      <Loading />
    </div>
  );
}
