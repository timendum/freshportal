const colors = ["red", "amber", "green", "indigo", "gray", "fuchsia"];

const darkPreference = () => {
  if (
    localStorage.TTRssTheme === "dark" ||
    (!("TTRssTheme" in localStorage) && window.matchMedia("(prefers-color-scheme: dark)").matches)
  ) {
    return true;
  }
  return false;
};

export { colors, darkPreference };
