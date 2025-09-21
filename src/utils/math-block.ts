import type { SourceLocation } from "@eslint/core";
import type { Math } from "../language/ast-types.ts";
import { isSpaceOrTab, isWhitespace } from "./unicode.ts";
import type { ExtendedMarkdownSourceCode } from "../language/extended-markdown-language.ts";
import { getSourceLocationFromRange } from "./ast.ts";

export type ParsedMathBlock = {
  openingSequence: {
    text: string;
    range: [number, number];
    loc: SourceLocation;
  };
  content: {
    text: string;
    range: [number, number];
    loc: SourceLocation;
  };
  closingSequence: {
    text: string;
    range: [number, number];
    loc: SourceLocation;
  } | null;
  after: {
    text: string;
    range: [number, number];
    loc: SourceLocation;
  } | null;
};
/**
 * Parse the math block.
 */
export function parseMathBlock(
  sourceCode: ExtendedMarkdownSourceCode,
  node: Math,
): ParsedMathBlock | null {
  const range = sourceCode.getRange(node);
  const text = sourceCode.text.slice(...range);
  const parsedOpening = parseMathOpeningSequenceFromText(text);
  if (parsedOpening === null) return null;

  const openingSequenceRange: [number, number] = [
    range[0],
    range[0] + parsedOpening.openingSequence.length,
  ];
  const openingSequence: {
    text: string;
    range: [number, number];
    loc: SourceLocation;
  } = {
    text: parsedOpening.openingSequence,
    range: openingSequenceRange,
    loc: getSourceLocationFromRange(sourceCode, node, openingSequenceRange),
  };
  const parsedClosing = parseMathClosingSequenceFromText(text);
  if (
    parsedClosing == null ||
    parsedClosing.closingSequence !== parsedOpening.openingSequence
  ) {
    const contentRange: [number, number] = [
      openingSequence.range[1] + parsedOpening.after.length,
      range[1],
    ];
    return {
      openingSequence,
      content: {
        text: text.slice(parsedOpening.after.length),
        range: contentRange,
        loc: getSourceLocationFromRange(sourceCode, node, contentRange),
      },
      closingSequence: null,
      after: null,
    };
  }
  const spaceAfterClosingRange: [number, number] = [
    range[1] - parsedClosing.after.length,
    range[1],
  ];
  const spaceAfterClosing: {
    text: string;
    range: [number, number];
    loc: SourceLocation;
  } = {
    text: parsedClosing.after,
    range: spaceAfterClosingRange,
    loc: getSourceLocationFromRange(sourceCode, node, spaceAfterClosingRange),
  };
  const closingSequenceRange: [number, number] = [
    spaceAfterClosing.range[0] - parsedClosing.closingSequence.length,
    spaceAfterClosing.range[0],
  ];
  const closingSequence: {
    text: string;
    range: [number, number];
    loc: SourceLocation;
  } = {
    text: parsedClosing.closingSequence,
    range: closingSequenceRange,
    loc: getSourceLocationFromRange(sourceCode, node, closingSequenceRange),
  };
  const contentRange: [number, number] = [
    openingSequence.range[1] + parsedOpening.after.length,
    closingSequence.range[0] - parsedClosing.before.length,
  ];
  const contentText = sourceCode.text.slice(...contentRange);
  return {
    openingSequence,
    content: {
      text: contentText,
      range: contentRange,
      loc: getSourceLocationFromRange(sourceCode, node, contentRange),
    },
    closingSequence,
    after:
      spaceAfterClosing.range[0] < spaceAfterClosing.range[1]
        ? spaceAfterClosing
        : null,
  };
}

/**
 * Parse the opening sequence from a text string.
 */
export function parseMathOpeningSequenceFromText(text: string): {
  openingSequence: string;
  after: string;
} | null {
  if (!text.startsWith("$")) {
    return null;
  }

  let openingSequenceAfterOffset = 1;
  while (
    openingSequenceAfterOffset < text.length &&
    text[openingSequenceAfterOffset] === "$"
  ) {
    openingSequenceAfterOffset++;
  }
  const afterOffset = skipWhitespace(openingSequenceAfterOffset);
  if (afterOffset === openingSequenceAfterOffset || afterOffset >= text.length)
    return null;

  return {
    openingSequence: text.slice(0, openingSequenceAfterOffset),
    after: text.slice(openingSequenceAfterOffset, afterOffset),
  };

  /**
   * Skip whitespace characters at the start of the text.
   */
  function skipWhitespace(index: number) {
    let inIndent = false;
    let result = index;
    let c: string;
    while (
      result < text.length &&
      (c = text[result]) &&
      (isWhitespace(c) || (inIndent && c === ">"))
    ) {
      result++;
      if (c === "\n") {
        inIndent = true;
      } else if (inIndent) {
        inIndent = isWhitespace(c) || c === ">";
      }
    }
    return result;
  }
}

/**
 * Parse the closing sequence from a text string.
 */
export function parseMathClosingSequenceFromText(text: string): {
  closingSequence: string;
  before: string;
  after: string;
} | null {
  const trimmedEndOffset = skipEndWhitespace(text.length - 1) + 1;
  if (trimmedEndOffset <= 0 || text[trimmedEndOffset - 1] !== "$") {
    return null;
  }

  let closingSequenceBeforeOffset = trimmedEndOffset - 2;
  while (
    closingSequenceBeforeOffset >= 0 &&
    text[closingSequenceBeforeOffset] === "$"
  ) {
    closingSequenceBeforeOffset--;
  }
  const beforeOffset = skipEndWhitespace(closingSequenceBeforeOffset);
  if (beforeOffset === closingSequenceBeforeOffset || beforeOffset < 0)
    return null;

  return {
    before: text.slice(beforeOffset + 1, closingSequenceBeforeOffset + 1),
    closingSequence: text.slice(
      closingSequenceBeforeOffset + 1,
      trimmedEndOffset,
    ),
    after: text.slice(trimmedEndOffset),
  };

  /**
   * Skip whitespace characters at the end of the text.
   */
  function skipEndWhitespace(index: number) {
    let result = index;
    let c: string | undefined;
    while (result >= 0 && (c = text[result]) && isWhitespace(c)) {
      result--;
    }
    if (c === ">") {
      let index2 = result - 1;
      while (
        index2 >= 0 &&
        (c = text[index2]) &&
        (isSpaceOrTab(c) || c === ">")
      ) {
        index2--;
      }
      if (c === "\n") {
        // Skip the whitespace before the line break and the blockquote markers
        return skipEndWhitespace(index2);
      }
    }
    return result;
  }
}
