import type { MarkdownSourceCode } from "@eslint/markdown";
import type { SourceLocation } from "estree";
import type { Link } from "mdast";
import { isAsciiControlCharacter, isWhitespace } from "./unicode.ts";
import { getLinkKind, getSourceLocationFromRange } from "./ast.ts";

export type ParsedInlineLink = {
  text: {
    range: [number, number];
    loc: SourceLocation;
  };
  destination: {
    type: "pointy-bracketed" | "plain";
    text: string;
    range: [number, number];
    loc: SourceLocation;
  };
  title: {
    type: "double-quoted" | "single-quoted" | "parenthesized";
    text: string;
    range: [number, number];
    loc: SourceLocation;
  } | null;
};
/**
 * Parse the inline link.
 */
export function parseInlineLink(
  sourceCode: MarkdownSourceCode,
  node: Link,
): ParsedInlineLink | null {
  const kind = getLinkKind(sourceCode, node);
  if (kind !== "inline") return null;
  const nodeRange = sourceCode.getRange(node);
  let textRange: [number, number];
  if (node.children.length === 0) {
    textRange = [nodeRange[0], sourceCode.text.indexOf("]", nodeRange[0]) + 1];
  } else {
    const lastChildRange = sourceCode.getRange(
      node.children[node.children.length - 1],
    );
    textRange = [
      nodeRange[0],
      sourceCode.text.indexOf("]", lastChildRange[1]) + 1,
    ];
  }
  const parsed = parseInlineLinkDestAndTitleFromText(
    sourceCode.text.slice(textRange[1], nodeRange[1]),
  );
  if (!parsed) return null;
  const destinationRange: [number, number] = [
    textRange[1] + parsed.destination.range[0],
    textRange[1] + parsed.destination.range[1],
  ];
  return {
    text: {
      range: textRange,
      loc: getSourceLocationFromRange(sourceCode, node, textRange),
    },
    destination: {
      type: parsed.destination.type,
      text: parsed.destination.text,
      range: destinationRange,
      loc: getSourceLocationFromRange(sourceCode, node, destinationRange),
    },
    title: parsed.title
      ? {
          type: parsed.title.type,
          text: parsed.title.text,
          range: [
            textRange[1] + parsed.title.range[0],
            textRange[1] + parsed.title.range[1],
          ],
          loc: getSourceLocationFromRange(sourceCode, node, [
            textRange[1] + parsed.title.range[0],
            textRange[1] + parsed.title.range[1],
          ]),
        }
      : null,
  };
}

/**
 * Parse the inline link destination and link title from the given text.
 */
export function parseInlineLinkDestAndTitleFromText(text: string): {
  destination: {
    type: "pointy-bracketed" | "plain";
    text: string;
    range: [number, number];
  };
  title: {
    type: "double-quoted" | "single-quoted" | "parenthesized";
    text: string;
    range: [number, number];
  } | null;
} | null {
  let index = 0;

  // Skip initial `(`
  if (text[index] !== "(") return null;
  index++;
  skipSpaces();

  let destination: NonNullable<
    ReturnType<typeof parseInlineLinkDestAndTitleFromText>
  >["destination"];
  const destinationStartIndex = index;
  if (text[index] === "<") {
    // Pointy-bracketed destination
    index++;
    if (!skipUntilEnd((c) => c === ">")) return null;
    index++;
    const destinationRange: [number, number] = [destinationStartIndex, index];
    destination = {
      type: "pointy-bracketed",
      text: text.slice(...destinationRange),
      range: destinationRange,
    };
  } else {
    if (text.length <= index) return null;
    skipUntilEnd(
      (c) => isWhitespace(c) || isAsciiControlCharacter(c) || c === ")",
    );
    const destinationRange: [number, number] = [destinationStartIndex, index];
    destination = {
      type: "plain",
      text: text.slice(...destinationRange),
      range: destinationRange,
    };
  }
  skipSpaces();
  if (text[index] === ")") {
    index++;
    skipSpaces();
    if (index < text.length) {
      // There should be no other characters.
      return null;
    }
    return {
      destination,
      title: null,
    };
  }
  if (text.length <= index) {
    return null;
  }

  let title: NonNullable<
    ReturnType<typeof parseInlineLinkDestAndTitleFromText>
  >["title"];
  const titleStartIndex = index;
  const startChar = text[index];
  if (startChar === "'" || startChar === '"' || startChar === "(") {
    index++;
    const endChar = startChar === "(" ? ")" : startChar;
    if (!skipUntilEnd((c) => c === endChar)) return null;
    index++;
    const titleRange: [number, number] = [titleStartIndex, index];
    title = {
      type:
        startChar === "'"
          ? "single-quoted"
          : startChar === '"'
            ? "double-quoted"
            : "parenthesized",
      text: text.slice(...titleRange),
      range: titleRange,
    };
  } else {
    return null;
  }
  skipSpaces();
  if (text[index] !== ")") return null;
  index++;
  skipSpaces();
  if (index < text.length) {
    // There should be no other characters.
    return null;
  }

  return {
    destination,
    title,
  };

  /**
   * Skip spaces
   */
  function skipSpaces() {
    while (index < text.length && isWhitespace(text[index])) {
      index++;
    }
  }

  /**
   * Skip until the end by the given condition
   */
  function skipUntilEnd(checkEnd: (c: string) => boolean) {
    while (index < text.length) {
      const c = text[index];
      if (checkEnd(c)) return true;
      index++;
      if (c !== "\\") continue;
      if (
        index < text.length &&
        (text[index] === "\\" || checkEnd(text[index]))
      ) {
        index++;
      }
    }
    return false;
  }
}
