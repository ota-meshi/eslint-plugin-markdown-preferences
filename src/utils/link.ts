import type { MarkdownSourceCode } from "@eslint/markdown";
import type { SourceLocation } from "estree";
import type { Link } from "mdast";
import { isAsciiControlCharacter, isWhitespace } from "./unicode.ts";
import { getSourceLocationFromRange } from "./ast.ts";

export type ParsedLink = {
  label: {
    range: [number, number];
    loc: SourceLocation;
  };
  destination: {
    type: "angle-bracketed" | "plain";
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
 * Parse the link.
 */
export function parseLink(
  sourceCode: MarkdownSourceCode,
  node: Link,
): ParsedLink | null {
  const nodeRange = sourceCode.getRange(node);
  let labelRange: [number, number];
  if (node.children.length === 0) {
    labelRange = [nodeRange[0], sourceCode.text.indexOf("]", nodeRange[0]) + 1];
  } else {
    const lastChildRange = sourceCode.getRange(
      node.children[node.children.length - 1],
    );
    labelRange = [
      nodeRange[0],
      sourceCode.text.indexOf("]", lastChildRange[1]) + 1,
    ];
  }
  const parsed = parseLinkDestAndTitleFromText(
    sourceCode.text.slice(labelRange[1], nodeRange[1]),
  );
  if (!parsed) return null;
  const destinationRange: [number, number] = [
    labelRange[1] + parsed.destination.range[0],
    labelRange[1] + parsed.destination.range[1],
  ];
  return {
    label: {
      range: labelRange,
      loc: getSourceLocationFromRange(sourceCode, node, labelRange),
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
            labelRange[0] + parsed.title.range[0],
            labelRange[0] + parsed.title.range[1],
          ],
          loc: getSourceLocationFromRange(sourceCode, node, [
            labelRange[0] + parsed.title.range[0],
            labelRange[0] + parsed.title.range[1],
          ]),
        }
      : null,
  };
}

/**
 * Parse the link destination and link title from the given text.
 */
export function parseLinkDestAndTitleFromText(text: string): {
  destination: {
    type: "angle-bracketed" | "plain";
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

  // Skip initial `()`
  if (text[index] !== "(") return null;
  index++;
  skipSpaces();

  let destination: NonNullable<
    ReturnType<typeof parseLinkDestAndTitleFromText>
  >["destination"];
  const destinationStartIndex = index;
  if (text[index] === "<") {
    // Angle-bracketed destination
    index++;
    if (!skipUntilEnd((c) => c === ">")) return null;
    index++;
    const destinationRange: [number, number] = [destinationStartIndex, index];
    destination = {
      type: "angle-bracketed",
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
    ReturnType<typeof parseLinkDestAndTitleFromText>
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
      if (index < text.length && (c === "\\" || checkEnd(text[index]))) {
        index++;
      }
    }
    return false;
  }
}
