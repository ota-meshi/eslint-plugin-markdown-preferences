import type { Table } from "mdast";
import { createRule } from "../utils/index.ts";
import type {
  ParsedTableDelimiterRow,
  ParsedTableRow,
} from "../utils/table.ts";
import { parseTableDelimiterRow, parseTableRow } from "../utils/table.ts";
import type { SourceLocation } from "@eslint/core";
import { getTextWidth } from "../utils/text-width.ts";
import { getWidth } from "../utils/width.ts";

type Options = {
  space?:
    | "always"
    | "never"
    | {
        leading?: "always" | "never";
        trailing?: "always" | "never";
      };
  alignToDelimiterAlignment?: boolean;
};

export default createRule<[Options?]>("table-pipe-spacing", {
  meta: {
    type: "layout",
    docs: {
      description: "enforce consistent spacing around table pipes",
      categories: ["standard"],
      listCategory: "Whitespace",
    },
    fixable: "whitespace",
    hasSuggestions: false,
    schema: [
      {
        type: "object",
        properties: {
          space: {
            anyOf: [
              {
                enum: ["always", "never"],
              },
              {
                type: "object",
                properties: {
                  leading: {
                    enum: ["always", "never"],
                  },
                  trailing: {
                    enum: ["always", "never"],
                  },
                },
                additionalProperties: false,
              },
            ],
          },
          alignToDelimiterAlignment: {
            type: "boolean",
          },
        },
        additionalProperties: false,
      },
    ],
    messages: {
      expectedSpaceBefore: 'Expected 1 space before "|".',
      expectedNoSpaceBefore: 'Expected no space before "|".',
      expectedSpaceAfter: 'Expected 1 space after "|".',
      expectedNoSpaceAfter: 'Expected no space after "|".',
      expectedAlignLeft: 'Expected 1 space after "|" for left-aligned column.',
      expectedAlignRight:
        'Expected 1 space before "|" for right-aligned column.',
      expectedAlignCenter:
        "Expected the number of spaces before and after the content to be the same or differ by 1 at most for center-aligned column.",
    },
  },
  create(context) {
    const sourceCode = context.sourceCode;
    const options = context.options[0] || {};
    const spaceOption = options.space;
    const leadingSpace =
      (typeof spaceOption === "object" ? spaceOption.leading : spaceOption) ||
      "always";
    const trailingSpace =
      (typeof spaceOption === "object" ? spaceOption.trailing : spaceOption) ||
      "always";
    const alignToDelimiterAlignment =
      leadingSpace === "always" &&
      trailingSpace === "always" &&
      (options.alignToDelimiterAlignment ?? true);

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
      content: TokenData;
      align: "left" | "right" | "center" | "none";
      trailingPipe: TokenData | null;
    };

    /**
     * Verify for the leading pipe.
     */
    function verifyLeadingPipe(pipe: TokenData, nextToken: TokenData): boolean {
      if (leadingSpace === "always") {
        if (pipe.range[1] < nextToken.range[0]) return true;
        context.report({
          loc: pipe.loc,
          messageId: "expectedSpaceAfter",
          fix(fixer) {
            return fixer.insertTextAfterRange(pipe.range, " ");
          },
        });
        return false;
      } else if (leadingSpace === "never") {
        if (pipe.range[1] === nextToken.range[0]) return true;
        context.report({
          loc: pipe.loc,
          messageId: "expectedNoSpaceAfter",
          fix(fixer) {
            return fixer.removeRange([pipe.range[1], nextToken.range[0]]);
          },
        });
        return false;
      }
      return true;
    }

    /**
     * Verify for the trailing pipe.
     */
    function verifyTrailingPipe(
      prevToken: TokenData,
      pipe: TokenData,
    ): boolean {
      if (trailingSpace === "always") {
        if (prevToken.range[1] < pipe.range[0]) return true;
        context.report({
          loc: pipe.loc,
          messageId: "expectedSpaceBefore",
          fix(fixer) {
            return fixer.insertTextBeforeRange(pipe.range, " ");
          },
        });
        return false;
      } else if (trailingSpace === "never") {
        if (prevToken.range[1] === pipe.range[0]) return true;
        context.report({
          loc: pipe.loc,
          messageId: "expectedNoSpaceBefore",
          fix(fixer) {
            return fixer.removeRange([prevToken.range[1], pipe.range[0]]);
          },
        });
        return false;
      }
      return true;
    }

    /**
     * Verify for the alignment of the pipe according to the delimiter alignment.
     */
    function verifyAlignPipe(
      { leadingPipe, content, trailingPipe }: CellData | DelimiterData,
      delimiter: DelimiterData,
    ) {
      if (!leadingPipe || !trailingPipe || !content) return;
      const lineText = sourceCode.lines[leadingPipe.loc.start.line - 1];
      if (delimiter.align === "left" || delimiter.align === "none") {
        // left-aligned: 1 space after leading pipe
        if (getLeadingSpacesWidth() === 1) return;
        context.report({
          loc: {
            start: leadingPipe.loc.end,
            end: content.loc.start,
          },
          messageId: "expectedAlignLeft",
          *fix(fixer) {
            const cellWidth = getCellWidth();
            const contentTextWidth = getContentTextWidth();
            const newTrailingSpaces = " ".repeat(
              cellWidth - contentTextWidth - 1,
            );
            const contentText = getNormalizedContentText();
            yield fixer.replaceTextRange(
              [leadingPipe.range[1], trailingPipe.range[0]],
              ` ${contentText}${newTrailingSpaces}`,
            );
          },
        });
      } else if (delimiter.align === "right") {
        // right-aligned: 1 space before trailing pipe
        if (getTrailingSpacesWidth() === 1) return;
        context.report({
          loc: {
            start: content.loc.end,
            end: trailingPipe.loc.start,
          },
          messageId: "expectedAlignRight",
          *fix(fixer) {
            const cellWidth = getCellWidth();
            const contentTextWidth = getContentTextWidth();
            const newLeadingSpaces = " ".repeat(
              cellWidth - contentTextWidth - 1,
            );
            const contentText = getNormalizedContentText();
            yield fixer.replaceTextRange(
              [leadingPipe.range[1], trailingPipe.range[0]],
              `${newLeadingSpaces}${contentText} `,
            );
          },
        });
      } else if (delimiter.align === "center") {
        // center-aligned: the number of spaces before and after the content should be the same or differ by 1 at most
        const leadingSpacesWidth = getLeadingSpacesWidth();
        const trailingSpacesWidth = getTrailingSpacesWidth();
        if (
          leadingSpacesWidth === trailingSpacesWidth ||
          leadingSpacesWidth + 1 === trailingSpacesWidth
        )
          return;
        const leadingReportLoc: SourceLocation = {
          start: leadingPipe.loc.end,
          end: content.loc.start,
        };
        const trailingReportLoc: SourceLocation = {
          start: content.loc.end,
          end: trailingPipe.loc.start,
        };
        for (const reportLoc of [leadingReportLoc, trailingReportLoc]) {
          context.report({
            loc: reportLoc,
            messageId: "expectedAlignCenter",
            *fix(fixer) {
              const cellWidth = getCellWidth();
              const contentTextWidth = getContentTextWidth();
              const spacesLength = cellWidth - contentTextWidth;
              const leadingSpacesLength = Math.floor(spacesLength / 2);
              const trailingSpacesLength = spacesLength - leadingSpacesLength;
              const newLeadingSpaces = " ".repeat(leadingSpacesLength);
              const newTrailingSpaces = " ".repeat(trailingSpacesLength);
              const contentText = getNormalizedContentText();
              yield fixer.replaceTextRange(
                [leadingPipe.range[1], trailingPipe.range[0]],
                `${newLeadingSpaces}${contentText}${newTrailingSpaces}`,
              );
            },
          });
        }
      }

      /**
       * Get the width of the leading spaces in the cell.
       */
      function getLeadingSpacesWidth() {
        return getTextWidth(
          lineText,
          leadingPipe!.loc.end.column - 1,
          content!.loc.start.column - 1,
        );
      }

      /**
       * Get the width of the trailing spaces in the cell.
       */
      function getTrailingSpacesWidth() {
        return getTextWidth(
          lineText,
          content!.loc.end.column - 1,
          trailingPipe!.loc.start.column - 1,
        );
      }

      /**
       * Get the width of the whole cell (including leading and trailing spaces)
       */
      function getCellWidth() {
        return getTextWidth(
          lineText,
          leadingPipe!.loc.end.column - 1,
          trailingPipe!.loc.start.column - 1,
        );
      }

      /**
       * Get the width of the content text (excluding leading and trailing spaces)
       */
      function getContentTextWidth() {
        return getTextWidth(
          lineText,
          content!.loc.start.column - 1,
          content!.loc.end.column - 1,
        );
      }

      /**
       * Get the normalized content text (with normalized spaces)
       */
      function getNormalizedContentText() {
        const prefixWidth = getWidth(
          lineText.slice(0, content!.loc.start.column - 1),
        );
        let result = "";
        for (const c of lineText.slice(
          content!.loc.start.column - 1,
          content!.loc.end.column - 1,
        )) {
          if (c === "\t") {
            result += " ".repeat(4 - ((prefixWidth + result.length) % 4));
          } else {
            result += c;
          }
        }
        return result;
      }
    }

    /**
     * Convert a parsed table row to cell data list
     */
    function parsedTableRowToCellDataList(
      parsedRow: ParsedTableRow,
    ): CellData[] {
      return parsedRow.cells.map((cell, index) => {
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
      });
    }

    /**
     * Convert a parsed table delimiter row to delimiter data list
     */
    function parsedTableDelimiterRowToDelimiterDataList(
      parsedDelimiterRow: ParsedTableDelimiterRow,
    ): DelimiterData[] {
      return parsedDelimiterRow.delimiters.map((cell, index) => {
        const nextCell =
          index + 1 < parsedDelimiterRow.delimiters.length
            ? parsedDelimiterRow.delimiters[index + 1]
            : null;
        return {
          type: "delimiter",
          leadingPipe: cell.leadingPipe,
          content: cell.delimiter,
          align: cell.delimiter.align,
          trailingPipe: nextCell
            ? nextCell.leadingPipe
            : parsedDelimiterRow.trailingPipe,
        };
      });
    }

    return {
      table(node: Table) {
        const parsedDelimiterRow = parseTableDelimiterRow(sourceCode, node);
        const delimiters =
          parsedDelimiterRow &&
          parsedTableDelimiterRowToDelimiterDataList(parsedDelimiterRow);

        for (const row of node.children) {
          const parsedRow = parseTableRow(sourceCode, row);
          if (!parsedRow) continue;
          const cells = parsedTableRowToCellDataList(parsedRow);
          const validColumns = new Set<number>();
          for (let columnIndex = 0; columnIndex < cells.length; columnIndex++) {
            validColumns.add(columnIndex);
            const cell = cells[columnIndex];
            if (cell.leadingPipe) {
              if (leadingSpace !== "never" || cell.content) {
                const nextToken = getNextToken(cells, columnIndex);
                if (nextToken) {
                  if (!verifyLeadingPipe(cell.leadingPipe, nextToken)) {
                    validColumns.delete(columnIndex);
                  }
                }
              }
            }
            if (cell.trailingPipe && trailingSpace !== "never") {
              const prevToken = getPrevToken(cells, columnIndex);
              if (prevToken) {
                if (!verifyTrailingPipe(prevToken, cell.trailingPipe)) {
                  validColumns.delete(columnIndex - 1);
                }
              }
            }
          }
          if (alignToDelimiterAlignment && delimiters) {
            for (const columnIndex of validColumns) {
              const cell = cells[columnIndex];
              const delimiter =
                columnIndex < delimiters.length
                  ? delimiters[columnIndex]
                  : null;
              if (cell && delimiter) {
                verifyAlignPipe(cell, delimiter);
              }
            }
          }
        }
        if (!delimiters) return;
        const validColumns = new Set<number>();
        for (
          let columnIndex = 0;
          columnIndex < delimiters.length;
          columnIndex++
        ) {
          validColumns.add(columnIndex);
          const delimiter = delimiters[columnIndex];
          if (delimiter.leadingPipe) {
            if (!verifyLeadingPipe(delimiter.leadingPipe, delimiter.content)) {
              validColumns.delete(columnIndex);
            }
          }
          if (delimiter.trailingPipe) {
            if (
              !verifyTrailingPipe(delimiter.content, delimiter.trailingPipe)
            ) {
              validColumns.delete(columnIndex);
            }
          }
        }
        if (alignToDelimiterAlignment) {
          for (const columnIndex of validColumns) {
            const delimiter = delimiters[columnIndex];
            if (delimiter) {
              verifyAlignPipe(delimiter, delimiter);
            }
          }
        }
      },
    };

    /**
     * Get the next token (pipe or cell) after the given column index.
     */
    function getNextToken(
      cells: CellData[],
      columnIndex: number,
    ): TokenData | null {
      for (let i = columnIndex; i < cells.length; i++) {
        const cell = cells[i];
        const token = cell.content ?? cell.trailingPipe;
        if (token) return token;
      }
      return null;
    }

    /**
     * Get the prev token (pipe or cell) after the given column index.
     */
    function getPrevToken(
      cells: CellData[],
      columnIndex: number,
    ): TokenData | null {
      for (let i = columnIndex; i >= 0; i--) {
        const cell = cells[i];
        const token = cell.content ?? cell.leadingPipe;
        if (token) return token;
      }
      return null;
    }
  },
});
