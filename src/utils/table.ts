import type { SourceLocation } from "estree";
import type { Table, TableRow } from "../language/ast-types.ts";
import { ForwardCharacterCursor } from "./character-cursor.ts";
import { isSpaceOrTab } from "./unicode.ts";
import { getSourceLocationFromRange } from "./ast.ts";
import type { ExtendedMarkdownSourceCode } from "../language/extended-markdown-language.ts";

type Token = {
  text: string;
  range: [number, number];
  loc: SourceLocation;
};
export type ParsedTableDelimiter = {
  leadingPipe: Token | null;
  delimiter: Token & {
    align: "left" | "right" | "center" | "none";
  };
};
export type ParsedTableDelimiterRow = {
  range: [number, number];
  loc: SourceLocation;
  delimiters: ParsedTableDelimiter[];
  trailingPipe: Token | null;
};
export type ParsedTableCell = {
  leadingPipe: Token | null;
  cell: {
    range: [number, number];
    loc: SourceLocation;
  } | null;
};
export type ParsedTableRow = {
  range: [number, number];
  loc: SourceLocation;
  cells: ParsedTableCell[];
  trailingPipe: Token | null;
};
export type ParsedTable = {
  headerRow: ParsedTableRow;
  delimiterRow: ParsedTableDelimiterRow;
  bodyRows: ParsedTableRow[];
};
/**
 * Parse the table.
 */
export function parseTable(
  sourceCode: ExtendedMarkdownSourceCode,
  node: Table,
): ParsedTable | null {
  const headerRow = parseTableRow(sourceCode, node.children[0]);
  if (!headerRow) return null;
  const delimiterRow = parseTableDelimiterRow(sourceCode, node);
  if (!delimiterRow) return null;
  const bodyRows: ParsedTableRow[] = [];
  for (const child of node.children.slice(1)) {
    const bodyRow = parseTableRow(sourceCode, child);
    if (!bodyRow) return null;
    bodyRows.push(bodyRow);
  }
  return {
    headerRow,
    delimiterRow,
    bodyRows,
  };
}

/**
 * Parse the table delimiter row.
 */
export function parseTableDelimiterRow(
  sourceCode: ExtendedMarkdownSourceCode,
  node: Table,
): ParsedTableDelimiterRow | null {
  const headerRow = node.children[0];
  const headerRange = sourceCode.getRange(headerRow);
  const delimiterEndIndex =
    node.children.length > 1
      ? sourceCode.getRange(node.children[1])[0]
      : sourceCode.getRange(node)[1];
  const delimiterText = sourceCode.text.slice(
    headerRange[1],
    delimiterEndIndex,
  );
  const parsed = parseTableDelimiterRowFromText(delimiterText);
  if (!parsed) return null;
  const delimiters: ParsedTableDelimiterRow["delimiters"] =
    parsed.delimiters.map((d) => {
      let leadingPipe: Token | null = null;
      if (d.leadingPipe) {
        const leadingPipeRange: [number, number] = [
          headerRange[1] + d.leadingPipe.range[0],
          headerRange[1] + d.leadingPipe.range[1],
        ];
        leadingPipe = {
          text: d.leadingPipe.text,
          range: leadingPipeRange,
          loc: getSourceLocationFromRange(
            sourceCode,
            headerRow,
            leadingPipeRange,
          ),
        };
      }
      const delimiterRange: [number, number] = [
        headerRange[1] + d.delimiter.range[0],
        headerRange[1] + d.delimiter.range[1],
      ];
      return {
        leadingPipe,
        delimiter: {
          text: d.delimiter.text,
          align: d.delimiter.text.startsWith(":")
            ? d.delimiter.text.endsWith(":")
              ? "center"
              : "left"
            : d.delimiter.text.endsWith(":")
              ? "right"
              : "none",
          range: delimiterRange,
          loc: getSourceLocationFromRange(
            sourceCode,
            headerRow,
            delimiterRange,
          ),
        },
      };
    });

  let trailingPipe: ParsedTableDelimiterRow["trailingPipe"] = null;
  if (parsed.trailingPipe) {
    const trailingPipeRange: [number, number] = [
      headerRange[1] + parsed.trailingPipe.range[0],
      headerRange[1] + parsed.trailingPipe.range[1],
    ];
    trailingPipe = {
      text: parsed.trailingPipe.text,
      range: trailingPipeRange,
      loc: getSourceLocationFromRange(sourceCode, headerRow, trailingPipeRange),
    };
  }
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

/**
 * Parse the table row.
 */
export function parseTableRow(
  sourceCode: ExtendedMarkdownSourceCode,
  node: TableRow,
): ParsedTableRow | null {
  const cells: ParsedTableCell[] = [];
  let trailingPipe: Token | null = null;
  for (const cell of node.children) {
    const cellRange = sourceCode.getRange(cell);
    const cellLoc = sourceCode.getLoc(cell);
    const leadingPipe =
      sourceCode.text[cellRange[0]] === "|"
        ? {
            text: "|",
            range: [cellRange[0], cellRange[0] + 1] as [number, number],
            loc: {
              start: cellLoc.start,
              end: {
                line: cellLoc.start.line,
                column: cellLoc.start.column + 1,
              },
            },
          }
        : null;
    if (trailingPipe && leadingPipe) {
      // There should be only one pipe between cells
      return null;
    }

    let parsedCell: {
      range: [number, number];
      loc: SourceLocation;
    } | null = null;
    if (cell.children.length > 0) {
      const firstChild = cell.children[0];
      const lastChild = cell.children[cell.children.length - 1];
      parsedCell = {
        range: [
          sourceCode.getRange(firstChild)[0],
          sourceCode.getRange(lastChild)[1],
        ],
        loc: {
          start: sourceCode.getLoc(firstChild).start,
          end: sourceCode.getLoc(lastChild).end,
        },
      };
    }
    cells.push({
      leadingPipe,
      cell: parsedCell,
    });
    trailingPipe =
      sourceCode.text[cellRange[1] - 1] === "|"
        ? {
            text: "|",
            range: [cellRange[1] - 1, cellRange[1]] as [number, number],
            loc: {
              start: {
                line: cellLoc.end.line,
                column: cellLoc.end.column - 1,
              },
              end: cellLoc.end,
            },
          }
        : null;
  }
  const firstToken = cells[0].leadingPipe ?? cells[0].cell;
  const lastToken =
    trailingPipe ??
    cells[cells.length - 1].cell ??
    cells[cells.length - 1].leadingPipe;
  return {
    cells,
    trailingPipe,
    range: [firstToken!.range[0], lastToken!.range[1]],
    loc: {
      start: firstToken!.loc.start,
      end: lastToken!.loc.end,
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
