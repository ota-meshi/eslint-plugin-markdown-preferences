import { parseFencedCodeBlock } from "../utils/fenced-code-block.ts";
import { createRule } from "../utils/index.ts";

type Options = {
  space?: "always" | "never";
};
export default createRule<[Options?]>("code-fence-spacing", {
  meta: {
    type: "layout",
    docs: {
      description:
        "require or disallow spacing between opening code fence and language identifier",
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
            enum: ["always", "never"],
          },
        },
        additionalProperties: false,
      },
    ],
    messages: {
      expectedSpace:
        "Expected a space between code fence and language identifier.",
      unexpectedSpace:
        "Unexpected space between code fence and language identifier.",
    },
  },
  create(context) {
    const sourceCode = context.sourceCode;
    const option = context.options[0] || {};
    const space = option.space || "never";

    return {
      code(node) {
        const parsed = parseFencedCodeBlock(sourceCode, node);
        if (!parsed) return;
        const { openingFence, language } = parsed;
        if (!language) return;

        const hasSpace = openingFence.range[1] < language.range[0];
        if (space === "always") {
          if (hasSpace) return;
          context.report({
            node,
            loc: {
              start: sourceCode.getLocFromIndex(language.range[0]),
              end: sourceCode.getLocFromIndex(language.range[1]),
            },
            messageId: "expectedSpace",
            fix(fixer) {
              return fixer.insertTextAfterRange(openingFence.range, " ");
            },
          });
        } else if (space === "never") {
          if (!hasSpace) return;
          context.report({
            node,
            loc: {
              start: sourceCode.getLocFromIndex(openingFence.range[1]),
              end: sourceCode.getLocFromIndex(language.range[0]),
            },
            messageId: "unexpectedSpace",
            fix(fixer) {
              return fixer.removeRange([
                openingFence.range[1],
                language.range[0],
              ]);
            },
          });
        }
      },
    };
  },
});
