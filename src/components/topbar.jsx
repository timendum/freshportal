import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSquarePlus,
  faFileExport,
  faRightFromBracket,
  faMoon,
  faSun,
} from "@fortawesome/free-solid-svg-icons";
import ttRss from "../ttrss";

function Button({ onClick, icon, text }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="btn-primary inline-block px-2 py-1 text-xs font-medium leading-tight lg:px-5 lg:py-2.5"
    >
      <FontAwesomeIcon icon={icon} className="pr-1 lg:pr-2" />
      {text}
    </button>
  );
}

export default function Topbar({ handleLogin, isLoggedIn, setAddWiget, setExpImp, toggleDark }) {
  return (
    <div className="flex bg-slate-700 px-2 text-white shadow-sm dark:text-gray-200 dark:shadow-slate-700 lg:px-4 lg:py-1">
      <h1 className="grow align-text-bottom text-xl lg:mt-1">Tiny Tiny RSS</h1>
      <button
        type="button"
        title="Toggle Dark mode"
        onClick={toggleDark}
        className="btn-primary inline-block px-2 py-1 text-xs leading-tight lg:px-5 lg:py-2.5"
      >
        <FontAwesomeIcon icon={faMoon} className="dark:hidden" />
        <FontAwesomeIcon icon={faSun} className="hidden dark:inline-block" />
      </button>
      {!!isLoggedIn && (
        <Button onClick={() => setAddWiget(true)} icon={faSquarePlus} text="Add Widget" />
      )}
      <Button onClick={() => setExpImp(true)} icon={faFileExport} text="Export" />
      {!!isLoggedIn && (
        <Button
          onClick={() => {
            ttRss.logout().then((resp) => {
              if (resp) {
                handleLogin(false);
              }
            });
          }}
          icon={faRightFromBracket}
          text="Logout"
        />
      )}
    </div>
  );
}
