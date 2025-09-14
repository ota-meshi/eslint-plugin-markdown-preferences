import type { MarkdownSourceCode } from "@eslint/markdown";
import type { SourceLocation } from "estree";
import type { Table } from "mdast";
import { ForwardCharacterCursor } from "./character-cursor.ts";
import { isSpaceOrTab } from "./unicode.ts";
import { getParsedLines } from "./lines.ts";

type Token = {
  text: string;
  range: [number, number];
  loc: SourceLocation;
};
export type ParsedTableDelimiter = {
  leadingPipe: Token | null;
  delimiter: Token;
};
export type ParsedTableDelimiterRow = {
  range: [number, number];
  loc: SourceLocation;
  delimiters: ParsedTableDelimiter[];
  trailingPipe: Token | null;
};

/**
 * Parse the table delimiter row.
 */
export function parseTableDelimiterRow(
  sourceCode: MarkdownSourceCode,
  node: Table,
): ParsedTableDelimiterRow | null {
  const headerRow = node.children[0];

  const headerLoc = sourceCode.getLoc(headerRow);
  const parsedLines = getParsedLines(sourceCode);
  const delimiterLine = parsedLines.get(headerLoc.end.line + 1);
  const parsed = parseTableDelimiterRowFromText(delimiterLine.text);
  if (!parsed) return null;
  const delimiters: ParsedTableDelimiterRow["delimiters"] =
    parsed.delimiters.map((d) => {
      return {
        leadingPipe: d.leadingPipe
          ? {
              text: d.leadingPipe.text,
              range: [
                delimiterLine.range[0] + d.leadingPipe.range[0],
                delimiterLine.range[0] + d.leadingPipe.range[1],
              ],
              loc: {
                start: {
                  line: delimiterLine.line,
                  column: d.leadingPipe.range[0] + 1,
                },
                end: {
                  line: delimiterLine.line,
                  column: d.leadingPipe.range[1] + 1,
                },
              },
            }
          : null,
        delimiter: {
          text: d.delimiter.text,
          range: [
            delimiterLine.range[0] + d.delimiter.range[0],
            delimiterLine.range[0] + d.delimiter.range[1],
          ],
          loc: {
            start: {
              line: delimiterLine.line,
              column: d.delimiter.range[0] + 1,
            },
            end: {
              line: delimiterLine.line,
              column: d.delimiter.range[1] + 1,
            },
          },
        },
      };
    });
  const trailingPipe: ParsedTableDelimiterRow["trailingPipe"] =
    parsed.trailingPipe
      ? {
          text: parsed.trailingPipe.text,
          range: [
            delimiterLine.range[0] + parsed.trailingPipe.range[0],
            delimiterLine.range[0] + parsed.trailingPipe.range[1],
          ],
          loc: {
            start: {
              line: delimiterLine.line,
              column: parsed.trailingPipe.range[0] + 1,
            },
            end: {
              line: delimiterLine.line,
              column: parsed.trailingPipe.range[1] + 1,
            },
          },
        }
      : null;
  const firstToken = delimiters[0].leadingPipe ?? delimiters[0].delimiter;
  const lastToken = trailingPipe ?? delimiters[delimiters.length - 1].delimiter;
  return {
    delimiters,
    trailingPipe,
    range: [firstToken.range[0], lastToken.range[1]],
    loc: {
      start: firstToken.loc.start,
      end: lastToken.loc.end,
    },
  };
}

type RangeToken = {
  text: string;
  range: [number, number];
};

/**
 * Parse the table delimiter row from the text.
 */
export function parseTableDelimiterRowFromText(text: string): {
  delimiters: {
    leadingPipe: RangeToken | null;
    delimiter: RangeToken;
  }[];
  trailingPipe: RangeToken | null;
} | null {
  const cursor = new ForwardCharacterCursor(text);
  cursor.skipSpaces();
  while (cursor.curr() === ">") {
    cursor.next();
    cursor.skipSpaces();
  }
  const delimiters: {
    leadingPipe: RangeToken | null;
    delimiter: RangeToken;
  }[] = [];
  let pipe = consumePipe();
  while (!cursor.finished()) {
    const delimiterStart = cursor.currIndex();
    cursor.skipUntilEnd(
      (c) => c === "|" || isSpaceOrTab(c) || c === "\n" || c === "\r",
    );
    const delimiterRange: [number, number] = [
      delimiterStart,
      cursor.currIndex(),
    ];
    const delimiterText = text.slice(...delimiterRange);
    if (!/^:?-+:?$/u.test(delimiterText)) {
      // Invalid delimiter
      return null;
    }
    if (delimiters.length > 0 && pipe == null) {
      // There should be a pipe between delimiters
      return null;
    }
    delimiters.push({
      leadingPipe: pipe,
      delimiter: {
        text: delimiterText,
        range: delimiterRange,
      },
    });
    pipe = consumePipe();
  }

  return {
    delimiters,
    trailingPipe: pipe,
  };

  /**
   * Consume a pipe if exists.
   */
  function consumePipe(): RangeToken | null {
    cursor.skipSpaces();
    if (cursor.curr() === "|") {
      const pipeStart = cursor.currIndex();
      cursor.next();
      const pipeRange: [number, number] = [pipeStart, cursor.currIndex()];
      const result = {
        text: text.slice(...pipeRange),
        range: pipeRange,
      };
      cursor.skipSpaces();
      return result;
    }
    return null;
  }
}
