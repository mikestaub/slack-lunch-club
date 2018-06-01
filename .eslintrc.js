const OFF = 0;
const WARN = 1;
const ERR = 2;

module.exports = {
  extends: ["eslint:recommended", "prettier"],
  plugins: ["jest", "flowtype"],
  parser: "babel-eslint",
  parserOptions: { ecmaVersion: "2018" },
  env: { es6: true, node: true, "jest/globals": true },
  rules: {
    "flowtype/define-flow-type": 2,
  },
};
