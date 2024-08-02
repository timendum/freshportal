import React from "react";

import Topbar from "./topbar";
import LoginForm from "./login";
import ExpImp from "./expimp";
import { darkPreference } from "./utils";

export default function MainLogin({ handleLogin }) {
  const [isExpImp, setExpImp] = React.useState(false);
  const [darkMode, setDarkMode] = React.useState(darkPreference());

  /* Change and persist theme */
  const changeTheme = () => {
    localStorage.setItem("FRTheme", !darkMode ? "dark" : "light");
    if (!darkMode) {
      document.body.classList.add("dark");
    } else {
      document.body.classList.remove("dark");
    }
    setDarkMode(!darkMode);
  };
  const handleExpImp = (refresh) => {
    if (refresh) {
      window.location.replace(window.location);
    } else {
      setExpImp(false);
    }
  };
  return (
    <div className="min-h-screen dark:bg-black">
      <Topbar
        handleLogin={handleLogin}
        setAddWiget={() => {}}
        setExpImp={setExpImp}
        isLoggedIn={false}
        toggleDark={changeTheme}
      />
      <LoginForm handleLogin={handleLogin} />
      <ExpImp open={isExpImp} doReset={handleExpImp} />
    </div>
  );
}
