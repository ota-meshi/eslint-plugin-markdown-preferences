import type { Table, TableRow } from "../language/ast-types.ts";
import { createRule } from "../utils/index.ts";
import type { SourceLocation } from "estree";
import { parseTableDelimiterRow } from "../utils/table.ts";
import { isSpaceOrTab } from "../utils/unicode.ts";

type Option =
  | "always"
  | "never"
  | {
      leading?: "always" | "never";
      trailing?: "always" | "never";
    };

export default createRule<[Option?]>("table-leading-trailing-pipes", {
  meta: {
    type: "layout",
    docs: {
      description:
        "enforce consistent use of leading and trailing pipes in tables.",
      categories: ["standard"],
      listCategory: "Decorative",
    },
    fixable: "code",
    hasSuggestions: false,
    schema: [
      {
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
    ],
    messages: {
      missingLeadingPipe: "Table line should start with a leading pipe.",
      unexpectedLeadingPipe: "Table line should not start with a leading pipe.",
      missingTrailingPipe: "Table line should end with a trailing pipe.",
      unexpectedTrailingPipe: "Table line should not end with a trailing pipe.",
    },
  },
  create(context) {
    const sourceCode = context.sourceCode;
    const preferOption = context.options[0] ?? "always";
    const leadingOption =
      typeof preferOption === "string"
        ? preferOption
        : (preferOption.leading ?? "always");
    const trailingOption =
      typeof preferOption === "string"
        ? preferOption
        : (preferOption.trailing ?? "always");

    /**
     * Verify the table pipes
     */
    function verifyTablePipes(node: Table) {
      for (const row of node.children) {
        verifyTableRowPipes(row);
      }
      const parsedDelimiterRow = parseTableDelimiterRow(sourceCode, node);
      if (parsedDelimiterRow) {
        verifyTableLinePipes(
          parsedDelimiterRow.range,
          parsedDelimiterRow.loc,
          parsedDelimiterRow.delimiters.length,
        );
      }
    }

    /**
     * Verify the table row pipes
     */
    function verifyTableRowPipes(node: TableRow) {
      const loc = sourceCode.getLoc(node);
      const range = sourceCode.getRange(node);
      verifyTableLinePipes(range, loc, node.children.length);
    }

    /**
     * Verify the table line pipes
     */
    function verifyTableLinePipes(
      lineContentRange: [number, number],
      lineLocation: SourceLocation,
      columnCount: number,
    ) {
      verifyTableLeadingPipe(lineContentRange, lineLocation, columnCount);
      verifyTableTrailingPipe(lineContentRange, lineLocation, columnCount);
    }

    /**
     * Verify the table leading pipe
     */
    function verifyTableLeadingPipe(
      lineContentRange: [number, number],
      lineLocation: SourceLocation,
      columnCount: number,
    ) {
      if (leadingOption === "always") {
        if (sourceCode.text.startsWith("|", lineContentRange[0])) return;
        context.report({
          messageId: "missingLeadingPipe",
          loc: lineLocation.start,
          fix(fixer) {
            return fixer.insertTextBeforeRange(lineContentRange, "| ");
          },
        });
      } else if (leadingOption === "never") {
        if (columnCount < 2) {
          const trailingIsAlways =
            trailingOption === "always" &&
            sourceCode.text.endsWith("|", lineContentRange[1]);
          if (!trailingIsAlways) {
            // If the table has only one column and no trailing pipe is required,
            // skip checking the leading pipe.
            return;
          }
        }
        if (!sourceCode.text.startsWith("|", lineContentRange[0])) return;
        let endIndex = lineContentRange[0] + 1;
        while (
          endIndex < lineContentRange[1] &&
          isSpaceOrTab(sourceCode.text[endIndex])
        ) {
          endIndex++;
        }
        context.report({
          messageId: "unexpectedLeadingPipe",
          loc: {
            start: lineLocation.start,
            end: {
              line: lineLocation.start.line,
              column:
                lineLocation.start.column + (endIndex - lineContentRange[0]),
            },
          },
          fix(fixer) {
            return fixer.removeRange([lineContentRange[0], endIndex]);
          },
        });
      }
    }

    /**
     * Verify the table trailing pipe
     */
    function verifyTableTrailingPipe(
      lineContentRange: [number, number],
      lineLocation: SourceLocation,
      columnCount: number,
    ) {
      if (trailingOption === "always") {
        if (sourceCode.text.endsWith("|", lineContentRange[1])) return;
        context.report({
          messageId: "missingTrailingPipe",
          loc: lineLocation.end,
          fix(fixer) {
            return fixer.insertTextAfterRange(lineContentRange, " |");
          },
        });
      } else if (trailingOption === "never") {
        if (columnCount < 2) {
          const leadingIsAlways =
            leadingOption === "always" &&
            sourceCode.text.startsWith("|", lineContentRange[0]);
          if (!leadingIsAlways) {
            // If the table has only one column and no leading pipe is required,
            // skip checking the trailing pipe.
            return;
          }
        }
        if (!sourceCode.text.endsWith("|", lineContentRange[1])) return;
        let startIndex = lineContentRange[1] - 1;
        while (
          startIndex - 1 > lineContentRange[0] &&
          isSpaceOrTab(sourceCode.text[startIndex - 1])
        ) {
          startIndex--;
        }
        context.report({
          messageId: "unexpectedTrailingPipe",
          loc: {
            start: {
              line: lineLocation.end.line,
              column:
                lineLocation.end.column - (lineContentRange[1] - startIndex),
            },
            end: lineLocation.end,
          },
          fix(fixer) {
            return fixer.removeRange([startIndex, lineContentRange[1]]);
          },
        });
      }
    }

    return {
      table(node: Table) {
        verifyTablePipes(node);
      },
    };
  },
});
