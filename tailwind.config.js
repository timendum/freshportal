/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      fontSize: {
        xs: "0.8rem"
      },
      textUnderlineOffset: {
        auto: "1px"
      }
    }
  },
  plugins: []
};
