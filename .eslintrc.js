module.exports = {
  env: {
    browser: true,
    es2021: true,
  },
  extends: [
    "react-app",
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:react/recommended",
    "plugin:prettier/recommended",
  ],
  overrides: [
    {
      env: {
        node: true,
      },
      files: [".eslintrc.{js,cjs}"],
      parserOptions: {
        sourceType: "script",
      },
    },
  ],
  parser: "@typescript-eslint/parser",
  parserOptions: {
    ecmaVersion: "latest",
  },
  plugins: ["@typescript-eslint", "react"],
  rules: {
    indent: ["error", 2, { ignoredNodes: ["PropertyDefinition"] }],
    "linebreak-style": ["error", "unix"],
    quotes: ["error", "double", { allowTemplateLiterals: true }],
    semi: ["error", "always"],
  },
};
