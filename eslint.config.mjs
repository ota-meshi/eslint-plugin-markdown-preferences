import myPlugin from "@ota-meshi/eslint-plugin";
import tseslint from "typescript-eslint";

export default [
  ...myPlugin.config({
    node: true,
    ts: true,
    eslintPlugin: true,
    packageJson: true,
    json: true,
    yaml: true,
    md: true,
    prettier: true,
    vue3: true,
  }),
  {
    rules: {
      complexity: "off",
      "func-style": "off",
    },
  },
  {
    files: ["**/*.ts", "**/*.mts"],
    rules: {
      "@typescript-eslint/switch-exhaustiveness-check": [
        "error",
        {
          allowDefaultCaseForExhaustiveSwitch: false,
          considerDefaultExhaustiveForUnions: true,
          requireDefaultForNonUnion: true,
        },
      ],
      "default-case": "off",
      "@typescript-eslint/no-explicit-any": "off",
    },
  },
  {
    files: ["**/*.md", "*.md"].flatMap((pattern) => [
      `${pattern}/*.js`,
      `${pattern}/*.mjs`,
    ]),
    rules: {
      "n/no-missing-import": "off",
    },
  },
  {
    files: ["docs/.vitepress/**"].flatMap((pattern) => [
      `${pattern}/*.js`,
      `${pattern}/*.mjs`,
      `${pattern}/*.ts`,
      `${pattern}/*.mts`,
      `${pattern}/*.vue`,
    ]),
    rules: {
      "jsdoc/require-jsdoc": "off",
      "@typescript-eslint/explicit-module-boundary-types": "off",

      // なぜ有効になっているか不明。要調査
      "vue/no-v-model-argument": "off",
    },
  },
  {
    files: ["tests/fixtures/**/*.{js,mjs,cjs,ts,mts,cts}"],
    languageOptions: {
      parserOptions: {
        project: null,
      },
    },
    rules: {
      ...tseslint.configs.disableTypeChecked.rules,
      "jsdoc/require-jsdoc": "off",
      "no-undef": "off",
      "no-lone-blocks": "off",
      "no-unused-vars": "off",
      "@typescript-eslint/no-unused-vars": "off",
      "no-shadow": "off",
      yoda: "off",
      "no-empty": "off",
      "no-self-compare": "off",
      radix: "off",
      "no-implicit-coercion": "off",
      "no-void": "off",
      "n/no-extraneous-import": "off",
      "n/no-extraneous-require": "off",
      "n/no-missing-require": "off",
      "n/file-extension-in-import": "off",
      "@typescript-eslint/no-require-imports": "off",
    },
  },
  {
    files: ["tests/fixtures/**/*ignore-format*.js"],
    rules: {
      "prettier/prettier": "off",
    },
  },
  {
    files: ["playground/**/*.{js,mjs,cjs}"],
    rules: {
      "no-undef": "off",
      "no-unused-vars": "off",
      "n/no-unpublished-import": "off",
      "n/no-missing-import": "off",
    },
  },
  {
    ignores: [
      ".nyc_output/",
      "coverage/",
      "node_modules/",
      "lib/",
      "src/rule-types.ts",
      "!.github/",
      "!.vscode/",
      "!.devcontainer/",
      "!docs/.vitepress/",
      "docs/.vitepress/cache/",
      "docs/.vitepress/build-system/shim/",
      "docs/.vitepress/dist/",
    ],
  },
];
