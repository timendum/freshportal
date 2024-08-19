import {
  faFileExport,
  faMoon,
  faRightFromBracket,
  faSquarePlus,
  faSun,
  IconDefinition
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React from "react";
import { freshRss } from "../freshrss";
import { HandleStateChangeType } from "./interfaces";

interface CustomButtonProps {
  onClick: React.MouseEventHandler<HTMLElement>;
  icon: IconDefinition;
  text: string;
  tooltip: string;
}

function Button({ onClick, icon, text, tooltip }: CustomButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={tooltip}
      className="btn-primary inline-block px-2 text-xs font-medium leading-tight lg:px-5"
    >
      <FontAwesomeIcon icon={icon} className="pr-1 lg:pr-2" />
      {text}
    </button>
  );
}

interface TopbarProp {
  handleLogin: HandleStateChangeType;
  isLoggedIn: boolean;
  setAddWiget: HandleStateChangeType;
  setExpImp: HandleStateChangeType;
  toggleDark: () => void;
}

export default function Topbar({
  handleLogin,
  isLoggedIn,
  setAddWiget,
  setExpImp,
  toggleDark
}: TopbarProp) {
  return (
    <div className="flex bg-slate-700 px-2 py-1 text-white shadow-sm dark:text-gray-200 dark:shadow-slate-700 lg:px-4 lg:py-2">
      <h1 className="grow align-text-bottom text-xl">
        {!!isLoggedIn && freshRss.base && (
          <a
            href={freshRss.base.substring(0, freshRss.base.length - 16)}
            title="Open FreshRSS"
            target="_blank"
            rel="noreferrer"
          >
            FreshRSS Portal
          </a>
        )}
        {!isLoggedIn && <div>FreshRSS Portal</div>}
      </h1>
      <button
        type="button"
        title="Toggle Dark mode"
        onClick={toggleDark}
        className="btn-primary inline-block px-2 text-xs leading-tight lg:px-5"
      >
        <FontAwesomeIcon icon={faMoon} className="dark:hidden" />
        <FontAwesomeIcon icon={faSun} className="hidden dark:inline-block" />
      </button>
      {!!isLoggedIn && (
        <Button
          onClick={() => setAddWiget(true)}
          icon={faSquarePlus}
          text="Add Widget"
          tooltip="Create a new widget"
        />
      )}
      <Button
        onClick={() => setExpImp(true)}
        icon={faFileExport}
        text="Export"
        tooltip="Export or import configuration"
      />
      {!!isLoggedIn && (
        <Button
          onClick={() => {
            freshRss
              .logout()
              .then((resp) => {
                if (resp) {
                  handleLogin(false);
                }
              })
              .catch((error) => {
                console.error("logout error", error);
              });
          }}
          icon={faRightFromBracket}
          tooltip="Logout"
          text="Logout"
        />
      )}
    </div>
  );
}
