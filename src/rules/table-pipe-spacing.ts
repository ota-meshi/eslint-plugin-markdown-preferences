import type { Table } from "../language/ast-types.ts";
import { createRule } from "../utils/index.ts";
import type {
  ParsedTableDelimiterRow,
  ParsedTableRow,
} from "../utils/table.ts";
import { parseTableDelimiterRow, parseTableRow } from "../utils/table.ts";
import type { SourceLocation } from "@eslint/core";
import { getTextWidth } from "../utils/text-width.ts";
import { getWidth } from "../utils/width.ts";
import type { ExtendedMarkdownSourceCode } from "../language/extended-markdown-language.ts";

type SpaceStyle = "always" | "never";
type AlignStyle = "left" | "center" | "right";

type Options = {
  space?:
    | SpaceStyle
    | {
        leading?: SpaceStyle;
        trailing?: SpaceStyle;
      };
  cellAlign?:
    | AlignStyle
    | {
        defaultDelimiter?: AlignStyle | "ignore";
        leftAlignmentDelimiter?: AlignStyle | "ignore";
        centerAlignmentDelimiter?: AlignStyle | "ignore";
        rightAlignmentDelimiter?: AlignStyle | "ignore";
      };
};

type ParsedOptions = {
  leadingSpace: SpaceStyle;
  trailingSpace: SpaceStyle;
  cellAlignByDelimiter: {
    none: AlignStyle | "ignore";
    left: AlignStyle | "ignore";
    center: AlignStyle | "ignore";
    right: AlignStyle | "ignore";
  };
};

const currentOption = new WeakMap<ExtendedMarkdownSourceCode, ParsedOptions>();

/**
 * Get the current options for the given source code.
 * This is a method that allows you to access the configuration of this rule from another rule.
 */
export function getCurrentTablePipeSpacingOption(
  sourceCode: ExtendedMarkdownSourceCode,
): ParsedOptions | null {
  return currentOption.get(sourceCode) ?? null;
}

/**
 * Parsed options
 */
function parseOptions(options: Options | undefined): ParsedOptions {
  const spaceOption = options?.space;
  const leadingSpace =
    (typeof spaceOption === "object" ? spaceOption.leading : spaceOption) ||
    "always";
  const trailingSpace =
    (typeof spaceOption === "object" ? spaceOption.trailing : spaceOption) ||
    "always";
  const cellAlignOption = options?.cellAlign;
  const defaultDelimiterCellAlign =
    (typeof cellAlignOption === "object"
      ? cellAlignOption.defaultDelimiter
      : cellAlignOption) || "left";
  const leftAlignmentDelimiterCellAlign =
    (typeof cellAlignOption === "object"
      ? cellAlignOption.leftAlignmentDelimiter
      : cellAlignOption) || "left";
  const centerAlignmentDelimiterCellAlign =
    (typeof cellAlignOption === "object"
      ? cellAlignOption.centerAlignmentDelimiter
      : cellAlignOption) || "center";
  const rightAlignmentDelimiterCellAlign =
    (typeof cellAlignOption === "object"
      ? cellAlignOption.rightAlignmentDelimiter
      : cellAlignOption) || "right";

  return {
    leadingSpace,
    trailingSpace,
    cellAlignByDelimiter: {
      none: adjustAlign(defaultDelimiterCellAlign),
      left: adjustAlign(leftAlignmentDelimiterCellAlign),
      center: adjustAlign(centerAlignmentDelimiterCellAlign),
      right: adjustAlign(rightAlignmentDelimiterCellAlign),
    },
  };

  /**
   * Adjust the alignment option based on the spacing options.
   */
  function adjustAlign(align: AlignStyle | "ignore"): AlignStyle | "ignore" {
    if (align === "left") {
      if (trailingSpace === "always") {
        return "left";
      }
      return "ignore";
    }
    if (align === "center") {
      if (leadingSpace === "always" && trailingSpace === "always") {
        return "center";
      }
      return "ignore";
    }
    if (align === "right") {
      if (leadingSpace === "always") {
        return "right";
      }
      return "ignore";
    }
    return align;
  }
}

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
          cellAlign: {
            anyOf: [
              {
                enum: ["left", "center", "right"],
              },
              {
                type: "object",
                properties: {
                  defaultDelimiter: {
                    enum: ["left", "center", "right", "ignore"],
                  },
                  leftAlignmentDelimiter: {
                    enum: ["left", "center", "right", "ignore"],
                  },
                  centerAlignmentDelimiter: {
                    enum: ["left", "center", "right", "ignore"],
                  },
                  rightAlignmentDelimiter: {
                    enum: ["left", "center", "right", "ignore"],
                  },
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
      expectedSpaceBefore: 'Expected 1 space before "|".',
      expectedNoSpaceBefore: 'Expected no space before "|".',
      expectedSpaceAfter: 'Expected 1 space after "|".',
      expectedNoSpaceAfter: 'Expected no space after "|".',
      expectedAlignLeft: 'Expected 1 space after "|" for left-aligned column.',
      expectedNoSpaceAlignLeft:
        'Expected no space after "|" for left-aligned column.',
      expectedAlignRight:
        'Expected 1 space before "|" for right-aligned column.',
      expectedNoSpaceAlignRight:
        'Expected no space before "|" for right-aligned column.',
      expectedAlignCenter:
        "Expected the number of spaces before and after the content to be the same or differ by 1 at most for center-aligned column.",
    },
  },
  create(context) {
    const sourceCode = context.sourceCode;
    const options = parseOptions(context.options[0]);
    currentOption.set(sourceCode, options);

    type TokenData = {
      range: [number, number];
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
      if (options.leadingSpace === "always") {
        if (pipe.range[1] < nextToken.range[0]) return true;
        context.report({
          loc: {
            start: sourceCode.getLocFromIndex(pipe.range[0]),
            end: sourceCode.getLocFromIndex(pipe.range[1]),
          },
          messageId: "expectedSpaceAfter",
          fix(fixer) {
            return fixer.insertTextAfterRange(pipe.range, " ");
          },
        });
        return false;
      } else if (options.leadingSpace === "never") {
        if (pipe.range[1] === nextToken.range[0]) return true;
        context.report({
          loc: {
            start: sourceCode.getLocFromIndex(pipe.range[1]),
            end: sourceCode.getLocFromIndex(nextToken.range[0]),
          },
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
      if (options.trailingSpace === "always") {
        if (prevToken.range[1] < pipe.range[0]) return true;
        context.report({
          loc: {
            start: sourceCode.getLocFromIndex(pipe.range[0]),
            end: sourceCode.getLocFromIndex(pipe.range[1]),
          },
          messageId: "expectedSpaceBefore",
          fix(fixer) {
            return fixer.insertTextBeforeRange(pipe.range, " ");
          },
        });
        return false;
      } else if (options.trailingSpace === "never") {
        if (prevToken.range[1] === pipe.range[0]) return true;
        context.report({
          loc: {
            start: sourceCode.getLocFromIndex(prevToken.range[1]),
            end: sourceCode.getLocFromIndex(pipe.range[0]),
          },
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
     * Return "leading" if the leading pipe is reported, "trailing" if the trailing pipe is reported, "both" if both are reported, or null if nothing is reported.
     */
    function verifyAlignPipe(
      { leadingPipe, content, trailingPipe }: CellData | DelimiterData,
      cellAlign: AlignStyle | "ignore",
    ): "leading" | "trailing" | "both" | null {
      if (!leadingPipe || !trailingPipe || !content) return null;

      const lineText =
        sourceCode.lines[
          sourceCode.getLocFromIndex(leadingPipe.range[0]).line - 1
        ];
      if (cellAlign === "left") {
        // left-aligned: (1 or 0) space after leading pipe
        const expectedWidth = options.leadingSpace === "always" ? 1 : 0;
        if (getLeadingSpacesWidth() === expectedWidth) return null;
        context.report({
          loc:
            leadingPipe.range[1] < content.range[0]
              ? {
                  start: sourceCode.getLocFromIndex(leadingPipe.range[1]),
                  end: sourceCode.getLocFromIndex(content.range[0]),
                }
              : {
                  start: sourceCode.getLocFromIndex(leadingPipe.range[0]),
                  end: sourceCode.getLocFromIndex(leadingPipe.range[1]),
                },
          messageId:
            expectedWidth >= 1
              ? "expectedAlignLeft"
              : "expectedNoSpaceAlignLeft",
          *fix(fixer) {
            const cellWidth = getCellWidth();
            const contentTextWidth = getContentTextWidth();
            const newLeadingSpaces = " ".repeat(expectedWidth);
            const newTrailingSpaces = " ".repeat(
              Math.max(cellWidth - contentTextWidth - expectedWidth, 0),
            );
            const contentText = getNormalizedContentText();
            yield fixer.replaceTextRange(
              [leadingPipe.range[1], trailingPipe.range[0]],
              `${newLeadingSpaces}${contentText}${newTrailingSpaces}`,
            );
          },
        });
        return "leading";
      } else if (cellAlign === "right") {
        // right-aligned: (1 or 0) space before trailing pipe
        const expectedWidth = options.trailingSpace === "always" ? 1 : 0;
        if (getTrailingSpacesWidth() === expectedWidth) return null;
        context.report({
          loc:
            content.range[1] < trailingPipe.range[0]
              ? {
                  start: sourceCode.getLocFromIndex(content.range[1]),
                  end: sourceCode.getLocFromIndex(trailingPipe.range[0]),
                }
              : {
                  start: sourceCode.getLocFromIndex(trailingPipe.range[0]),
                  end: sourceCode.getLocFromIndex(trailingPipe.range[1]),
                },
          messageId:
            expectedWidth >= 1
              ? "expectedAlignRight"
              : "expectedNoSpaceAlignRight",
          *fix(fixer) {
            const cellWidth = getCellWidth();
            const contentTextWidth = getContentTextWidth();
            const newLeadingSpaces = " ".repeat(
              Math.max(cellWidth - contentTextWidth - expectedWidth, 0),
            );
            const newTrailingSpaces = " ".repeat(expectedWidth);
            const contentText = getNormalizedContentText();
            yield fixer.replaceTextRange(
              [leadingPipe.range[1], trailingPipe.range[0]],
              `${newLeadingSpaces}${contentText}${newTrailingSpaces}`,
            );
          },
        });
        return "trailing";
      } else if (cellAlign === "center") {
        // center-aligned: the number of spaces before and after the content should be the same or differ by 1 at most
        const leadingSpacesWidth = getLeadingSpacesWidth();
        const trailingSpacesWidth = getTrailingSpacesWidth();
        if (
          leadingSpacesWidth === trailingSpacesWidth ||
          leadingSpacesWidth + 1 === trailingSpacesWidth
        )
          return null;
        const leadingReportLoc: SourceLocation =
          leadingPipe.range[1] < content.range[0]
            ? {
                start: sourceCode.getLocFromIndex(leadingPipe.range[1]),
                end: sourceCode.getLocFromIndex(content.range[0]),
              }
            : {
                start: sourceCode.getLocFromIndex(leadingPipe.range[0]),
                end: sourceCode.getLocFromIndex(leadingPipe.range[1]),
              };
        const trailingReportLoc: SourceLocation =
          content.range[1] < trailingPipe.range[0]
            ? {
                start: sourceCode.getLocFromIndex(content.range[1]),
                end: sourceCode.getLocFromIndex(trailingPipe.range[0]),
              }
            : {
                start: sourceCode.getLocFromIndex(trailingPipe.range[0]),
                end: sourceCode.getLocFromIndex(trailingPipe.range[1]),
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
        return "both";
      }
      return null;

      /**
       * Get the width of the leading spaces in the cell.
       */
      function getLeadingSpacesWidth() {
        return getTextWidth(
          lineText,
          sourceCode.getLocFromIndex(leadingPipe!.range[1]).column - 1,
          sourceCode.getLocFromIndex(content!.range[0]).column - 1,
        );
      }

      /**
       * Get the width of the trailing spaces in the cell.
       */
      function getTrailingSpacesWidth() {
        return getTextWidth(
          lineText,
          sourceCode.getLocFromIndex(content!.range[1]).column - 1,
          sourceCode.getLocFromIndex(trailingPipe!.range[0]).column - 1,
        );
      }

      /**
       * Get the width of the whole cell (including leading and trailing spaces)
       */
      function getCellWidth() {
        return getTextWidth(
          lineText,
          sourceCode.getLocFromIndex(leadingPipe!.range[1]).column - 1,
          sourceCode.getLocFromIndex(trailingPipe!.range[0]).column - 1,
        );
      }

      /**
       * Get the width of the content text (excluding leading and trailing spaces)
       */
      function getContentTextWidth() {
        return getTextWidth(
          lineText,
          sourceCode.getLocFromIndex(content!.range[0]).column - 1,
          sourceCode.getLocFromIndex(content!.range[1]).column - 1,
        );
      }

      /**
       * Get the normalized content text (with normalized spaces)
       */
      function getNormalizedContentText() {
        const contentStartLoc = sourceCode.getLocFromIndex(content!.range[0]);
        const prefixWidth = getWidth(
          lineText.slice(0, contentStartLoc.column - 1),
        );
        let result = "";
        for (const c of lineText.slice(
          contentStartLoc.column - 1,
          sourceCode.getLocFromIndex(content!.range[1]).column - 1,
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
          for (let columnIndex = 0; columnIndex < cells.length; columnIndex++) {
            const cell = cells[columnIndex];

            const delimiter =
              delimiters && columnIndex < delimiters.length
                ? delimiters[columnIndex]
                : null;

            const alignReportedPoint = delimiter
              ? verifyAlignPipe(
                  cell,
                  options.cellAlignByDelimiter[delimiter.align],
                )
              : null;
            if (alignReportedPoint === "both") continue;
            if (cell.leadingPipe && alignReportedPoint !== "leading") {
              if (options.leadingSpace !== "never" || cell.content) {
                const nextToken = getNextToken(cells, columnIndex);
                if (nextToken) {
                  verifyLeadingPipe(cell.leadingPipe, nextToken);
                }
              }
            }
            if (
              cell.trailingPipe &&
              options.trailingSpace !== "never" &&
              alignReportedPoint !== "trailing"
            ) {
              const prevToken = getPrevToken(cells, columnIndex);
              if (prevToken) {
                verifyTrailingPipe(prevToken, cell.trailingPipe);
              }
            }
          }
        }
        if (!delimiters) return;
        for (
          let columnIndex = 0;
          columnIndex < delimiters.length;
          columnIndex++
        ) {
          const delimiter = delimiters[columnIndex];

          const alignReportedPoint = verifyAlignPipe(
            delimiter,
            options.cellAlignByDelimiter[delimiter.align],
          );
          if (alignReportedPoint === "both") continue;

          if (delimiter.leadingPipe && alignReportedPoint !== "leading") {
            verifyLeadingPipe(delimiter.leadingPipe, delimiter.content);
          }
          if (delimiter.trailingPipe && alignReportedPoint !== "trailing") {
            verifyTrailingPipe(delimiter.content, delimiter.trailingPipe);
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
