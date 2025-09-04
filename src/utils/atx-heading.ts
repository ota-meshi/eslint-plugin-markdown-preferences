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
    raws: {
      spaceAfter: {
        text: string;
        range: [number, number];
        loc: SourceLocation;
      };
    };
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
    raws: {
      spaceBefore: {
        text: string;
        range: [number, number];
        loc: SourceLocation;
      };
      spaceAfter: {
        text: string;
        range: [number, number];
        loc: SourceLocation;
      };
    };
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
  const spaceAfterOpening: {
    text: string;
    range: [number, number];
    loc: SourceLocation;
  } = {
    text: parsedOpening.rawAfter,
    range: [
      openingSequence.range[1],
      openingSequence.range[1] + parsedOpening.rawAfter.length,
    ],
    loc: {
      start: openingSequence.loc.end,
      end: {
        line: openingSequence.loc.end.line,
        column: openingSequence.loc.end.column + parsedOpening.rawAfter.length,
      },
    },
  };
  const parsedClosing = parseATXHeadingClosingSequenceFromText(text);
  if (parsedClosing == null) {
    const textAfterOpening = sourceCode.text.slice(
      spaceAfterOpening.range[1],
      range[1],
    );
    const contentText = textAfterOpening.trimEnd();
    return {
      openingSequence: {
        ...openingSequence,
        raws: {
          spaceAfter: spaceAfterOpening,
        },
      },
      content: {
        text: contentText,
        range: [
          spaceAfterOpening.range[1],
          spaceAfterOpening.range[1] + contentText.length,
        ],
        loc: {
          start: spaceAfterOpening.loc.end,
          end: {
            line: loc.end.line,
            column:
              loc.end.column - (textAfterOpening.length - contentText.length),
          },
        },
      },
      closingSequence: null,
    };
  }
  const spaceAfterClosing: {
    text: string;
    range: [number, number];
    loc: SourceLocation;
  } = {
    text: parsedClosing.rawAfter,
    range: [range[1] - parsedClosing.rawAfter.length, range[1]],
    loc: {
      start: {
        line: loc.end.line,
        column: loc.end.column - parsedClosing.rawAfter.length,
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
  const spaceBeforeClosing: {
    text: string;
    range: [number, number];
    loc: SourceLocation;
  } = {
    text: parsedClosing.rawBefore,
    range: [
      closingSequence.range[0] - parsedClosing.rawBefore.length,
      closingSequence.range[0],
    ],
    loc: {
      start: {
        line: closingSequence.loc.start.line,
        column:
          closingSequence.loc.start.column - parsedClosing.rawBefore.length,
      },
      end: closingSequence.loc.start,
    },
  };
  const contentText = sourceCode.text.slice(
    spaceAfterOpening.range[1],
    spaceBeforeClosing.range[0],
  );
  return {
    openingSequence: {
      ...openingSequence,
      raws: {
        spaceAfter: spaceAfterOpening,
      },
    },
    content: {
      text: contentText,
      range: [spaceAfterOpening.range[1], spaceBeforeClosing.range[0]],
      loc: {
        start: spaceAfterOpening.loc.end,
        end: spaceBeforeClosing.loc.start,
      },
    },
    closingSequence: {
      ...closingSequence,
      raws: {
        spaceBefore: spaceBeforeClosing,
        spaceAfter: spaceAfterClosing,
      },
    },
  };
}

/**
 * Parse the opening sequence from a text string.
 */
export function parseATXHeadingOpeningSequenceFromText(text: string): {
  openingSequence: string;
  rawAfter: string;
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
    rawAfter: text.slice(openingSequenceAfterOffset, afterOffset),
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
    while (result >= 0 && (c = text[result]) && isSpaceOrTab(c)) {
      result--;
    }
    return result;
  }
}
