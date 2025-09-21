import type { CustomContainer } from "../language/ast-types.ts";
import { createRule } from "../utils/index.ts";
import { getSourceLocationFromRange } from "../utils/ast.ts";
import { parseCustomContainer } from "../utils/custom-container.ts";
import { getParsedLines } from "../utils/lines.ts";

type Options = {
  padding?: "always" | "never";
};

export default createRule<[Options?]>("padded-custom-containers", {
  meta: {
    type: "layout",
    docs: {
      description: "disallow or require padding inside custom containers",
      categories: ["standard"],
      listCategory: "Whitespace",
    },
    fixable: "whitespace",
    hasSuggestions: false,
    schema: [
      {
        type: "object",
        properties: {
          padding: {
            type: "string",
            enum: ["always", "never"],
            default: "never",
          },
        },
        additionalProperties: false,
      },
    ],
    messages: {
      expectedPaddingAfterOpeningMarker:
        "Expected padding after opening marker.",
      expectedPaddingBeforeClosingMarker:
        "Expected padding before closing marker.",
      unexpectedPaddingAfterOpeningMarker:
        "Unexpected padding after opening marker.",
      unexpectedPaddingBeforeClosingMarker:
        "Unexpected padding before closing marker.",
    },
  },
  create(context) {
    const sourceCode = context.sourceCode;
    const options = context.options[0] || {};
    const padding = options.padding || "never";

    return {
      customContainer(node: CustomContainer) {
        if (node.children.length === 0) {
          // Empty containers don't need padding
          return;
        }

        const parsed = parseCustomContainer(sourceCode, node);
        if (!parsed) return;

        const { openingSequence, closingSequence } = parsed;

        const firstChild = node.children[0];
        const lastChild = node.children[node.children.length - 1];

        const firstChildLoc = sourceCode.getLoc(firstChild);
        const lastChildLoc = sourceCode.getLoc(lastChild);

        const paddingAfterOpeningLines =
          firstChildLoc.start.line - openingSequence.loc.end.line - 1;
        const paddingBeforeClosingLines = closingSequence
          ? closingSequence.loc.start.line - lastChildLoc.end.line - 1
          : null;

        if (padding === "always") {
          if (paddingAfterOpeningLines <= 0) {
            const reportEndToken = parsed.info ?? openingSequence;
            const reportRange: [number, number] = [
              openingSequence.range[0],
              reportEndToken.range[1],
            ];
            context.report({
              messageId: "expectedPaddingAfterOpeningMarker",
              loc: getSourceLocationFromRange(sourceCode, node, reportRange),
              fix(fixer) {
                return fixer.insertTextAfterRange(reportRange, "\n");
              },
            });
          }
          if (
            closingSequence &&
            paddingBeforeClosingLines !== null &&
            paddingBeforeClosingLines <= 0
          ) {
            context.report({
              messageId: "expectedPaddingBeforeClosingMarker",
              loc: getSourceLocationFromRange(
                sourceCode,
                node,
                closingSequence.range,
              ),
              fix(fixer) {
                return fixer.insertTextBeforeRange(
                  [
                    closingSequence.range[0] -
                      closingSequence.loc.start.column +
                      1,
                    closingSequence.range[1],
                  ],
                  "\n",
                );
              },
            });
          }
        } else if (padding === "never") {
          if (paddingAfterOpeningLines > 0) {
            const firstChildRange = sourceCode.getRange(firstChild);
            context.report({
              messageId: "unexpectedPaddingAfterOpeningMarker",
              loc: getSourceLocationFromRange(sourceCode, node, [
                openingSequence.range[1],
                firstChildRange[0],
              ]),
              *fix(fixer) {
                const lines = getParsedLines(sourceCode);
                for (
                  let lineNumber = openingSequence.loc.end.line + 1;
                  lineNumber < firstChildLoc.start.line;
                  lineNumber++
                ) {
                  const line = lines.get(lineNumber);
                  yield fixer.removeRange(line.range);
                }
              },
            });
          }
          if (
            closingSequence &&
            paddingBeforeClosingLines !== null &&
            paddingBeforeClosingLines > 0
          ) {
            const lastChildRange = sourceCode.getRange(lastChild);
            context.report({
              messageId: "unexpectedPaddingBeforeClosingMarker",
              loc: getSourceLocationFromRange(sourceCode, node, [
                lastChildRange[1],
                closingSequence.range[0],
              ]),
              *fix(fixer) {
                const lines = getParsedLines(sourceCode);
                for (
                  let lineNumber = lastChildLoc.end.line + 1;
                  lineNumber < closingSequence.loc.start.line;
                  lineNumber++
                ) {
                  const line = lines.get(lineNumber);
                  yield fixer.removeRange(line.range);
                }
              },
            });
          }
        }
      },
    };
  },
});
