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
type DelimiterRowData = {
  cells: DelimiterData[];
};

type DelimiterMinLengthValue = "minimum" | number;
type DelimiterMinLengthOption =
  | DelimiterMinLengthValue
  | {
      defaultDelimiter?: DelimiterMinLengthValue;
      leftAlignmentDelimiter?: DelimiterMinLengthValue;
      centerAlignmentDelimiter?: DelimiterMinLengthValue;
      rightAlignmentDelimiter?: DelimiterMinLengthValue;
    };

type Options = {
  column?: "minimum" | "consistent";
  delimiterMinLength?: DelimiterMinLengthOption;
};

/**
 * Parse and normalize options
 */
function parseOptions(options: Options | undefined) {
  const columnOption = options?.column || "minimum";
  const delimiterMinLengthOption = options?.delimiterMinLength || 3;
  let delimiterMinLength: {
    defaultDelimiter: number;
    leftAlignmentDelimiter: number;
    centerAlignmentDelimiter: number;
    rightAlignmentDelimiter: number;
  };
  if (
    delimiterMinLengthOption === "minimum" ||
    delimiterMinLengthOption == null
  ) {
    delimiterMinLength = {
      defaultDelimiter: 1,
      leftAlignmentDelimiter: 2,
      centerAlignmentDelimiter: 3,
      rightAlignmentDelimiter: 2,
    };
  } else if (typeof delimiterMinLengthOption === "number") {
    const v = Math.max(3, delimiterMinLengthOption);
    delimiterMinLength = {
      defaultDelimiter: v,
      leftAlignmentDelimiter: v,
      centerAlignmentDelimiter: v,
      rightAlignmentDelimiter: v,
    };
  } else {
    delimiterMinLength = {
      defaultDelimiter:
        typeof delimiterMinLengthOption.defaultDelimiter === "number"
          ? Math.max(1, delimiterMinLengthOption.defaultDelimiter)
          : 3,
      leftAlignmentDelimiter:
        typeof delimiterMinLengthOption.leftAlignmentDelimiter === "number"
          ? Math.max(2, delimiterMinLengthOption.leftAlignmentDelimiter)
          : 3,
      centerAlignmentDelimiter:
        typeof delimiterMinLengthOption.centerAlignmentDelimiter === "number"
          ? Math.max(3, delimiterMinLengthOption.centerAlignmentDelimiter)
          : 3,
      rightAlignmentDelimiter:
        typeof delimiterMinLengthOption.rightAlignmentDelimiter === "number"
          ? Math.max(2, delimiterMinLengthOption.rightAlignmentDelimiter)
          : 3,
    };
  }
  return { columnOption, delimiterMinLength };
}

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
          delimiterMinLength: {
            anyOf: [
              { const: "minimum" },
              {
                type: "number",
                minimum: 3,
              },
              {
                type: "object",
                properties: {
                  defaultDelimiter: { type: "number", minimum: 1 },
                  leftAlignmentDelimiter: { type: "number", minimum: 2 },
                  centerAlignmentDelimiter: { type: "number", minimum: 3 },
                  rightAlignmentDelimiter: { type: "number", minimum: 2 },
                },
                additionalProperties: false,
              },
            ],
          },
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
    const options = parseOptions(context.options[0]);

    class TableContext {
      public readonly rows: RowData[];

      public readonly delimiterRow: DelimiterRowData;

      public readonly columnCount: number;

      private readonly _cacheNeedSpaceBetweenLeadingPipeAndContent = new Map<
        number,
        boolean
      >();

      private readonly _cacheNeedSpaceBetweenContentAndTrailingPipe = new Map<
        number,
        boolean
      >();

      private readonly _cacheExpectedPipePosition = new Map<
        number,
        number | null
      >();

      public constructor(parsed: ParsedTable) {
        this.delimiterRow = parsedTableDelimiterRowToRowData(
          parsed.delimiterRow,
        );
        const rows: RowData[] = [
          parsedTableRowToRowData(parsed.headerRow),
          this.delimiterRow,
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
       * Check if there is at least one space between leading pipe and content
       */
      public isNeedSpaceBetweenLeadingPipeAndContent(
        pipeIndex: number,
      ): boolean {
        let v = this._cacheNeedSpaceBetweenLeadingPipeAndContent.get(pipeIndex);
        if (v != null) return v;
        if (
          getCurrentTablePipeSpacingOption(sourceCode)?.leadingSpace ===
          "always"
        ) {
          v = true;
        } else {
          v = this._hasSpaceBetweenLeadingPipeAndContentWithoutCache(pipeIndex);
        }
        this._cacheNeedSpaceBetweenLeadingPipeAndContent.set(pipeIndex, v);
        return v;
      }

      /**
       * Check if there is at least one space between content and trailing pipe
       * for the index
       *
       * This is used to determine if the pipe should be aligned with a space before it.
       */
      public isNeedSpaceBetweenContentAndTrailingPipe(
        pipeIndex: number,
      ): boolean {
        if (pipeIndex === 0) return false;
        let v =
          this._cacheNeedSpaceBetweenContentAndTrailingPipe.get(pipeIndex);
        if (v != null) return v;
        if (
          getCurrentTablePipeSpacingOption(sourceCode)?.trailingSpace ===
          "always"
        ) {
          v = true;
        } else {
          v =
            this._hasSpaceBetweenContentAndTrailingPipeWithoutCache(pipeIndex);
        }
        this._cacheNeedSpaceBetweenContentAndTrailingPipe.set(pipeIndex, v);
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
            sourceCode.lines[firstToken.loc.start.line - 1],
            0,
            firstToken.loc.start.column - 1,
          );
        }
        if (options.columnOption === "minimum") {
          return this.getMinimumPipePosition(pipeIndex);
        } else if (options.columnOption === "consistent") {
          const columnIndex = pipeIndex - 1;
          for (const row of this.rows) {
            if (row.cells.length <= columnIndex) continue;
            const cell = row.cells[columnIndex];
            if (cell.type === "delimiter" || !cell.trailingPipe) continue;
            const width = getTextWidth(
              sourceCode.lines[cell.trailingPipe.loc.start.line - 1],
              0,
              cell.trailingPipe.loc.start.column - 1,
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
        const needSpaceAfterPipe = this.isNeedSpaceBetweenLeadingPipeAndContent(
          pipeIndex - 1,
        );
        const needSpaceBeforePipe =
          this.isNeedSpaceBetweenContentAndTrailingPipe(pipeIndex);
        let maxWidth = 0;
        const columnIndex = pipeIndex - 1;
        for (const row of this.rows) {
          if (row.cells.length <= columnIndex) continue;
          const cell = row.cells[columnIndex];
          let width: number;
          if (cell.leadingPipe) {
            const leadingPipeEndOffset = getTextWidth(
              sourceCode.lines[cell.leadingPipe.loc.end.line - 1],
              0,
              cell.leadingPipe.loc.end.column - 1,
            );
            let contentLength: number;
            if (cell.type === "delimiter") {
              contentLength = getMinimumDelimiterLength(cell.align);
            } else {
              if (!cell.content) continue;
              contentLength = getTextWidth(
                sourceCode.lines[cell.content.loc.start.line - 1],
                cell.content.loc.start.column - 1,
                cell.content.loc.end.column - 1,
              );
            }
            width =
              leadingPipeEndOffset +
              (needSpaceAfterPipe ? 1 : 0) +
              contentLength;
          } else if (cell.type === "delimiter") {
            const minimumDelimiterLength = getMinimumDelimiterLength(
              cell.align,
            );
            width =
              getTextWidth(
                sourceCode.lines[cell.delimiter.loc.start.line - 1],
                0,
                cell.delimiter.loc.start.column - 1,
              ) + minimumDelimiterLength;
          } else {
            if (!cell.content) continue;
            width = getTextWidth(
              sourceCode.lines[cell.content.loc.end.line - 1],
              0,
              cell.content.loc.end.column - 1,
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
       * Check if there is at least one space between leading pipe and content
       */
      private _hasSpaceBetweenLeadingPipeAndContentWithoutCache(
        pipeIndex: number,
      ) {
        const columnIndex = pipeIndex;
        for (const row of this.rows) {
          if (row.cells.length <= columnIndex) continue;
          const cell = row.cells[columnIndex];
          if (!cell.leadingPipe) continue;
          let content: TokenData;
          if (cell.type === "delimiter") {
            content = cell.delimiter;
          } else {
            if (!cell.content) continue;
            content = cell.content;
          }
          if (cell.leadingPipe.range[1] < content.range[0]) continue;
          return false;
        }
        return true;
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
        sourceCode.lines[pipe.loc.start.line - 1],
        0,
        pipe.loc.start.column - 1,
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
          const spaceAfter = table.isNeedSpaceBetweenContentAndTrailingPipe(
            pipeIndex,
          )
            ? " "
            : "";
          if (newLength < minimumDelimiterLength + spaceAfter.length) {
            // Can't fix because it requires removing non-space characters
            const edit = fixRemoveSpacesFromLeadingSpaces(
              Math.abs(newLength - minimumDelimiterLength) + spaceAfter.length,
            );
            if (!edit) {
              // Can't fix because it requires removing non-space characters
              return null;
            }
            const delimiterPrefix =
              cell.align === "left" || cell.align === "center" ? ":" : "";
            const delimiterSuffix =
              cell.align === "right" || cell.align === "center" ? ":" : "";
            const newDelimiter = "-".repeat(
              minimumDelimiterLength -
                delimiterPrefix.length -
                delimiterSuffix.length,
            );
            return [
              edit,
              fixer.replaceTextRange(
                [cell.delimiter.range[0], pipe.range[0]],
                delimiterPrefix + newDelimiter + delimiterSuffix + spaceAfter,
              ),
            ];
          }
          const delimiterPrefix =
            cell.align === "left" || cell.align === "center" ? ":" : "";
          const delimiterSuffix =
            cell.align === "right" || cell.align === "center" ? ":" : "";
          const newDelimiter = "-".repeat(
            newLength -
              delimiterPrefix.length -
              delimiterSuffix.length -
              spaceAfter.length,
          );
          return fixer.replaceTextRange(
            [cell.delimiter.range[0], pipe.range[0]],
            delimiterPrefix + newDelimiter + delimiterSuffix + spaceAfter,
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
            const minTrailingSpaceWidth =
              table.isNeedSpaceBetweenContentAndTrailingPipe(pipeIndex) ? 1 : 0;
            if (newSpacesLength < minTrailingSpaceWidth) {
              const edit = fixRemoveSpacesFromLeadingSpaces(
                Math.abs(newSpacesLength) + minTrailingSpaceWidth,
              );
              if (!edit) {
                // Can't fix because it requires removing non-space characters
                return null;
              }

              return [
                edit,
                fixer.replaceTextRange(
                  [pipe.range[0] - spacesBeforePipeLength, pipe.range[0]],
                  " ".repeat(minTrailingSpaceWidth),
                ),
              ];
            }
            return fixer.replaceTextRange(
              [pipe.range[0] - spacesBeforePipeLength, pipe.range[0]],
              " ".repeat(newSpacesLength),
            );
          }

          /**
           * Fixer to remove spaces from the leading spaces
           */
          function fixRemoveSpacesFromLeadingSpaces(removeSpaceLength: number) {
            if (!cell.leadingPipe || pipeIndex === 0) return null;
            const content =
              cell.type === "delimiter" ? cell.delimiter : cell.content;
            if (!content) return null;
            const leadingSpaceWidth = getTextWidth(
              sourceCode.lines[cell.leadingPipe.loc.end.line - 1],
              cell.leadingPipe.loc.end.column - 1,
              content.loc.start.column - 1,
            );
            const newSpacesLength = leadingSpaceWidth - removeSpaceLength;
            if (
              newSpacesLength <
              (table.isNeedSpaceBetweenLeadingPipeAndContent(pipeIndex - 1)
                ? 1
                : 0)
            ) {
              // Can't fix because it requires removing non-space characters
              return null;
            }
            return fixer.replaceTextRange(
              [cell.leadingPipe.range[1], content.range[0]],
              " ".repeat(newSpacesLength),
            );
          }
        },
      });
      return false;
    }

    /**
     * Get the minimum delimiter length based on alignment and options
     */
    function getMinimumDelimiterLength(
      align: "left" | "right" | "center" | "none",
    ): number {
      if (align === "none") {
        return options.delimiterMinLength.defaultDelimiter;
      }
      if (align === "left") {
        return options.delimiterMinLength.leftAlignmentDelimiter;
      }
      if (align === "center") {
        return options.delimiterMinLength.centerAlignmentDelimiter;
      }
      if (align === "right") {
        return options.delimiterMinLength.rightAlignmentDelimiter;
      }
      return options.delimiterMinLength.defaultDelimiter;
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
): DelimiterRowData {
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
