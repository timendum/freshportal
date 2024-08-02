import React from "react";

interface LocalStoragePerf {
  widgets?: string;
  session?: string;
  base?: string;
  theme?: string;
}
interface ExpImpProps {
  open: boolean;
  doReset(arg0: boolean): void;
}

export default function ExpImp({ open, doReset }: ExpImpProps) {
  const ref = React.useRef<HTMLDivElement>(null);
  if (!open) {
    return null;
  }
  const localData: LocalStoragePerf = {};
  let ld = localStorage.getItem("FRWidgets");
  if (ld) {
    localData.widgets = JSON.parse(ld);
  }
  ld = localStorage.getItem("FRSession");
  if (ld) {
    localData.session = ld;
  }
  ld = localStorage.getItem("FRHost");
  if (ld) {
    localData.base = ld;
  }
  ld = localStorage.getItem("FRTheme");
  if (ld) {
    localData.theme = ld;
  }

  const handleSubmit = (event: React.SyntheticEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const jsontxt = data.get("jsontxt");
    try {
      // @ts-ignore
      const jsonv = JSON.parse(jsontxt);
      if (
        Object.prototype.hasOwnProperty.call(jsonv, "widgets") &&
        jsonv.widgets
      ) {
        localStorage.setItem("FRWidgets", JSON.stringify(jsonv.widgets));
      }
      if (
        Object.prototype.hasOwnProperty.call(jsonv, "session") &&
        jsonv.session
      ) {
        localStorage.setItem("FRSession", jsonv.session);
      }
      if (Object.prototype.hasOwnProperty.call(jsonv, "base") && jsonv.base) {
        localStorage.setItem("FRHost", jsonv.base);
      }
      if (Object.prototype.hasOwnProperty.call(jsonv, "theme") && jsonv.theme) {
        localStorage.setItem("FRTheme", jsonv.theme);
      }
      doReset(true);
    } catch (e) {
      if (e instanceof SyntaxError) {
        alert("Invalid JSON");
      }
    }
  };
  return (
    <div
      onClick={(event: React.MouseEvent<HTMLElement>) => {
        if (
          open &&
          ref.current &&
          !ref.current.contains(event.target as Element)
        ) {
          doReset(false);
        }
      }}
      className="fade fixed left-0 top-0 h-full w-full overflow-y-auto overflow-x-hidden bg-neutral-400/50 outline-none"
    >
      <div
        ref={ref}
        className="mx-auto mt-20 w-4/5 justify-center rounded-xl border border-gray-800 bg-white p-4 shadow-lg dark:bg-gray-600 dark:shadow-slate-700 md:w-3/5 lg:w-1/2"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <h4 className="text-lg dark:text-gray-200">Export and import</h4>
          <textarea
            name="jsontxt"
            className="input-primary block h-60 w-full px-3 py-1.5"
            defaultValue={JSON.stringify(localData)}
          />
          <div className="text-right">
            <button
              className="btn-primary w-full bg-blue-800 px-7 py-3 text-sm leading-snug text-slate-200"
              type="submit"
            >
              Import
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
