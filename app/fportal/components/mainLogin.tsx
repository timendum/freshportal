import React from "react";

import ExpImp from "./expimp";
import type { HandleStateChangeType } from "./interfaces";
import LoginForm from "./login";
import Topbar from "./topbar";
import { darkPreference } from "./utils";

interface MainLoginProps {
  handleLogin: HandleStateChangeType;
}

export default function MainLogin({ handleLogin }: MainLoginProps) {
  const [isExpImp, setExpImp] = React.useState(false);
  const [darkMode, setDarkMode] = React.useState(false);

  React.useEffect(() => {
    setDarkMode(darkPreference());
  }, []);

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
  const handleExpImp = (refresh: boolean) => {
    if (refresh) {
      window.location.replace(window.location.href);
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
