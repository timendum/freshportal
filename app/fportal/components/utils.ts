const colors = ["red", "amber", "green", "indigo", "fuchsia", "gray"];

const DnDWidgetType = "WIDGET";

const darkPreference = () => {
  if (
    localStorage.FRTheme === "dark" ||
    (!("FRTheme" in localStorage) && window.matchMedia("(prefers-color-scheme: dark)").matches)
  ) {
    return true;
  }
  return false;
};

export { colors, darkPreference, DnDWidgetType };
