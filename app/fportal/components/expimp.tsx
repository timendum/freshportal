import React from "react";
import { WidgetList } from "./interfaces";

interface LocalStoragePerf {
  widgets?: WidgetList;
  session?: string;
  base?: string;
  theme?: string;
}
interface ExpImpProps {
  isOpen: boolean;
  doReset: (arg0: boolean) => void;
}

export default function ExpImp({ isOpen, doReset }: ExpImpProps) {
  const ref = React.useRef<HTMLDialogElement>(null);

  React.useEffect(() => {
    const dialog = ref.current;
    if (!dialog) {
      return;
    }
    if (isOpen && !dialog.open) {
      dialog.showModal();
    } else if (!isOpen && dialog.open) {
      dialog.close();
    }
  }, [isOpen]);
  const localData: LocalStoragePerf = {};
  let ld = localStorage.getItem("FRWidgets");
  if (ld) {
    localData.widgets = JSON.parse(ld) as WidgetList;
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
      /* eslint-disable
        @typescript-eslint/no-unsafe-member-access,
        @typescript-eslint/no-unsafe-assignment,
        @typescript-eslint/no-unsafe-argument */
      // @ts-expect-error For invalid JSON in the form
      const jsonv = JSON.parse(jsontxt);
      if (Object.prototype.hasOwnProperty.call(jsonv, "widgets") && jsonv.widgets) {
        localStorage.setItem("FRWidgets", JSON.stringify(jsonv.widgets));
      }
      if (Object.prototype.hasOwnProperty.call(jsonv, "session") && jsonv.session) {
        localStorage.setItem("FRSession", jsonv.session);
      }
      if (Object.prototype.hasOwnProperty.call(jsonv, "base") && jsonv.base) {
        localStorage.setItem("FRHost", jsonv.base);
      }
      if (Object.prototype.hasOwnProperty.call(jsonv, "theme") && jsonv.theme) {
        localStorage.setItem("FRTheme", jsonv.theme);
      }
      doReset(true);
      /* eslint-enable */
    } catch (e) {
      if (e instanceof SyntaxError) {
        alert("Invalid JSON");
      }
    }
  };
  return (
    <dialog
      ref={ref}
      onClick={(event: React.MouseEvent<HTMLDialogElement>) => {
        if (event.target === ref.current) doReset(false);
      }}
      onClose={() => doReset(false)}
      className="mx-auto mt-20 w-4/5 rounded-xl border border-gray-800 bg-white p-4 shadow-lg backdrop:bg-neutral-400/50 dark:bg-gray-600 dark:shadow-slate-700 md:w-3/5 lg:w-1/2"
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
    </dialog>
  );
}
