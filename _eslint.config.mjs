// @ts-check

import eslint from "@eslint/js";
import tseslint from "typescript-eslint";

export default tseslint.config(eslint.configs.recommended, ...tseslint.configs.recommended, {
  files: ["src/**/*.ts", "src/**/*.tsx"],
  excludedFiles: ["build", "node_modules"]
});
