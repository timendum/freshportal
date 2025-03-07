import {
  faFileExport,
  faRightFromBracket,
  faSquarePlus,
  IconDefinition
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React from "react";
import { freshRss } from "../freshrss";
import type { HandleStateChangeType } from "./interfaces";

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
    <div className="flex bg-slate-700 px-2 py-1 text-white shadow-xs dark:text-gray-200 dark:shadow-slate-700 lg:px-4 lg:py-2">
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
        className="btn-primary px-2 leading-tight lg:px-5"
      >
        <div className="dark:hidden">
          {/* baseline-dark-mode */}
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="1em" height="1em">
            <path
              fill="currentColor"
              d="M12 3a9 9 0 1 0 9 9c0-.46-.04-.92-.1-1.36a5.39 5.39 0 0 1-4.4 2.26a5.403 5.403 0 0 1-3.14-9.8c-.44-.06-.9-.1-1.36-.1"
            />
          </svg>
        </div>
        <div className="hidden dark:inline-block">
          {/* baseline-wb-sunny */}
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="1em" height="1em">
            <path
              fill="currentColor"
              d="m6.76 4.84l-1.8-1.79l-1.41 1.41l1.79 1.79zM4 10.5H1v2h3zm9-9.95h-2V3.5h2zm7.45 3.91l-1.41-1.41l-1.79 1.79l1.41 1.41zm-3.21 13.7l1.79 1.8l1.41-1.41l-1.8-1.79zM20 10.5v2h3v-2zm-8-5c-3.31 0-6 2.69-6 6s2.69 6 6 6s6-2.69 6-6s-2.69-6-6-6m-1 16.95h2V19.5h-2zm-7.45-3.91l1.41 1.41l1.79-1.8l-1.41-1.41z"
            />
          </svg>
        </div>
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
