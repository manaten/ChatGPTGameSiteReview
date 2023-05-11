module.exports = {
  root: true,
  ignorePatterns:   ["/out", "/.next", "/node_modules"],
  parserOptions: {
    ecmaVersion: 8,
    sourceType: "module",
    ecmaFeatures: {
      jsx: true
    }
  },
  env:    {
    browser: true,
    node: true
  },
  extends: [
    "eslint:recommended",
    "plugin:import/recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:@typescript-eslint/eslint-recommended"
  ],
  parser: "@typescript-eslint/parser",
  rules: {
    indent: [
      2,
      2
    ],
    quotes: [
      2,
      "double"
    ],
    "linebreak-style": [
      2,
      "unix"
    ],
    semi: [
      2,
      "always"
    ],
    "no-multi-spaces": [
      2
    ],
    "no-multiple-empty-lines": [
      2
    ],
    "object-curly-spacing": [
      "error",
      "always",
      {
        arraysInObjects: true
      }
    ],
    "import/order": ["error", {
      groups: [
        ["builtin", "external"],
        "internal",
        ["parent", "index", "sibling", "object"],
      ],
      pathGroups: [
        {
          pattern: "*.scss",
          patternOptions: { matchBase: true },
          group: "unknown",
          position: "after",
        }
      ],
      "newlines-between": "always",
      alphabetize: {
        order: "asc",
      }
    }],
    "import/named": 0,
    "import/no-unresolved": 0,
    "no-undef": 0,
    "no-unused-vars": 0,
    "no-var": 2,
    "compat/compat": 0,
  }
};
