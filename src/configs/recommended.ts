// IMPORTANT!
// This file has been automatically generated,
// in order to update its content execute "npm run update"
import type { ESLint, Linter } from "eslint";
import plugin from "../index.js";
import markdown from "@eslint/markdown";
export const name = "markdown-preferences/recommended";
export const files = ["**/*.md"];
export const language = "markdown/commonmark";
export const plugins = {
  markdown,
  // eslint-disable-next-line @typescript-eslint/naming-convention -- ignore
  get "markdown-preferences"(): ESLint.Plugin {
    return plugin;
  },
};
export const rules: Linter.RulesRecord = {
  // eslint-plugin-markdown-preferences rules
  "markdown-preferences/hard-linebreak-style": "error",
  "markdown-preferences/no-text-backslash-linebreak": "error",
};
