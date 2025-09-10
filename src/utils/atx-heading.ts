import type { SourceLocation } from "@eslint/core";
import type { MarkdownSourceCode } from "@eslint/markdown";
import type { Heading } from "mdast";
import { getHeadingKind } from "./ast.ts";
import { isSpaceOrTab } from "./unicode.ts";

export type BaseParsedATXHeading = {
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
export type ParsedATXHeadingWithClosingSequence = BaseParsedATXHeading & {
  closingSequence: NonNullable<BaseParsedATXHeading["closingSequence"]>;
};
export type ParsedATXHeadingWithoutClosingSequence = BaseParsedATXHeading & {
  closingSequence: null;
};
export type ParsedATXHeading =
  | ParsedATXHeadingWithClosingSequence
  | ParsedATXHeadingWithoutClosingSequence;
/**
 * Parse the ATX heading.
 */
export function parseATXHeading(
  sourceCode: MarkdownSourceCode,
  node: Heading,
): ParsedATXHeading | null {
  if (getHeadingKind(sourceCode, node) !== "atx") return null;
  const loc = sourceCode.getLoc(node);
  const range = sourceCode.getRange(node);
  const text = sourceCode.text.slice(...range);
  const parsedOpening = parseATXHeadingOpeningSequenceFromText(text);
  if (parsedOpening === null) return null;

  const openingSequence: {
    text: string;
    range: [number, number];
    loc: SourceLocation;
  } = {
    text: parsedOpening.openingSequence,
    range: [range[0], range[0] + parsedOpening.openingSequence.length],
    loc: {
      start: loc.start,
      end: {
        line: loc.start.line,
        column: loc.start.column + parsedOpening.openingSequence.length,
      },
    },
  };
  const contentLocStart = {
    line: openingSequence.loc.end.line,
    column: openingSequence.loc.end.column + parsedOpening.after.length,
  };
  const parsedClosing = parseATXHeadingClosingSequenceFromText(text);
  if (parsedClosing == null) {
    const textAfterOpening = sourceCode.text.slice(
      openingSequence.range[1] + parsedOpening.after.length,
      range[1],
    );
    const contentText = textAfterOpening.trimEnd();
    const contentRange: [number, number] = [
      openingSequence.range[1] + parsedOpening.after.length,
      openingSequence.range[1] +
        parsedOpening.after.length +
        contentText.length,
    ];
    const contentLocEnd = {
      line: loc.end.line,
      column: loc.end.column - (textAfterOpening.length - contentText.length),
    };
    const after: {
      text: string;
      range: [number, number];
      loc: SourceLocation;
    } | null =
      contentText === textAfterOpening
        ? null
        : {
            text: textAfterOpening.slice(contentText.length),
            range: [contentRange[1], range[1]],
            loc: {
              start: contentLocEnd,
              end: loc.end,
            },
          };
    return {
      openingSequence,
      content: {
        text: contentText,
        range: contentRange,
        loc: {
          start: contentLocStart,
          end: contentLocEnd,
        },
      },
      closingSequence: null,
      after,
    };
  }
  const spaceAfterClosing: {
    text: string;
    range: [number, number];
    loc: SourceLocation;
  } = {
    text: parsedClosing.after,
    range: [range[1] - parsedClosing.after.length, range[1]],
    loc: {
      start: {
        line: loc.end.line,
        column: loc.end.column - parsedClosing.after.length,
      },
      end: loc.end,
    },
  };
  const closingSequence: {
    text: string;
    range: [number, number];
    loc: SourceLocation;
  } = {
    text: parsedClosing.closingSequence,
    range: [
      spaceAfterClosing.range[0] - parsedClosing.closingSequence.length,
      spaceAfterClosing.range[0],
    ],
    loc: {
      start: {
        line: spaceAfterClosing.loc.start.line,
        column:
          spaceAfterClosing.loc.start.column -
          parsedClosing.closingSequence.length,
      },
      end: spaceAfterClosing.loc.start,
    },
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
      loc: {
        start: contentLocStart,
        end: {
          line: closingSequence.loc.start.line,
          column:
            closingSequence.loc.start.column - parsedClosing.before.length,
        },
      },
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
export function parseATXHeadingOpeningSequenceFromText(text: string): {
  openingSequence: string;
  after: string;
} | null {
  if (!text.startsWith("#")) {
    return null;
  }

  let openingSequenceAfterOffset = 1;
  while (
    openingSequenceAfterOffset < text.length &&
    text[openingSequenceAfterOffset] === "#"
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
    let result = index;
    let c: string;
    while (result < text.length && (c = text[result]) && isSpaceOrTab(c)) {
      result++;
    }
    return result;
  }
}

/**
 * Parse the closing sequence from a text string.
 */
export function parseATXHeadingClosingSequenceFromText(text: string): {
  closingSequence: string;
  before: string;
  after: string;
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
    let c: string;
    while (result >= 0 && (c = text[result]) && isSpaceOrTab(c)) {
      result--;
    }
    return result;
  }
}
