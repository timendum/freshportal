import React from "react";

import Loading from "./components/loading";
import Main from "./components/main";
import MainLogin from "./components/mainLogin";

import { darkPreference } from "./components/utils";
import { freshRss } from "./freshrss";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";

export default function App() {
  const [isLoggedIn, setLoggedIn] = React.useState<boolean | undefined>(undefined);
  React.useEffect(() => {
    try {
      freshRss.session = localStorage.getItem("FRSession");
      freshRss.base = localStorage.getItem("FRHost");
    } catch (err) {
      console.log(err);
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
    return (
      <DndProvider backend={HTML5Backend}>
        <Main handleLogin={setLoggedIn} />
      </DndProvider>
    );
  }
  // loading screen
  return (
    <div className="mx-auto dark:bg-black">
      <Loading />
    </div>
  );
}
