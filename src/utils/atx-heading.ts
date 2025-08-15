import type { SourceLocation } from "@eslint/core";
import type { MarkdownSourceCode } from "@eslint/markdown";
import type { Heading } from "mdast";

export type ParsedATXHeadingClosingSequence = {
  closingSequence: {
    text: string;
    range: [number, number];
    loc: SourceLocation;
  };
  rawBefore: {
    text: string;
    range: [number, number];
    loc: SourceLocation;
  };
  rawAfter: {
    text: string;
    range: [number, number];
    loc: SourceLocation;
  };
};
/**
 * Parse the closing sequence of an ATX heading.
 */
export function parseATXHeadingClosingSequence(
  sourceCode: MarkdownSourceCode,
  node: Heading,
):
  | ParsedATXHeadingClosingSequence
  | {
      closingSequence: null;
    }
  | null {
  const loc = sourceCode.getLoc(node);
  if (loc.start.line !== loc.end.line) {
    // It's a Setext heading
    return null;
  }
  const range = sourceCode.getRange(node);
  const parsed = parseATXHeadingClosingSequenceFromText(
    sourceCode.text.slice(...range),
  );
  if (parsed == null) {
    return {
      closingSequence: null,
    };
  }
  const rawAfter: {
    text: string;
    range: [number, number];
    loc: SourceLocation;
  } = {
    text: parsed.rawAfter,
    range: [range[1] - parsed.rawAfter.length, range[1]],
    loc: {
      start: {
        line: loc.end.line,
        column: loc.end.column - parsed.rawAfter.length,
      },
      end: {
        line: loc.end.line,
        column: loc.end.column,
      },
    },
  };
  const closingSequence: {
    text: string;
    range: [number, number];
    loc: SourceLocation;
  } = {
    text: parsed.closingSequence,
    range: [
      rawAfter.range[0] - parsed.closingSequence.length,
      rawAfter.range[0],
    ],
    loc: {
      start: {
        line: rawAfter.loc.start.line,
        column: rawAfter.loc.start.column - parsed.closingSequence.length,
      },
      end: rawAfter.loc.start,
    },
  };
  const rawBefore: {
    text: string;
    range: [number, number];
    loc: SourceLocation;
  } = {
    text: parsed.rawBefore,
    range: [
      closingSequence.range[0] - parsed.rawBefore.length,
      closingSequence.range[0],
    ],
    loc: {
      start: {
        line: closingSequence.loc.start.line,
        column: closingSequence.loc.start.column - parsed.rawBefore.length,
      },
      end: closingSequence.loc.start,
    },
  };
  return {
    rawBefore,
    closingSequence,
    rawAfter,
  };
}

/**
 * Parse the closing sequence from a text string.
 */
export function parseATXHeadingClosingSequenceFromText(text: string): {
  closingSequence: string;
  rawBefore: string;
  rawAfter: string;
} | null {
  const trimmedEndOffset = skipEndWhitespace(text.length - 1) + 1;
  if (trimmedEndOffset <= 0 || text[trimmedEndOffset - 1] !== "#") {
    return null;
  }

  let closingSequenceBeforeOffset = trimmedEndOffset - 2;
  while (
    closingSequenceBeforeOffset >= 0 &&
    text[closingSequenceBeforeOffset] === "#"
  ) {
    closingSequenceBeforeOffset--;
  }
  const beforeOffset = skipEndWhitespace(closingSequenceBeforeOffset);
  if (beforeOffset === closingSequenceBeforeOffset || beforeOffset < 0)
    return null;

  return {
    rawBefore: text.slice(beforeOffset + 1, closingSequenceBeforeOffset + 1),
    closingSequence: text.slice(
      closingSequenceBeforeOffset + 1,
      trimmedEndOffset,
    ),
    rawAfter: text.slice(trimmedEndOffset),
  };

  /**
   * Skip whitespace characters at the end of the text.
   */
  function skipEndWhitespace(index: number) {
    let result = index;
    let c: string;
    while (result >= 0 && (c = text[result]) && (c === " " || c === "\t")) {
      result--;
    }
    return result;
  }
}
