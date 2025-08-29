import type { MarkdownSourceCode } from "@eslint/markdown";
import markdownPlugin from "@eslint/markdown";
import { VFile } from "./vfile.ts";
import type {
  MarkdownLanguageContext,
  MarkdownLanguageOptions,
} from "@eslint/markdown/types";
const gfm = markdownPlugin.languages.gfm;

/**
 * Parses a Markdown code and returns the abstract syntax tree (AST).
 */
export function parseMarkdown(
  code: string,
  languageOptions: MarkdownLanguageOptions,
): MarkdownSourceCode | null {
  const context: MarkdownLanguageContext = {
    languageOptions,
  };

  const vfile = new VFile("input.md", code);
  const result = gfm.parse(vfile, context);
  if (!result.ok) return null;

  return gfm.createSourceCode(vfile, result);
}
