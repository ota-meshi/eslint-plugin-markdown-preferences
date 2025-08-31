import type { SourceLocation } from "@eslint/core";
import type { MarkdownSourceCode } from "@eslint/markdown";
import type { Json, Toml } from "@eslint/markdown/types";
import type {
  Blockquote,
  Break,
  Code,
  Definition,
  Delete,
  Emphasis,
  FootnoteDefinition,
  FootnoteReference,
  Heading,
  Html,
  Image,
  ImageReference,
  InlineCode,
  Link,
  LinkReference,
  List,
  ListItem,
  Paragraph,
  Root,
  Strong,
  Table,
  TableCell,
  TableRow,
  Text,
  ThematicBreak,
  Yaml,
} from "mdast";

export type MDFrontmatter = Yaml | Toml | Json;
export type MDBlock =
  | Blockquote
  | Code
  | Heading
  | List
  | Paragraph
  | ThematicBreak
  | Table;
export type MDDefinition = Definition | FootnoteDefinition;
export type MDSpecialNode = ListItem | TableCell | TableRow;
export type MDInline = Exclude<
  MDNode,
  Root | MDBlock | MDFrontmatter | MDDefinition | MDSpecialNode
>;
export type MDNode =
  | Root
  | Blockquote
  | Break
  | Code
  | Definition
  | Emphasis
  | Heading
  | Html
  | Image
  | ImageReference
  | InlineCode
  | Link
  | LinkReference
  | List
  | ListItem
  | Paragraph
  | Strong
  | Text
  | ThematicBreak
  | Delete
  | FootnoteDefinition
  | FootnoteReference
  | Table
  | TableCell
  | TableRow
  | Yaml
  | Toml
  | Json;

/**
 * Get the kind of heading.
 */
export function getHeadingKind(
  sourceCode: MarkdownSourceCode,
  node: Heading,
): "atx" | "setext" {
  const loc = sourceCode.getLoc(node);
  if (loc.start.line !== loc.end.line) {
    return "setext";
  }
  return "atx";
}
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

export type BulletListMarkerKind = "-" | "*" | "+";
export type OrderedListMarkerKind = "." | ")";
export type BulletListMarker = { kind: BulletListMarkerKind; raw: string };
export type OrderedListMarker = {
  kind: OrderedListMarkerKind;
  raw: string;
  sequence: number;
};

/**
 * Get the marker of a list item.
 */
export function getListItemMarker(
  sourceCode: MarkdownSourceCode,
  node: ListItem | List,
): BulletListMarker | OrderedListMarker {
  const item = node.type === "list" ? node.children[0] || node : node;
  const text = sourceCode.getText(item);
  if (text.startsWith("-")) return { kind: "-", raw: "-" };
  if (text.startsWith("*")) return { kind: "*", raw: "*" };
  if (text.startsWith("+")) return { kind: "+", raw: "+" };

  const matchDot = /^(\d+)\./.exec(text)!;
  if (matchDot) {
    return {
      kind: ".",
      raw: matchDot[0],
      sequence: Number(matchDot[1]),
    };
  }
  const matchParen = /^(\d+)\)/.exec(text)!;
  return {
    kind: ")",
    raw: matchParen[0],
    sequence: Number(matchParen[1]),
  };
}
export type ThematicBreakMarker = {
  kind: "-" | "*" | "_";
  hasSpaces: boolean;
  text: string;
};
/**
 * Get the marker for a thematic break.
 */
export function getThematicBreakMarker(
  sourceCode: MarkdownSourceCode,
  node: ThematicBreak,
): ThematicBreakMarker {
  const text = sourceCode.getText(node).trimEnd();
  return {
    kind: text.startsWith("-") ? "-" : text.startsWith("*") ? "*" : "_",
    hasSpaces: /\s/u.test(text),
    text,
  };
}

/**
 * Get the source location from a range in a node.
 */
export function getSourceLocationFromRange(
  sourceCode: MarkdownSourceCode,
  node: Text | Code,
  range: [number, number],
): SourceLocation {
  const [nodeStart] = sourceCode.getRange(node);
  let startLine: number, startColumn: number;
  if (nodeStart <= range[0]) {
    const loc = sourceCode.getLoc(node);
    const beforeLines = sourceCode.text.slice(nodeStart, range[0]).split(/\n/u);
    startLine = loc.start.line + beforeLines.length - 1;
    startColumn =
      (beforeLines.length === 1 ? loc.start.column : 1) +
      (beforeLines.at(-1) || "").length;
  } else {
    const beforeLines = sourceCode.text.slice(0, range[0]).split(/\n/u);
    startLine = beforeLines.length;
    startColumn = 1 + (beforeLines.at(-1) || "").length;
  }
  const contentLines = sourceCode.text.slice(range[0], range[1]).split(/\n/u);
  const endLine = startLine + contentLines.length - 1;
  const endColumn =
    (contentLines.length === 1 ? startColumn : 1) +
    (contentLines.at(-1) || "").length;
  return {
    start: { line: startLine, column: startColumn },
    end: { line: endLine, column: endColumn },
  };
}
