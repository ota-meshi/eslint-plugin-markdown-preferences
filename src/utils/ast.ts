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
