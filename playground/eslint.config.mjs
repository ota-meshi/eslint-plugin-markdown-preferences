import { defineConfig } from "eslint/config";
// import markdown from "@eslint/markdown";
import markdownPreferences from "eslint-plugin-markdown-preferences";
export default [
  // add more generic rule sets here, such as:
  // markdown.configs.recommended,
  markdownPreferences.configs.recommended,
  {
    rules: {
      // override/add rules settings here, such as:
      "markdown-preferences/prefer-linked-words": [
        "error",
        {
          words: {
            "eslint-plugin-markdown-preferences":
              "https://ota-meshi.github.io/eslint-plugin-markdown-preferences/",
            "markdown-preferences/prefer-linked-words":
              "https://ota-meshi.github.io/eslint-plugin-markdown-preferences/rules/prefer-linked-words.html",
          },
        },
      ],
    },
  },
];
