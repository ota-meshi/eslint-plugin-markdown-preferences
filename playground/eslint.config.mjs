import { defineConfig } from "eslint/config";
// import markdown from "@eslint/markdown";
import markdownPreferences from "eslint-plugin-markdown-preferences";
const ruleEntries = Object.entries(markdownPreferences.rules).filter(
  ([, rule]) => !rule.meta.deprecated,
);
export default defineConfig([
  // add more generic rule sets here, such as:
  // markdown.configs.recommended,
  markdownPreferences.configs.recommended,
  {
    rules: {
      // Add all "eslint-plugin-markdown-preferences" rules
      ...Object.fromEntries(
        ruleEntries.map(([name, rule]) => [
          `markdown-preferences/${name}`,
          "error",
        ]),
      ),
      // override/add rules settings here, such as:
      "markdown-preferences/prefer-linked-words": [
        "error",
        {
          words: {
            "eslint-plugin-markdown-preferences":
              "https://ota-meshi.github.io/eslint-plugin-markdown-preferences/",
            ...Object.fromEntries(
              ruleEntries.map(([name, rule]) => {
                return [`markdown-preferences/${name}`, rule.meta.docs.url];
              }),
            ),
          },
        },
      ],
      "markdown-preferences/prefer-link-reference-definitions": [
        "error",
        {
          minLinks: 1,
        },
      ],
    },
  },
]);
