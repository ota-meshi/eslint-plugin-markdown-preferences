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
  CustomContainer,
  Yaml,
  Math,
  InlineMath,
  ImportCodeSnippet,
} from "../language/ast-types.ts";
import type { ExtendedMarkdownSourceCode } from "../language/extended-markdown-language.ts";

export type MDFrontmatter = Yaml | Toml | Json;
export type MDBlock =
  | Blockquote
  | Code
  | Heading
  | List
  | Paragraph
  | ThematicBreak
  | Table
  | CustomContainer
  | Math
  | ImportCodeSnippet;
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
  | CustomContainer
  | Math
  | InlineMath
  | ImportCodeSnippet
  | Yaml
  | Toml
  | Json;

export type MDParent<N extends MDNode> = N extends Root
  ? null
  : MDNode extends infer P
    ? P extends { children: (infer C)[] }
      ? N extends C
        ? Extract<P, { children: C[] }>
        : never
      : never
    : never;

const RE_HTML_COMMENT = /<!--(.*?)-->/u;

/**
 * Get the parent of a node.
 */
export function getParent<N extends MDNode>(
  sourceCode: ExtendedMarkdownSourceCode,
  node: N,
): MDParent<N> {
  return sourceCode.getParent(node) as MDParent<N>;
}

export type MDSibling<N extends MDNode> = NonNullable<
  MDParent<N>
>["children"][number];

/**
 * Get the previous sibling of a node.
 */
export function getPrevSibling<N extends MDNode>(
  sourceCode: ExtendedMarkdownSourceCode,
  node: N,
): MDSibling<N> | null {
  const parent = getParent(sourceCode, node);
  if (!parent) return null;
  const index = (parent.children as MDNode[]).indexOf(node);
  if (index <= 0) return null;
  return parent.children[index - 1] as MDSibling<N>;
}

/**
 * Get the next sibling of a node.
 */
export function getNextSibling<N extends MDNode>(
  sourceCode: ExtendedMarkdownSourceCode,
  node: N,
): MDSibling<N> | null {
  const parent = getParent(sourceCode, node);
  if (!parent) return null;
  const index = (parent.children as MDNode[]).indexOf(node);
  if (index < 0 || index >= parent.children.length - 1) return null;
  return parent.children[index + 1] as MDSibling<N>;
}

/**
 * Get the kind of heading.
 */
export function getHeadingKind(
  sourceCode: ExtendedMarkdownSourceCode,
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
  sourceCode: ExtendedMarkdownSourceCode,
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
  sourceCode: ExtendedMarkdownSourceCode,
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
  sequence: {
    value: number;
    raw: string;
  };
};

/**
 * Get the marker of a list item.
 */
export function getListItemMarker(
  sourceCode: ExtendedMarkdownSourceCode,
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
      sequence: {
        value: Number(matchDot[1]),
        raw: matchDot[1],
      },
    };
  }
  const matchParen = /^(\d+)\)/.exec(text)!;
  return {
    kind: ")",
    raw: matchParen[0],
    sequence: {
      value: Number(matchParen[1]),
      raw: matchParen[1],
    },
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
  sourceCode: ExtendedMarkdownSourceCode,
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
 * Check whether a node is an HTML comment.
 */
export function isHTMLComment(node: MDNode): node is Html {
  return node.type === "html" && RE_HTML_COMMENT.test(node.value);
}

/**
 * Get the value of an HTML comment.
 */
export function getHTMLCommentValue(node: MDNode): string | null {
  if (!isHTMLComment(node)) return null;
  return RE_HTML_COMMENT.exec(node.value)?.[1] ?? null;
}
