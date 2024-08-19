module.exports = {
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:@typescript-eslint/recommended-type-checked",
    "plugin:@next/next/recommended"
  ],
  parserOptions: {
    project: true,
    __tsconfigRootDir: __dirname
  },
  root: true,
  rules: {
    "no-unused-vars": "off",
    "@typescript-eslint/no-unused-vars": "error"
  },
  overrides: [
    {
      files: ["*freshrss.ts"],
      rules: {
        "no-unsafe-assignment": "off"
      }
    }
  ]
};
