import type { CustomContainer } from "../language/ast-types.ts";
import { createRule } from "../utils/index.ts";
import { getSourceLocationFromRange } from "../utils/ast.ts";
import { parseCustomContainer } from "../utils/custom-container.ts";
import type { ParsedLine } from "../utils/lines.ts";
import { getParsedLines } from "../utils/lines.ts";
import { toRegExp } from "../utils/regexp.ts";

type Options = {
  padding?: "always" | "never";
  overrides?: {
    info?: string | string[];
    padding?: "always" | "never";
  }[];
};

/**
 * Parse the given options.
 */
function parseOptions(options: Options | undefined) {
  const padding = options?.padding || "never";
  const overrides = (options?.overrides || [])
    .map((override) => {
      return {
        test: normalizeTest(override.info),
        padding: override.padding || padding,
      };
    })
    .reverse();

  /**
   * Get the padding setting for the given container.
   */
  function getPaddingForContainer(node: CustomContainer): "always" | "never" {
    for (const override of overrides) {
      if (override.test(node)) {
        return override.padding;
      }
    }
    return padding;
  }

  return {
    getPaddingForContainer,
  };

  /**
   * Normalize the given info option.
   */
  function normalizeTest(
    infoOption: string | string[] | undefined,
  ): (n: CustomContainer) => boolean {
    if (infoOption == null) {
      return () => false;
    }
    if (Array.isArray(infoOption)) {
      const tests = infoOption.map(normalizeTest);
      return (n) => tests.some((t) => t(n));
    }
    const test = toRegExp(infoOption);
    return (n) => test.test(n.info);
  }
}

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
          overrides: {
            type: "array",
            items: {
              type: "object",
              properties: {
                info: {
                  anyOf: [
                    { type: "string" },
                    {
                      type: "array",
                      items: { type: "string" },
                      minItems: 1,
                      uniqueItems: true,
                    },
                  ],
                },
                padding: {
                  type: "string",
                  enum: ["always", "never"],
                },
              },
              additionalProperties: false,
            },
            uniqueItems: true,
            minItems: 1,
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
    const options = parseOptions(context.options[0]);

    return {
      customContainer(node: CustomContainer) {
        if (node.children.length === 0) {
          // Empty containers don't need padding
          return;
        }

        const padding = options.getPaddingForContainer(node);

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
            const lines = getParsedLines(sourceCode);
            const reportLines: ParsedLine[] = [];
            for (
              let lineNumber = openingSequence.loc.end.line + 1;
              lineNumber < firstChildLoc.start.line;
              lineNumber++
            ) {
              reportLines.push(lines.get(lineNumber));
            }

            const removeRange: [number, number] = [
              reportLines[0].range[0],
              reportLines[reportLines.length - 1].range[1],
            ];
            context.report({
              messageId: "unexpectedPaddingAfterOpeningMarker",
              loc: getSourceLocationFromRange(sourceCode, node, removeRange),
              fix(fixer) {
                return fixer.removeRange(removeRange);
              },
            });
          }
          if (
            closingSequence &&
            paddingBeforeClosingLines !== null &&
            paddingBeforeClosingLines > 0
          ) {
            const lines = getParsedLines(sourceCode);
            const reportLines: ParsedLine[] = [];
            for (
              let lineNumber = lastChildLoc.end.line + 1;
              lineNumber < closingSequence.loc.start.line;
              lineNumber++
            ) {
              reportLines.push(lines.get(lineNumber));
            }
            const removeRange: [number, number] = [
              reportLines[0].range[0],
              reportLines[reportLines.length - 1].range[1],
            ];
            context.report({
              messageId: "unexpectedPaddingBeforeClosingMarker",
              loc: getSourceLocationFromRange(sourceCode, node, removeRange),
              fix(fixer) {
                return fixer.removeRange(removeRange);
              },
            });
          }
        }
      },
    };
  },
});
