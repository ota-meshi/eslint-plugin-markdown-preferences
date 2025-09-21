import { createRule } from "../utils/index.ts";
import { parseFencedCodeBlock } from "../utils/fenced-code-block.ts";
import { parseMathBlock } from "../utils/math-block.ts";
import { parseCustomContainer } from "../utils/custom-container.ts";

export default createRule("no-implicit-block-closing", {
  meta: {
    type: "suggestion",
    docs: {
      description:
        "disallow implicit block closing for fenced code blocks, math blocks, and custom containers",
      categories: ["recommended", "standard"],
      listCategory: "Notation",
    },
    fixable: "code",
    hasSuggestions: false,
    schema: [],
    messages: {
      missingClosingFence: "Missing closing fence for fenced code block.",
      missingClosingMath: "Missing closing sequence for math block.",
      missingClosingContainer: "Missing closing sequence for custom container.",
    },
  },
  create(context) {
    const sourceCode = context.sourceCode;

    return {
      code(node) {
        const parsed = parseFencedCodeBlock(sourceCode, node);
        if (!parsed) return;

        if (!parsed.closingFence) {
          context.report({
            node,
            loc: parsed.openingFence.loc,
            messageId: "missingClosingFence",
            fix(fixer) {
              // Get the context prefix from the opening fence line
              const openingLoc = parsed.openingFence.loc;
              const openingLine = sourceCode.lines[openingLoc.start.line - 1];
              const prefix = openingLine
                .slice(0, openingLoc.start.column - 1)
                .replace(/[^\s>]/gu, " ");
              const closingFence = parsed.openingFence.text;
              return fixer.insertTextAfter(node, `\n${prefix}${closingFence}`);
            },
          });
        }
      },

      math(node) {
        const parsed = parseMathBlock(sourceCode, node);
        if (!parsed) return;

        if (!parsed.closingSequence) {
          context.report({
            node,
            loc: parsed.openingSequence.loc,
            messageId: "missingClosingMath",
            fix(fixer) {
              // Get the context prefix from the opening sequence line
              const openingLoc = parsed.openingSequence.loc;
              const openingLine = sourceCode.lines[openingLoc.start.line - 1];
              const prefix = openingLine
                .slice(0, openingLoc.start.column - 1)
                .replace(/[^\s>]/gu, " ");
              const closingSequence = parsed.openingSequence.text;
              return fixer.insertTextAfter(
                node,
                `\n${prefix}${closingSequence}`,
              );
            },
          });
        }
      },

      customContainer(node) {
        const parsed = parseCustomContainer(sourceCode, node);
        if (!parsed) return;

        if (!parsed.closingSequence) {
          context.report({
            node,
            loc: parsed.openingSequence.loc,
            messageId: "missingClosingContainer",
            fix(fixer) {
              // Get the context prefix from the opening sequence line
              const openingLoc = parsed.openingSequence.loc;
              const openingLine = sourceCode.lines[openingLoc.start.line - 1];
              const prefix = openingLine
                .slice(0, openingLoc.start.column - 1)
                .replace(/[^\s>]/gu, " ");
              const closingSequence = parsed.openingSequence.text;
              return fixer.insertTextAfter(
                node,
                `\n${prefix}${closingSequence}`,
              );
            },
          });
        }
      },
    };
  },
});
