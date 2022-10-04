import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSquarePlus,
  faFileExport,
  faRightFromBracket,
  faMoon,
  faSun
} from "@fortawesome/free-solid-svg-icons";
import { ttRss } from "../ttrss.js";

function Button({ onClick, icon, text }) {
  return (
    <button
      onClick={onClick}
      className="btn-primary inline-block px-5 py-2.5 text-xs font-medium leading-tight"
    >
      <FontAwesomeIcon icon={icon} /> {text}
    </button>
  );
}

export default function Topbar({ handleLogin, setAddWiget, toggleDark }) {
  return (
    <div className="flex bg-slate-700 px-4 py-1 text-white shadow-sm dark:text-gray-200">
      <h1 className="grow align-text-bottom text-xl">Tiny Tiny RSS</h1>
      <button
        onClick={toggleDark}
        className="btn-primary inline-block px-5 py-2.5 text-xs leading-tight"
      >
        <FontAwesomeIcon icon={faMoon} className="dark:hidden" />
        <FontAwesomeIcon icon={faSun} className="hidden dark:inline-block" />
      </button>
      <Button onClick={() => setAddWiget(true)} icon={faSquarePlus} text="Add Widget" />
      <Button icon={faFileExport} text="Export" />
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
    </div>
  );
}
