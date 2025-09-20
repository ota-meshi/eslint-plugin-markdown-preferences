import type { SourceLocation } from "estree";
import type { Image } from "../language/ast-types.ts";
import { isAsciiControlCharacter } from "./unicode.ts";
import { getSourceLocationFromRange } from "./ast.ts";
import { BackwardCharacterCursor } from "./character-cursor.ts";
import type { ExtendedMarkdownSourceCode } from "../language/extended-markdown-ianguage.ts";

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
  sourceCode: ExtendedMarkdownSourceCode,
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
  const cursor = new BackwardCharacterCursor(text);
  cursor.skipSpaces();
  if (cursor.curr() !== ")") return null;
  const closingParenStartIndex = cursor.currIndex();
  cursor.prev();
  cursor.skipSpaces();
  let title: NonNullable<ReturnType<typeof parseImageFromText>>["title"] = null;
  const titleEndIndex = cursor.currIndex() + 1;
  const endChar = cursor.curr();
  if (endChar === "'" || endChar === '"' || endChar === ")") {
    cursor.prev();
    const startChar = endChar === ")" ? "(" : endChar;
    if (cursor.skipUntilStart((c) => c === startChar)) {
      const titleRange: [number, number] = [cursor.currIndex(), titleEndIndex];
      cursor.prev();
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
      cursor.skipSpaces();
    }
  }
  if (title == null) {
    cursor.setCurrIndex(titleEndIndex - 1);
  }

  let destination: NonNullable<
    ReturnType<typeof parseImageFromText>
  >["destination"];
  const destinationEndIndex = cursor.currIndex() + 1;
  if (cursor.curr() === ">") {
    // Pointy-bracketed destination
    cursor.prev();
    if (!cursor.skipUntilStart((c) => c === "<")) return null;
    const destinationRange: [number, number] = [
      cursor.currIndex(),
      destinationEndIndex,
    ];
    cursor.prev();
    destination = {
      type: "pointy-bracketed",
      text: text.slice(...destinationRange),
      range: destinationRange,
    };
  } else {
    if (cursor.finished()) return null;
    cursor.skipUntilStart(
      (c, i) =>
        cursor.isWhitespace(i) || isAsciiControlCharacter(c) || c === "(",
    );
    const destinationRange: [number, number] = [
      cursor.currIndex() + 1,
      destinationEndIndex,
    ];
    destination = {
      type: "bare",
      text: text.slice(...destinationRange),
      range: destinationRange,
    };
  }
  cursor.skipSpaces();
  if (cursor.curr() !== "(") return null;
  const openingParenStartIndex = cursor.currIndex();
  if (cursor.prev() !== "]") return null;
  const textRange: [number, number] = [1, cursor.currIndex() + 1];
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
}
