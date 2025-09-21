import { createRule } from "../utils/index.ts";
import { parseFencedCodeBlock } from "../utils/fenced-code-block.ts";
import { parseMathBlock } from "../utils/math-block.ts";
import { parseCustomContainer } from "../utils/custom-container.ts";
import type { MDParent } from "../utils/ast.ts";
import { getParent } from "../utils/ast.ts";
import type { CustomContainer } from "../language/ast-types.ts";
import type { ExtendedMarkdownSourceCode } from "../language/extended-markdown-language.ts";

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
        if (parsed.closingFence) return;
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
      },

      math(node) {
        const parsed = parseMathBlock(sourceCode, node);
        if (!parsed) return;
        if (parsed.closingSequence) return;
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
            return fixer.insertTextAfter(node, `\n${prefix}${closingSequence}`);
          },
        });
      },

      customContainer(node) {
        const parsed = parseCustomContainer(sourceCode, node);
        if (!parsed) return;
        if (parsed.closingSequence) return;
        context.report({
          node,
          loc: parsed.openingSequence.loc,
          messageId: "missingClosingContainer",
          fix(fixer) {
            if (
              withinSameLengthOpeningCustomContainer(
                sourceCode,
                node,
                parsed.openingSequence.text.length,
              )
            ) {
              // If within another custom container with the same length of opening sequence,
              // we cannot determine the correct closing sequence, so we do not provide a fix.
              return null;
            }
            // Get the context prefix from the opening sequence line
            const openingLoc = parsed.openingSequence.loc;
            const openingLine = sourceCode.lines[openingLoc.start.line - 1];
            const prefix = openingLine
              .slice(0, openingLoc.start.column - 1)
              .replace(/[^\s>]/gu, " ");
            const closingSequence = parsed.openingSequence.text;
            return fixer.insertTextAfter(node, `\n${prefix}${closingSequence}`);
          },
        });
      },
    };
  },
});

/**
 * Check if the given custom container node is within another custom container
 * that has the same length of opening sequence.
 *
 */
function withinSameLengthOpeningCustomContainer(
  sourceCode: ExtendedMarkdownSourceCode,
  node: CustomContainer,
  openingLength: number,
) {
  let current: MDParent<CustomContainer> | null = getParent(sourceCode, node);
  while (current) {
    if (current.type === "customContainer") {
      const parsed = parseCustomContainer(sourceCode, current);
      if (!parsed) {
        // If parsing fails, we cannot determine, so we assume true
        return true;
      }
      if (parsed.openingSequence.text.length === openingLength) {
        return true;
      }
    }
    current = getParent(sourceCode, current);
  }
  return false;
}
