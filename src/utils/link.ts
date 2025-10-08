import type { Link } from "../language/ast-types.ts";
import { isAsciiControlCharacter } from "./unicode.ts";
import { getLinkKind } from "./ast.ts";
import { ForwardCharacterCursor } from "./character-cursor.ts";
import type { ExtendedMarkdownSourceCode } from "../language/extended-markdown-language.ts";

export type ParsedInlineLink = {
  text: {
    range: [number, number];
  };
  openingParen: {
    range: [number, number];
  };
  destination: {
    type: "pointy-bracketed" | "bare";
    text: string;
    range: [number, number];
  };
  title: {
    type: "double-quoted" | "single-quoted" | "parenthesized";
    text: string;
    range: [number, number];
  } | null;
  closingParen: {
    range: [number, number];
  };
};
/**
 * Parse the inline link.
 */
export function parseInlineLink(
  sourceCode: ExtendedMarkdownSourceCode,
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
  const openingParenRange: [number, number] = [
    textRange[1] + parsed.openingParen.range[0],
    textRange[1] + parsed.openingParen.range[1],
  ];
  const destinationRange: [number, number] = [
    textRange[1] + parsed.destination.range[0],
    textRange[1] + parsed.destination.range[1],
  ];
  const closingParenRange: [number, number] = [
    textRange[1] + parsed.closingParen.range[0],
    textRange[1] + parsed.closingParen.range[1],
  ];
  return {
    text: {
      range: textRange,
    },
    openingParen: {
      range: openingParenRange,
    },
    destination: {
      type: parsed.destination.type,
      text: parsed.destination.text,
      range: destinationRange,
    },
    title: parsed.title
      ? {
          type: parsed.title.type,
          text: parsed.title.text,
          range: [
            textRange[1] + parsed.title.range[0],
            textRange[1] + parsed.title.range[1],
          ],
        }
      : null,
    closingParen: {
      range: closingParenRange,
    },
  };
}

/**
 * Parse the inline link destination and link title from the given text.
 */
export function parseInlineLinkDestAndTitleFromText(text: string): {
  openingParen: {
    range: [number, number];
  };
  destination: {
    type: "pointy-bracketed" | "bare";
    text: string;
    range: [number, number];
  };
  title: {
    type: "double-quoted" | "single-quoted" | "parenthesized";
    text: string;
    range: [number, number];
  } | null;
  closingParen: {
    range: [number, number];
  };
} | null {
  // Skip initial `(`
  if (!text.startsWith("(")) return null;
  const cursor = new ForwardCharacterCursor(text);
  cursor.next();
  cursor.skipSpaces();

  let destination: NonNullable<
    ReturnType<typeof parseInlineLinkDestAndTitleFromText>
  >["destination"];
  const destinationStartIndex = cursor.currIndex();
  if (cursor.curr() === "<") {
    // Pointy-bracketed destination
    cursor.next();
    if (!cursor.skipUntilEnd((c) => c === ">")) return null;
    cursor.next();
    const destinationRange: [number, number] = [
      destinationStartIndex,
      cursor.currIndex(),
    ];
    destination = {
      type: "pointy-bracketed",
      text: text.slice(...destinationRange),
      range: destinationRange,
    };
  } else {
    if (cursor.finished()) return null;
    cursor.skipUntilEnd(
      (c, i) =>
        cursor.isWhitespace(i) || isAsciiControlCharacter(c) || c === ")",
    );
    const destinationRange: [number, number] = [
      destinationStartIndex,
      cursor.currIndex(),
    ];
    destination = {
      type: "bare",
      text: text.slice(...destinationRange),
      range: destinationRange,
    };
  }
  cursor.skipSpaces();
  if (cursor.curr() === ")") {
    const closingParenStartIndex = cursor.currIndex();
    cursor.next();
    cursor.skipSpaces();
    if (!cursor.finished()) {
      // There should be no other characters.
      return null;
    }
    return {
      openingParen: {
        range: [0, 1],
      },
      destination,
      title: null,
      closingParen: {
        range: [closingParenStartIndex, closingParenStartIndex + 1],
      },
    };
  }
  if (cursor.finished()) {
    return null;
  }

  let title: NonNullable<
    ReturnType<typeof parseInlineLinkDestAndTitleFromText>
  >["title"];
  const titleStartIndex = cursor.currIndex();
  const startChar = cursor.curr();
  if (startChar === "'" || startChar === '"' || startChar === "(") {
    cursor.next();
    const endChar = startChar === "(" ? ")" : startChar;
    if (!cursor.skipUntilEnd((c) => c === endChar)) return null;
    cursor.next();
    const titleRange: [number, number] = [titleStartIndex, cursor.currIndex()];
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
  cursor.skipSpaces();
  if (cursor.curr() !== ")") return null;
  const closingParenStartIndex = cursor.currIndex();
  cursor.next();
  cursor.skipSpaces();
  if (!cursor.finished()) {
    // There should be no other characters.
    return null;
  }

  return {
    openingParen: {
      range: [0, 1],
    },
    destination,
    title,
    closingParen: {
      range: [closingParenStartIndex, closingParenStartIndex + 1],
    },
  };
}
