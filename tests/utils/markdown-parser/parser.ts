import { VFile } from "./vfile.ts";
import type {
  MarkdownLanguageContext,
  MarkdownLanguageOptions,
} from "@eslint/markdown/types";
import {
  ExtendedMarkdownLanguage,
  type ExtendedMarkdownSourceCode,
} from "../../../src/language/extended-markdown-ianguage.ts";
const extendedMd = new ExtendedMarkdownLanguage();

/**
 * Parses a Markdown code and returns the abstract syntax tree (AST).
 */
export function parseMarkdown(
  code: string,
  languageOptions: MarkdownLanguageOptions,
): ExtendedMarkdownSourceCode | null {
  const context: MarkdownLanguageContext = {
    languageOptions,
  };

  const vfile = new VFile("input.md", code);
  const result = extendedMd.parse(vfile, context);
  if (!result.ok) return null;

  return extendedMd.createSourceCode(vfile, result);
}
