import type { Table } from "mdast";
import { createRule } from "../utils/index.ts";
import type {
  ParsedTableDelimiterRow,
  ParsedTableRow,
} from "../utils/table.ts";
import { parseTable } from "../utils/table.ts";
import type { SourceLocation } from "estree";
import { getTextWidth } from "../utils/get-text-width.ts";

type Options = {
  column?: "minimum" | "consistent";
};
export default createRule<[Options]>("table-pipe-alignment", {
  meta: {
    type: "layout",
    docs: {
      description: "enforce consistent alignment of table pipes",
      categories: ["standard"],
      listCategory: "Decorative",
    },
    fixable: "code",
    hasSuggestions: false,
    schema: [
      {
        type: "object",
        properties: {
          column: { enum: ["minimum", "consistent"] },
        },
        additionalProperties: false,
      },
    ],
    messages: {
      addSpaces:
        "Table pipe should be aligned at column {{expected}} (add {{count}} character{{plural}}).",
      removeSpaces:
        "Table pipe should be aligned at column {{expected}} (remove {{count}} character{{plural}}).",
    },
  },
  create(context) {
    const sourceCode = context.sourceCode;
    const options = context.options[0] || {};
    const columnOption = options.column || "minimum";

    type TokenData = {
      range: [number, number];
      loc: SourceLocation;
    };
    type CellData = {
      type: "cell";
      leadingPipe: TokenData | null;
      content: TokenData | null;
      trailingPipe: TokenData | null;
    };
    type DelimiterData = {
      type: "delimiter";
      leadingPipe: TokenData | null;
      delimiter: TokenData;
      align: "left" | "right" | "center" | "none";
      trailingPipe: TokenData | null;
    };
    type RowData = {
      cells: (CellData | DelimiterData)[];
    };

    /**
     * Verify the table pipes
     */
    function verifyTablePipes(rows: RowData[]) {
      let columnCount = 0;
      for (const row of rows) {
        columnCount = Math.max(columnCount, row.cells.length);
      }
      let targetRows = [...rows];
      for (let pipeIndex = 0; pipeIndex <= columnCount; pipeIndex++) {
        const expected = getExpectedPipePosition(rows, pipeIndex);
        if (expected == null) continue;

        const unreportedRows: RowData[] = [];
        for (const row of targetRows) {
          if (verifyRowPipe(row, pipeIndex, expected)) {
            unreportedRows.push(row);
          }
        }
        targetRows = unreportedRows;
        if (targetRows.length === 0) {
          // All rows are verified
          break;
        }
      }
    }

    /**
     * Verify the pipe in the row
     */
    function verifyRowPipe(
      row: RowData,
      pipeIndex: number,
      expected: number,
    ): boolean {
      let cellIndex: number;
      let pipe: "leadingPipe" | "trailingPipe";
      if (pipeIndex === 0) {
        cellIndex = 0;
        pipe = "leadingPipe";
      } else {
        cellIndex = pipeIndex - 1;
        pipe = "trailingPipe";
      }
      if (row.cells.length <= cellIndex) return true;
      const cell = row.cells[cellIndex];
      const pipeToken = cell[pipe];
      if (!pipeToken) return true;
      return verifyPipe(pipeToken, expected, { cell, pipeIndex });
    }

    /**
     * Verify the pipe position
     */
    function verifyPipe(
      pipe: TokenData,
      expected: number,
      cxt: { cell: CellData | DelimiterData; pipeIndex: number },
    ): boolean {
      const actual = getTextWidth(
        sourceCode.lines[pipe.loc.start.line - 1].slice(
          0,
          pipe.loc.start.column - 1,
        ),
      );
      const diff = expected - actual;
      if (diff === 0) return true;
      context.report({
        loc: pipe.loc,
        messageId: diff > 0 ? "addSpaces" : "removeSpaces",
        data: {
          expected: String(expected),
          count: String(Math.abs(diff)),
          plural: Math.abs(diff) === 1 ? "" : "s",
        },
        fix(fixer) {
          if (diff > 0) {
            if (cxt.pipeIndex === 0 || cxt.cell.type === "cell") {
              return fixer.insertTextBeforeRange(pipe.range, " ".repeat(diff));
            }
            // For delimiter cells
            return fixer.insertTextAfterRange(
              [cxt.cell.delimiter.range[0], cxt.cell.delimiter.range[0] + 1],
              "-".repeat(diff),
            );
          }
          const baseEdit = fixRemoveSpaces();
          if (baseEdit) return baseEdit;
          if (cxt.pipeIndex === 0 || cxt.cell.type === "cell") {
            return null;
          }
          // For delimiter cells
          const beforeDelimiter = sourceCode.lines[
            cxt.cell.delimiter.loc.start.line - 1
          ].slice(0, cxt.cell.delimiter.loc.start.column - 1);
          const widthBeforeDelimiter = getTextWidth(beforeDelimiter);
          const newLength = expected - widthBeforeDelimiter;
          const minimumDelimiterLength = getMinimumDelimiterLength(
            cxt.cell.align,
          );
          const spaceAfter = isNeedSpaceAfterContent(cxt.cell) ? " " : "";
          if (newLength < minimumDelimiterLength + spaceAfter.length) {
            // Can't fix because it requires removing non-space characters
            return null;
          }
          const delimiterPrefix =
            cxt.cell.align === "left" || cxt.cell.align === "center" ? ":" : "";
          const delimiterSuffix =
            (cxt.cell.align === "right" || cxt.cell.align === "center"
              ? ":"
              : "") + spaceAfter;
          const newDelimiter = "-".repeat(
            newLength - delimiterPrefix.length - delimiterSuffix.length,
          );
          return fixer.replaceTextRange(
            [cxt.cell.delimiter.range[0], pipe.range[0]],
            delimiterPrefix + newDelimiter + delimiterSuffix,
          );

          /**
           * Fixer to remove spaces before the pipe
           */
          function fixRemoveSpaces() {
            const beforePipe = sourceCode.lines[pipe.loc.start.line - 1].slice(
              0,
              pipe.loc.start.column - 1,
            );
            const trimmedBeforePipe = beforePipe.trimEnd();
            const spacesBeforePipeLength =
              beforePipe.length - trimmedBeforePipe.length;
            const widthBeforePipe = getTextWidth(trimmedBeforePipe);
            const newSpacesLength = expected - widthBeforePipe;
            if (
              newSpacesLength <
              (cxt.pipeIndex > 0 && isNeedSpaceAfterContent(cxt.cell) ? 1 : 0)
            ) {
              // Can't fix because it requires removing non-space characters
              return null;
            }
            return fixer.replaceTextRange(
              [pipe.range[0] - spacesBeforePipeLength, pipe.range[0]],
              " ".repeat(newSpacesLength),
            );
          }
        },
      });
      return false;
    }

    /**
     * Get the expected pipe position for the index
     */
    function getExpectedPipePosition(
      rows: RowData[],
      pipeIndex: number,
    ): number | null {
      if (pipeIndex === 0) {
        const firstCell = rows[0].cells[0] as CellData;
        const firstToken = firstCell.leadingPipe ?? firstCell.content;
        if (!firstToken) return null;
        return getTextWidth(
          sourceCode.lines[firstToken.loc.start.line - 1].slice(
            0,
            firstToken.loc.start.column - 1,
          ),
        );
      }
      if (columnOption === "minimum") {
        return getMinimumPipePosition(rows, pipeIndex);
      } else if (columnOption === "consistent") {
        const columnIndex = pipeIndex - 1;
        for (const row of rows) {
          if (row.cells.length <= columnIndex) continue;
          const cell = row.cells[columnIndex];
          if (cell.type === "delimiter" || !cell.trailingPipe) continue;
          const width = getTextWidth(
            sourceCode.lines[cell.trailingPipe.loc.start.line - 1].slice(
              0,
              cell.trailingPipe.loc.start.column - 1,
            ),
          );
          return Math.max(width, getMinimumPipePosition(rows, pipeIndex) || 0);
        }
      }
      return null;
    }

    /**
     * Get the minimum pipe position for the index
     */
    function getMinimumPipePosition(
      rows: RowData[],
      pipeIndex: number,
    ): number | null {
      let maxWidth = 0;
      const columnIndex = pipeIndex - 1;
      for (const row of rows) {
        if (row.cells.length <= columnIndex) continue;
        const cell = row.cells[columnIndex];
        let width: number;
        if (cell.type === "delimiter") {
          const minimumDelimiterLength = getMinimumDelimiterLength(cell.align);
          width =
            getTextWidth(
              sourceCode.lines[cell.delimiter.loc.start.line - 1].slice(
                0,
                cell.delimiter.loc.start.column - 1,
              ),
            ) + minimumDelimiterLength;
        } else {
          if (!cell.content) continue;
          width = getTextWidth(
            sourceCode.lines[cell.content.loc.end.line - 1].slice(
              0,
              cell.content.loc.end.column - 1,
            ),
          );
        }
        if (isNeedSpaceAfterContent(cell)) {
          // There is space between content and trailing pipe
          width += 1; // space
        }
        maxWidth = Math.max(maxWidth, width);
      }
      return maxWidth;
    }

    /**
     * Get the minimum delimiter length based on alignment
     */
    function getMinimumDelimiterLength(
      align: "left" | "right" | "center" | "none",
    ): number {
      return align === "none" ? 1 : align === "center" ? 3 : 2;
    }

    /**
     * Check if a cell needs a space after its content
     */
    function isNeedSpaceAfterContent(cell: CellData | DelimiterData) {
      let content: TokenData;
      if (cell.type === "delimiter") {
        content = cell.delimiter;
      } else {
        if (!cell.content) return false;
        content = cell.content;
      }
      return cell.trailingPipe && content.range[1] < cell.trailingPipe.range[0];
    }

    /**
     * Convert a parsed table row to row data
     */
    function parsedTableRowToRowData(parsedRow: ParsedTableRow): RowData {
      return {
        cells: parsedRow.cells.map((cell, index) => {
          const nextCell =
            index + 1 < parsedRow.cells.length
              ? parsedRow.cells[index + 1]
              : null;
          return {
            type: "cell",
            leadingPipe: cell.leadingPipe,
            content: cell.cell,
            trailingPipe: nextCell
              ? nextCell.leadingPipe
              : parsedRow.trailingPipe,
          };
        }),
      };
    }

    /**
     * Convert a parsed table delimiter row to row data
     */
    function parsedTableDelimiterRowToRowData(
      parsedDelimiterRow: ParsedTableDelimiterRow,
    ): RowData {
      return {
        cells: parsedDelimiterRow.delimiters.map((cell, index) => {
          const nextCell =
            index + 1 < parsedDelimiterRow.delimiters.length
              ? parsedDelimiterRow.delimiters[index + 1]
              : null;
          return {
            type: "delimiter",
            leadingPipe: cell.leadingPipe,
            delimiter: cell.delimiter,
            align: cell.delimiter.align,
            trailingPipe: nextCell
              ? nextCell.leadingPipe
              : parsedDelimiterRow.trailingPipe,
          };
        }),
      };
    }

    return {
      table(node: Table) {
        const parsed = parseTable(sourceCode, node);
        if (!parsed) return;
        const rows: RowData[] = [
          parsedTableRowToRowData(parsed.headerRow),
          parsedTableDelimiterRowToRowData(parsed.delimiterRow),
        ];
        for (const bodyRow of parsed.bodyRows) {
          rows.push(parsedTableRowToRowData(bodyRow));
        }
        verifyTablePipes(rows);
      },
    };
  },
});
