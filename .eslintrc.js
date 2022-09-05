module.exports = {
  env: {
    browser: true,
    es2021: true,
    node: true,
  },
  extends: [
    "airbnb-base",
    "eslint-config-airbnb-base",
    "plugin:@typescript-eslint/recommended",
    // "prettier/@typescript-eslint",
    "plugin:prettier/recommended",
    "plugin:import/typescript",
  ],
  parser: "@typescript-eslint/parser",
  parserOptions: {
    ecmaVersion: 2018,
    sourceType: "module",
  },
  plugins: ["@typescript-eslint"],
  rules: {
    "@typescript-eslint/no-parameter-properties": [
      "error",
      {
        allows: ["private readonly"],
      },
    ],
    "import/no-named-as-default": 0,
    "@typescript-eslint/explicit-function-return-type": "off",
    "@typescript-eslint/interface-name-prefix": "off",
    "@typescript-eslint/no-unused-vars": "off",
    "import/prefer-default-export": "off",
    "no-useless-constructor": "off",
    "no-use-before-define": "off",
    "no-empty-function": "off",
    "no-else-return": "off",
    "no-shadow": ["off"],
    "func-names": ["off"],
    "class-methods-use-this": "off",
    "new-cap": "off",
    "@typescript-eslint/camelcase": "off",
    "no-underscore-dangle": "off",
    "no-param-reassign": "off",
    "@typescript-eslint/no-plusplus": "off",
    "@typescript-eslint/no-explicit-any": "off",
    "import/no-extraneous-dependencies": ["error", { devDependencies: true }],
    // "import/no-cycle": "off",
    "import/no-duplicates": "off",
    "@typescript-eslint/no-var-requires": "off",
    "max-classes-per-file": "off",
    "import/extensions": [
      "error",
      "ignorePackages",
      {
        js: "never",
        jsx: "never",
        ts: "never",
        tsx: "never",
      },
    ],
  },
  overrides: [
    {
      files: ["*.test.{ts,js}", "*.spec.{ts,js}", "test/**/*.{ts,js}"],
      env: {
        jest: true,
      },
      rules: {
        // "no-console": "off",
        // "import/no-extraneous-dependencies": "off",
        // "@typescript-eslint/no-var-requires": "off",
        "no-underscore-dangle": "off",
        "no-restricted-syntax": "off",
        "no-await-in-loop": "off",
      },
    },
  ],
  settings: {
    "import/resolver": {
      node: {
        extensions: [".js", ".jsx", ".ts", ".tsx"],
        moduleDirectory: ["node_modules", "./", "./src"],
      },
    },
  },
};
