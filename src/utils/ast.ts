import type { MarkdownSourceCode } from "@eslint/markdown";
import type { Code, Link } from "mdast";

/**
 * Get the kind of code block.
 */
export function getCodeBlockKind(
  sourceCode: MarkdownSourceCode,
  node: Code,
): "backtick-fenced" | "tilde-fenced" | "indented" {
  const text = sourceCode.getText(node);
  return text.startsWith("```")
    ? "backtick-fenced"
    : text.startsWith("~~~")
      ? "tilde-fenced"
      : "indented";
}

/**
 * Get the kind of link.
 */
export function getLinkKind(
  sourceCode: MarkdownSourceCode,
  node: Link,
): "inline" | "autolink" | "gfm-autolink" {
  const text = sourceCode.getText(node);
  return text.startsWith("[")
    ? "inline"
    : text.startsWith("<") && text.endsWith(">")
      ? "autolink"
      : "gfm-autolink";
}
