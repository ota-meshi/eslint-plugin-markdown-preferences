// IMPORTANT!
// This file has been automatically generated,
// in order to update its content execute "npm run update"
import type { ESLint, Linter } from "eslint";
import plugin from "../index.ts";
import markdown from "@eslint/markdown";
export const name = "markdown-preferences/recommended";
export const files = ["*.md", "**/*.md"];
export const language = "markdown/gfm";
export const languageOptions = {
  frontmatter: "yaml",
};
export const plugins = {
  markdown,
  // eslint-disable-next-line @typescript-eslint/naming-convention -- ignore
  get "markdown-preferences"(): ESLint.Plugin {
    return plugin;
  },
};
export const rules: Linter.RulesRecord = {
  // eslint-plugin-markdown-preferences rules
  "markdown-preferences/atx-heading-closing-sequence-length": "error",
  "markdown-preferences/atx-heading-closing-sequence": "error",
  "markdown-preferences/blockquote-marker-alignment": "error",
  "markdown-preferences/bullet-list-marker-style": "error",
  "markdown-preferences/code-fence-length": "error",
  "markdown-preferences/code-fence-style": "error",
  "markdown-preferences/emphasis-delimiters-style": "error",
  "markdown-preferences/hard-linebreak-style": "error",
  "markdown-preferences/indent": "error",
  "markdown-preferences/level1-heading-style": "error",
  "markdown-preferences/level2-heading-style": "error",
  "markdown-preferences/link-bracket-newline": "error",
  "markdown-preferences/link-bracket-spacing": "error",
  "markdown-preferences/link-destination-style": "error",
  "markdown-preferences/link-paren-newline": "error",
  "markdown-preferences/link-paren-spacing": "error",
  "markdown-preferences/link-title-style": "error",
  "markdown-preferences/list-marker-alignment": "error",
  "markdown-preferences/no-implicit-block-closing": "error",
  "markdown-preferences/no-laziness-blockquotes": "error",
  "markdown-preferences/no-multi-spaces": "error",
  "markdown-preferences/no-multiple-empty-lines": "error",
  "markdown-preferences/no-text-backslash-linebreak": "error",
  "markdown-preferences/no-trailing-spaces": "error",
  "markdown-preferences/ordered-list-marker-sequence": "error",
  "markdown-preferences/ordered-list-marker-start": "error",
  "markdown-preferences/ordered-list-marker-style": "error",
  "markdown-preferences/padding-line-between-blocks": "error",
  "markdown-preferences/prefer-autolinks": "error",
  "markdown-preferences/prefer-fenced-code-blocks": "error",
  "markdown-preferences/setext-heading-underline-length": "error",
  "markdown-preferences/sort-definitions": "error",
  "markdown-preferences/strikethrough-delimiters-style": "error",
  "markdown-preferences/table-leading-trailing-pipes": "error",
  "markdown-preferences/table-pipe-alignment": "error",
  "markdown-preferences/table-pipe-spacing": "error",
  "markdown-preferences/thematic-break-character-style": "error",
  "markdown-preferences/thematic-break-length": "error",
  "markdown-preferences/thematic-break-sequence-pattern": "error",
};
