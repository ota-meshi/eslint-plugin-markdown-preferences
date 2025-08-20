import { defineConfig } from "eslint/config";
// import markdown from "@eslint/markdown";
import markdownPreferences from "eslint-plugin-markdown-preferences";
export default defineConfig([
  // add more generic rule sets here, such as:
  // markdown.configs.recommended,
  markdownPreferences.configs.recommended,
  {
    rules: {
      // override/add rules settings here, such as:
      ...Object.fromEntries(
        Object.entries(markdownPreferences.rules).map(([name, rule]) => [
          `markdown-preferences/${name}`,
          "error",
        ])
      ),
      "markdown-preferences/prefer-linked-words": [
        "error",
        {
          words: {
            "eslint-plugin-markdown-preferences":
              "https://ota-meshi.github.io/eslint-plugin-markdown-preferences/",
            ...Object.fromEntries(
              Object.entries(markdownPreferences.rules).map(([name, rule]) => {
                return [`markdown-preferences/${name}`, rule.meta.docs.url];
              })
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
