import type { Table } from "../language/ast-types.ts";
import { createRule } from "../utils/index.ts";
import type {
  ParsedTable,
  ParsedTableDelimiterRow,
  ParsedTableRow,
} from "../utils/table.ts";
import { parseTable } from "../utils/table.ts";
import type { SourceLocation } from "estree";
import { getTextWidth } from "../utils/text-width.ts";
import { getCurrentTablePipeSpacingOption } from "./table-pipe-spacing.ts";

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

    class TableContext {
      public readonly rows: RowData[];

      public readonly columnCount: number;

      private readonly _cacheHasSpaceBetweenContentAndTrailingPipe = new Map<
        number,
        boolean
      >();

      private readonly _cacheExpectedPipePosition = new Map<
        number,
        number | null
      >();

      public constructor(parsed: ParsedTable) {
        const rows: RowData[] = [
          parsedTableRowToRowData(parsed.headerRow),
          parsedTableDelimiterRowToRowData(parsed.delimiterRow),
        ];
        for (const bodyRow of parsed.bodyRows) {
          rows.push(parsedTableRowToRowData(bodyRow));
        }
        this.rows = rows;

        let columnCount = 0;
        for (const row of rows) {
          columnCount = Math.max(columnCount, row.cells.length);
        }
        this.columnCount = columnCount;
      }

      /**
       * Get the expected pipe position for the index
       */
      public getExpectedPipePosition(pipeIndex: number): number | null {
        let v = this._cacheExpectedPipePosition.get(pipeIndex);
        if (v !== undefined) return v;
        v = this._computeExpectedPipePositionWithoutCache(pipeIndex);
        this._cacheExpectedPipePosition.set(pipeIndex, v);
        return v;
      }

      /**
       * Check if there is at least one space between content and trailing pipe
       * for the index
       *
       * This is used to determine if the pipe should be aligned with a space before it.
       */
      public hasSpaceBetweenContentAndTrailingPipe(pipeIndex: number): boolean {
        if (pipeIndex === 0) return false;
        let v = this._cacheHasSpaceBetweenContentAndTrailingPipe.get(pipeIndex);
        if (v != null) return v;
        v = this._hasSpaceBetweenContentAndTrailingPipeWithoutCache(pipeIndex);
        this._cacheHasSpaceBetweenContentAndTrailingPipe.set(pipeIndex, v);
        return v;
      }

      /**
       * Get the expected pipe position for the index
       */
      private _computeExpectedPipePositionWithoutCache(
        pipeIndex: number,
      ): number | null {
        if (pipeIndex === 0) {
          const firstCell = this.rows[0].cells[0] as CellData;
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
          return this.getMinimumPipePosition(pipeIndex);
        } else if (columnOption === "consistent") {
          const columnIndex = pipeIndex - 1;
          for (const row of this.rows) {
            if (row.cells.length <= columnIndex) continue;
            const cell = row.cells[columnIndex];
            if (cell.type === "delimiter" || !cell.trailingPipe) continue;
            const width = getTextWidth(
              sourceCode.lines[cell.trailingPipe.loc.start.line - 1].slice(
                0,
                cell.trailingPipe.loc.start.column - 1,
              ),
            );
            return Math.max(width, this.getMinimumPipePosition(pipeIndex) || 0);
          }
        }
        return null;
      }

      /**
       * Get the minimum pipe position for the index
       */
      private getMinimumPipePosition(pipeIndex: number): number | null {
        const spacingRuleOptions = getCurrentTablePipeSpacingOption(sourceCode);
        const needSpaceBeforePipe = spacingRuleOptions
          ? spacingRuleOptions.trailingSpace === "always"
          : this.hasSpaceBetweenContentAndTrailingPipe(pipeIndex);
        let maxWidth = 0;
        const columnIndex = pipeIndex - 1;
        for (const row of this.rows) {
          if (row.cells.length <= columnIndex) continue;
          const cell = row.cells[columnIndex];
          let width: number;
          if (cell.type === "delimiter") {
            const minimumDelimiterLength = getMinimumDelimiterLength(
              cell.align,
            );
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
          if (needSpaceBeforePipe) {
            // There is space between content and trailing pipe
            width += 1; // space
          }
          maxWidth = Math.max(maxWidth, width);
        }
        return maxWidth;
      }

      /**
       * Check if there is at least one space between content and trailing pipe
       */
      private _hasSpaceBetweenContentAndTrailingPipeWithoutCache(
        pipeIndex: number,
      ) {
        const columnIndex = pipeIndex - 1;
        for (const row of this.rows) {
          if (row.cells.length <= columnIndex) continue;
          const cell = row.cells[columnIndex];
          if (!cell.trailingPipe) continue;
          let content: TokenData;
          if (cell.type === "delimiter") {
            content = cell.delimiter;
          } else {
            if (!cell.content) continue;
            content = cell.content;
          }
          if (content.range[1] < cell.trailingPipe.range[0]) continue;
          return false;
        }
        return true;
      }
    }

    /**
     * Verify the table pipes
     */
    function verifyTablePipes(table: TableContext) {
      const targetRows = [...table.rows];
      for (const row of targetRows) {
        for (let pipeIndex = 0; pipeIndex <= table.columnCount; pipeIndex++) {
          if (!verifyRowPipe(row, pipeIndex, table)) {
            break;
          }
        }
      }
    }

    /**
     * Verify the pipe in the row
     */
    function verifyRowPipe(
      row: RowData,
      pipeIndex: number,
      table: TableContext,
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
      return verifyPipe(pipeToken, pipeIndex, table, cell);
    }

    /**
     * Verify the pipe position
     */
    function verifyPipe(
      pipe: TokenData,
      pipeIndex: number,
      table: TableContext,
      cell: CellData | DelimiterData,
    ): boolean {
      const expected = table.getExpectedPipePosition(pipeIndex);
      if (expected == null) return true;
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
            if (pipeIndex === 0 || cell.type === "cell") {
              return fixer.insertTextBeforeRange(pipe.range, " ".repeat(diff));
            }
            // For delimiter cells
            return fixer.insertTextAfterRange(
              [cell.delimiter.range[0], cell.delimiter.range[0] + 1],
              "-".repeat(diff),
            );
          }
          const baseEdit = fixRemoveSpaces();
          if (baseEdit) return baseEdit;
          if (pipeIndex === 0 || cell.type === "cell") {
            return null;
          }
          // For delimiter cells
          const beforeDelimiter = sourceCode.lines[
            cell.delimiter.loc.start.line - 1
          ].slice(0, cell.delimiter.loc.start.column - 1);
          const widthBeforeDelimiter = getTextWidth(beforeDelimiter);
          const newLength = expected - widthBeforeDelimiter;
          const minimumDelimiterLength = getMinimumDelimiterLength(cell.align);
          const spaceAfter = table.hasSpaceBetweenContentAndTrailingPipe(
            pipeIndex,
          )
            ? " "
            : "";
          if (newLength < minimumDelimiterLength + spaceAfter.length) {
            // Can't fix because it requires removing non-space characters
            return null;
          }
          const delimiterPrefix =
            cell.align === "left" || cell.align === "center" ? ":" : "";
          const delimiterSuffix =
            (cell.align === "right" || cell.align === "center" ? ":" : "") +
            spaceAfter;
          const newDelimiter = "-".repeat(
            newLength - delimiterPrefix.length - delimiterSuffix.length,
          );
          return fixer.replaceTextRange(
            [cell.delimiter.range[0], pipe.range[0]],
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
            const newSpacesLength = expected! - widthBeforePipe;
            if (
              newSpacesLength <
              (table.hasSpaceBetweenContentAndTrailingPipe(pipeIndex) ? 1 : 0)
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
     * Get the minimum delimiter length based on alignment
     */
    function getMinimumDelimiterLength(
      align: "left" | "right" | "center" | "none",
    ): number {
      return align === "none" ? 1 : align === "center" ? 3 : 2;
    }

    return {
      table(node: Table) {
        const parsed = parseTable(sourceCode, node);
        if (!parsed) return;
        verifyTablePipes(new TableContext(parsed));
      },
    };
  },
});

/**
 * Convert a parsed table row to row data
 */
function parsedTableRowToRowData(parsedRow: ParsedTableRow): RowData {
  return {
    cells: parsedRow.cells.map((cell, index) => {
      const nextCell =
        index + 1 < parsedRow.cells.length ? parsedRow.cells[index + 1] : null;
      return {
        type: "cell",
        leadingPipe: cell.leadingPipe,
        content: cell.cell,
        trailingPipe: nextCell ? nextCell.leadingPipe : parsedRow.trailingPipe,
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
