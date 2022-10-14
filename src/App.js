import React from "react";

import Loading from "./components/loading";
import MainLogin from "./components/mainLogin";
import Main from "./components/main";

import ttRss from "./ttrss";
import { darkPreference } from "./components/utils";
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
  }, []);
  React.useEffect(() => {
    if (darkPreference) {
      document.body.classList.add("dark");
    }
  }, []);
  if (isLoggedIn === false) {
    return <MainLogin handleLogin={setLoggedIn} />;
  }
  if (isLoggedIn === true) {
    localStorage.setItem("TTRssSession", ttRss.session);
    localStorage.setItem("TTRssHost", ttRss.base);
    return <Main handleLogin={setLoggedIn} />;
  }
  // loading screen
  return (
    <div className="mx-auto dark:bg-black">
      <Loading />
    </div>
  );
}
