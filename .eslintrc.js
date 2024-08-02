module.exports = {
  extends: ["eslint:recommended", "plugin:@typescript-eslint/recommended-type-checked"],
  parserOptions: {
    project: true,
    __tsconfigRootDir: __dirname
  },
  root: true
};
