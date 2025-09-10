import type { MarkdownSourceCode } from "@eslint/markdown";
import type { SourceLocation } from "estree";
import type { Image } from "mdast";
import { isAsciiControlCharacter, isWhitespace } from "./unicode.ts";
import { getSourceLocationFromRange } from "./ast.ts";

export type ParsedImage = {
  text: {
    range: [number, number];
    loc: SourceLocation;
  };
  openingParen: {
    range: [number, number];
    loc: SourceLocation;
  };
  destination: {
    type: "pointy-bracketed" | "bare";
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
  closingParen: {
    range: [number, number];
    loc: SourceLocation;
  };
};
/**
 * Parse the image.
 */
export function parseImage(
  sourceCode: MarkdownSourceCode,
  node: Image,
): ParsedImage | null {
  const text = sourceCode.getText(node);
  const parsed = parseImageFromText(text);
  if (!parsed) return null;
  const nodeRange = sourceCode.getRange(node);
  const textRange: [number, number] = [
    nodeRange[0] + parsed.text.range[0],
    nodeRange[0] + parsed.text.range[1],
  ];
  const openingParenRange: [number, number] = [
    nodeRange[0] + parsed.openingParen.range[0],
    nodeRange[0] + parsed.openingParen.range[1],
  ];
  const destinationRange: [number, number] = [
    nodeRange[0] + parsed.destination.range[0],
    nodeRange[0] + parsed.destination.range[1],
  ];
  const closingParenRange: [number, number] = [
    nodeRange[0] + parsed.closingParen.range[0],
    nodeRange[0] + parsed.closingParen.range[1],
  ];
  return {
    text: {
      range: textRange,
      loc: getSourceLocationFromRange(sourceCode, node, textRange),
    },
    openingParen: {
      range: openingParenRange,
      loc: getSourceLocationFromRange(sourceCode, node, openingParenRange),
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
            nodeRange[0] + parsed.title.range[0],
            nodeRange[0] + parsed.title.range[1],
          ],
          loc: getSourceLocationFromRange(sourceCode, node, [
            nodeRange[0] + parsed.title.range[0],
            nodeRange[0] + parsed.title.range[1],
          ]),
        }
      : null,
    closingParen: {
      range: closingParenRange,
      loc: getSourceLocationFromRange(sourceCode, node, closingParenRange),
    },
  };
}

/**
 * Parse the image from the given text.
 */
export function parseImageFromText(text: string): {
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
} | null {
  if (!text.startsWith("![")) return null;
  let index = text.length - 1;
  skipSpaces();
  if (text[index] !== ")") return null;
  const closingParenStartIndex = index;
  index--;
  skipSpaces();
  let title: NonNullable<ReturnType<typeof parseImageFromText>>["title"] = null;
  const titleEndIndex = index + 1;
  const endChar = text[index];
  if (endChar === "'" || endChar === '"' || endChar === ")") {
    index--;
    const startChar = endChar === ")" ? "(" : endChar;
    if (skipUntilStart((c) => c === startChar)) {
      const titleRange: [number, number] = [index, titleEndIndex];
      index--;
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
      skipSpaces();
    }
  }
  if (title == null) {
    index = titleEndIndex - 1;
  }

  let destination: NonNullable<
    ReturnType<typeof parseImageFromText>
  >["destination"];
  const destinationEndIndex = index + 1;
  if (text[index] === ">") {
    // Pointy-bracketed destination
    index--;
    if (!skipUntilStart((c) => c === "<")) return null;
    const destinationRange: [number, number] = [index, destinationEndIndex];
    index--;
    destination = {
      type: "pointy-bracketed",
      text: text.slice(...destinationRange),
      range: destinationRange,
    };
  } else {
    if (text.length <= index) return null;
    skipUntilStart(
      (c) => isWhitespace(c) || isAsciiControlCharacter(c) || c === "(",
    );
    const destinationRange: [number, number] = [index + 1, destinationEndIndex];
    destination = {
      type: "bare",
      text: text.slice(...destinationRange),
      range: destinationRange,
    };
  }
  skipSpaces();
  if (text[index] !== "(") return null;
  const openingParenStartIndex = index;
  index--;
  if (text[index] !== "]") return null;
  const textRange: [number, number] = [1, index + 1];
  return {
    openingParen: {
      range: [openingParenStartIndex, openingParenStartIndex + 1],
    },
    text: {
      range: textRange,
    },
    destination,
    title,
    closingParen: {
      range: [closingParenStartIndex, closingParenStartIndex + 1],
    },
  };

  /**
   * Skip spaces
   */
  function skipSpaces() {
    while (index >= 0 && isWhitespace(text[index])) {
      index--;
    }
  }

  /**
   * Skip until the start by the given condition
   */
  function skipUntilStart(checkStart: (c: string) => boolean) {
    while (index >= 0) {
      const c = text[index];
      if (checkStart(c)) {
        if (index > 1 && !isWhitespace(c)) {
          let escapeText = "";
          while (text.endsWith(`${escapeText}\\`, index)) {
            escapeText += "\\";
          }
          // An odd number of backslashes acts as an escape.
          if (escapeText.length % 2 === 1) {
            index -= escapeText.length + 1;
            continue;
          }
        }
        return true;
      }
      index--;
    }
    return false;
  }
}
