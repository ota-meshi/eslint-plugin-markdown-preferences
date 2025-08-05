import { defineConfig } from "eslint/config";
import myPlugin from "@ota-meshi/eslint-plugin";
import tseslint from "typescript-eslint";
import markdown from "@eslint/markdown";
import { fileURLToPath } from "url";
import path from "path";

let markdownPreferences = { rules: {} };
try {
  markdownPreferences = await import("./src/index.ts");
} catch {
  // Fallback for environments that do not support dynamic import
  markdownPreferences = await import("./lib/index.js");
}
const rules = Object.values(markdownPreferences.rules);

const dirname = path.dirname(fileURLToPath(import.meta.url));
const MD_BASE_LINKS = {
  "vue-eslint-parser": "https://github.com/vuejs/vue-eslint-parser",
  "@typescript-eslint/parser": "https://typescript-eslint.io/packages/parser",
  "eslint-typegen": "https://github.com/antfu/eslint-typegen",
  "@stylistic/eslint-plugin": "https://eslint.style/",
};
const MD_LINKS = {
  ...Object.fromEntries(
    rules.map((rule) => [rule.meta.docs.ruleId, rule.meta.docs.url]),
  ),
  ...MD_BASE_LINKS,
};
// Links to rule docs from files in docs will link to the md file.
const MD_LINKS_FOR_DOCS = {
  ...Object.fromEntries(
    rules.map((rule) => [
      rule.meta.docs.ruleId,
      path.resolve(dirname, "./docs/rules", `./${rule.meta.docs.ruleName}.md`),
    ]),
  ),
  ...MD_BASE_LINKS,
};

export default defineConfig([
  {
    files: [
      "js",
      "mjs",
      "cjs",
      "ts",
      "mts",
      "cts",
      "vue",
      "json",
      "yaml",
    ].flatMap((ext) => [`*.${ext}`, `**/*.${ext}`]),
    extends: [
      myPlugin.config({
        node: true,
        ts: true,
        eslintPlugin: true,
        packageJson: true,
        json: true,
        yaml: true,
        // md: true,
        prettier: true,
        vue3: true,
      }),
    ],
    rules: {
      complexity: "off",
      "func-style": "off",
      "n/file-extension-in-import": "off",
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
    files: ["**/*.md", "*.md"],
    extends: [
      markdown.configs.recommended,
      markdownPreferences.configs.recommended,
    ],
    rules: {
      "prettier/prettier": "off",
      "markdown/no-missing-link-fragments": "off",

      "markdown-preferences/prefer-linked-words": [
        "error",
        {
          words: MD_LINKS,
          ignores: [
            {
              node: { type: "heading" },
            },
            {
              node: { type: "footnoteDefinition" },
            },
          ],
        },
      ],
      "markdown-preferences/definitions-last": "error",
      "markdown-preferences/no-trailing-spaces": "error",
      "markdown-preferences/prefer-link-reference-definitions": "error",
    },
  },
  {
    files: ["docs/**/*.md"],
    rules: {
      "markdown-preferences/prefer-linked-words": [
        "error",
        {
          words: MD_LINKS_FOR_DOCS,
          ignores: [
            {
              node: { type: "heading" },
            },
            {
              node: { type: "footnoteDefinition" },
            },
          ],
        },
      ],
      "markdown-preferences/definitions-last": "off",
    },
  },
  {
    files: [".github/ISSUE_TEMPLATE/*.md"],
    rules: {
      "prettier/prettier": "off",
      "markdown/no-missing-label-refs": "off",
    },
  },
  {
    files: ["CHANGELOG.md"],
    rules: {
      "markdown-preferences/definitions-last": "off",
      "markdown-preferences/prefer-link-reference-definitions": "off",
    },
  },
  {
    files: ["playground/**/*.{js,mjs,cjs,md}"],
    rules: {
      "no-undef": "off",
      "no-unused-vars": "off",
      "n/no-unpublished-import": "off",
      "n/no-missing-import": "off",
      "markdown-preferences/prefer-linked-words": "off",
    },
  },
  {
    files: ["tests/fixtures/**/*.{js,mjs,cjs,ts,mts,cts,md}"],
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
      "markdown/no-missing-label-refs": "off",
      "markdown-preferences/hard-linebreak-style": "off",
      "markdown-preferences/prefer-linked-words": "off",
      "markdown-preferences/no-text-backslash-linebreak": "off",
      "markdown-preferences/definitions-last": "off",
      "markdown-preferences/no-trailing-spaces": "off",
      "markdown-preferences/prefer-link-reference-definitions": "off",
    },
  },
  {
    files: ["tests/fixtures/**/*ignore-format*.js"],
    rules: {
      "prettier/prettier": "off",
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
      ".changeset/",
    ],
  },
]);
