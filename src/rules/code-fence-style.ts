import { parseFencedCodeBlock } from "../utils/fenced-code-block.ts";
import { createRule } from "../utils/index.ts";

export default createRule("code-fence-style", {
  meta: {
    type: "layout",
    docs: {
      description:
        "enforce a consistent code fence style (backtick or tilde) in Markdown fenced code blocks.",
      categories: ["standard"],
      listCategory: "Notation",
    },
    fixable: "code",
    hasSuggestions: false,
    schema: [
      {
        type: "object",
        properties: {
          style: {
            type: "string",
            enum: ["backtick", "tilde"],
          },
        },
        additionalProperties: false,
      },
    ],
    messages: {
      useCodeFenceStyle:
        "Use {{expected}} code fence style instead of {{actual}}.",
    },
  },
  create(context) {
    const sourceCode = context.sourceCode;
    const styleOption = context.options[0]?.style ?? "backtick";
    const expectedChar = styleOption === "tilde" ? "~" : "`";

    return {
      code(node) {
        const parsed = parseFencedCodeBlock(sourceCode, node);
        if (!parsed) return; // Skip if not an indented code block

        if (parsed.openingFence.text.includes(expectedChar)) {
          // The fence style is as expected
          return;
        }

        const expectedOpeningFence = expectedChar.repeat(
          Math.max(3, parsed.openingFence.text.length),
        );

        if (node.value.includes(expectedOpeningFence)) {
          // The code block contains the expected fence, so fixing it would be problematic
          return;
        }

        context.report({
          node,
          loc: {
            start: sourceCode.getLocFromIndex(parsed.openingFence.range[0]),
            end: sourceCode.getLocFromIndex(parsed.openingFence.range[1]),
          },
          data: {
            expected: expectedOpeningFence,
            actual: parsed.openingFence.text,
          },
          messageId: "useCodeFenceStyle",
          *fix(fixer) {
            yield fixer.replaceTextRange(
              parsed.openingFence.range,
              expectedOpeningFence,
            );
            if (parsed.closingFence) {
              yield fixer.replaceTextRange(
                parsed.closingFence.range,
                expectedChar.repeat(
                  Math.max(3, parsed.closingFence.text.length),
                ),
              );
            }
          },
        });
      },
    };
  },
});
