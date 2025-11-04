/** @type {import('vite').UserConfig} */

import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react({
      babel: {
        plugins: ["babel-plugin-react-compiler"]
      }
    }),
    tailwindcss()
  ],
  base: "/freshportal/",
  build: {
    outDir: "build",
    sourcemap: true,
    target: ["es2020"]
  }
});
