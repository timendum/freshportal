import { faSpinner } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React from "react";

export default function Loading() {
  return (
    <p className="mx-auto w-1/4 py-1 text-center dark:text-zinc-300">
      <FontAwesomeIcon className="animate-spin" icon={faSpinner} />
      &nbsp; Loading...
    </p>
  );
}
