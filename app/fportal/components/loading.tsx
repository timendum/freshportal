import React from "react";
import { faSpinner } from "./icons";

export default function Loading() {
  return (
    <p className="mx-auto w-1/4 py-1 text-center dark:text-zinc-300">
      {faSpinner}
      &nbsp; Loading...
    </p>
  );
}
