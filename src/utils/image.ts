import type { MarkdownSourceCode } from "@eslint/markdown";
import type { SourceLocation } from "estree";
import type { Image } from "mdast";
import { isAsciiControlCharacter, isWhitespace } from "./unicode.ts";
import { getSourceLocationFromRange } from "./ast.ts";

export type ParsedImage = {
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
  const labelRange: [number, number] = [
    nodeRange[0] + parsed.label.range[0],
    nodeRange[0] + parsed.label.range[1],
  ];
  const destinationRange: [number, number] = [
    nodeRange[0] + parsed.destination.range[0],
    nodeRange[0] + parsed.destination.range[1],
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
            nodeRange[0] + parsed.title.range[0],
            nodeRange[0] + parsed.title.range[1],
          ],
          loc: getSourceLocationFromRange(sourceCode, node, [
            nodeRange[0] + parsed.title.range[0],
            nodeRange[0] + parsed.title.range[1],
          ]),
        }
      : null,
  };
}

/**
 * Parse the image from the given text.
 */
export function parseImageFromText(text: string): {
  label: {
    range: [number, number];
  };
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
  if (!text.startsWith("![")) return null;
  let index = text.length - 1;
  skipSpaces();
  if (text[index] !== ")") return null;
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
    // Angle-bracketed destination
    index--;
    if (!skipUntilStart((c) => c === "<")) return null;
    const destinationRange: [number, number] = [index, destinationEndIndex];
    index--;
    destination = {
      type: "angle-bracketed",
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
      type: "plain",
      text: text.slice(...destinationRange),
      range: destinationRange,
    };
  }
  skipSpaces();
  if (text[index] !== "(") return null;
  index--;
  if (text[index] !== "]") return null;
  const labelRange: [number, number] = [1, index + 1];
  return {
    label: {
      range: labelRange,
    },
    destination,
    title,
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
        if (index > 1) {
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
