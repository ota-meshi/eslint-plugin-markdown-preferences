import { parseFencedCodeBlock } from "../utils/fenced-code-block.ts";
import { createRule } from "../utils/index.ts";

export default createRule("code-fence-style", {
  meta: {
    type: "layout",
    docs: {
      description:
        "enforce a consistent code fence style (backtick or tilde) in Markdown fenced code blocks.",
      categories: [],
      listCategory: "Stylistic",
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

        const expectedCodeFence = expectedChar.repeat(
          Math.max(3, parsed.openingFence.text.length),
        );

        if (parsed.openingFence.text === expectedCodeFence) {
          // The fence style is as expected
          return;
        }

        if (node.value.includes(`\n${expectedCodeFence}`)) {
          // The code block contains the expected fence, so fixing it would be problematic
          return;
        }

        context.report({
          node,
          loc: parsed.openingFence.loc,
          data: {
            expected: expectedCodeFence,
            actual: parsed.openingFence.text,
          },
          messageId: "useCodeFenceStyle",
          fix(fixer) {
            return [
              fixer.replaceTextRange(
                parsed.openingFence.range,
                expectedCodeFence,
              ),
              fixer.replaceTextRange(
                parsed.closingFence.range,
                expectedCodeFence,
              ),
            ];
          },
        });
      },
    };
  },
});
