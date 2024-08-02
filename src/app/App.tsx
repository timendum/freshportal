import React from "react";

import Loading from "./components/loading";
import MainLogin from "./components/mainLogin";
import Main from "./components/main";

import { freshRss } from "./freshrss";
import { darkPreference } from "./components/utils";

export default function App() {
  const [isLoggedIn, setLoggedIn] = React.useState<boolean>(false);
  React.useEffect(() => {
    try {
      freshRss.session = localStorage.getItem("FRSession");
      freshRss.base = localStorage.getItem("FRHost");
    } catch (e) {
      // pass
    }
    freshRss.isLoggedIn().then(setLoggedIn).catch(console.log);
  }, []);
  React.useEffect(() => {
    if (darkPreference()) {
      document.body.classList.add("dark");
    }
  }, []);
  if (isLoggedIn === false) {
    return <MainLogin handleLogin={setLoggedIn} />;
  }
  if (isLoggedIn === true) {
    if (freshRss.session && freshRss.base) {
      localStorage.setItem("FRSession", freshRss.session);
      localStorage.setItem("FRHost", freshRss.base);
    }
    return <Main handleLogin={setLoggedIn} />;
  }
  // loading screen
  return (
    <div className="mx-auto dark:bg-black">
      <Loading />
    </div>
  );
}
