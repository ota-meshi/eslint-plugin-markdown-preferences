import { getSourceLocationFromRange } from "../utils/ast.ts";
import { parseCustomContainer } from "../utils/custom-container.ts";
import { createRule } from "../utils/index.ts";

type Options = {
  space?: "always" | "never";
};
export default createRule<[Options?]>("custom-container-marker-spacing", {
  meta: {
    type: "layout",
    docs: {
      description:
        "require or disallow spacing between opening custom container marker and info",
      categories: [],
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
        "Expected a space between opening custom container marker and info.",
      unexpectedSpace:
        "Unexpected space between opening custom container marker and info.",
    },
  },
  create(context) {
    const sourceCode = context.sourceCode;
    const option = context.options[0] || {};
    const space = option.space || "always";

    return {
      customContainer(node) {
        const parsed = parseCustomContainer(sourceCode, node);
        if (!parsed) return;
        const { openingSequence, info } = parsed;

        const hasSpace = openingSequence.range[1] < info.range[0];
        if (space === "always") {
          if (hasSpace) return;
          context.report({
            node,
            loc: getSourceLocationFromRange(sourceCode, node, info.range),
            messageId: "expectedSpace",
            fix(fixer) {
              return fixer.insertTextAfterRange(openingSequence.range, " ");
            },
          });
        } else if (space === "never") {
          if (!hasSpace) return;
          context.report({
            node,
            loc: getSourceLocationFromRange(sourceCode, node, [
              openingSequence.range[1],
              info.range[0],
            ]),
            messageId: "unexpectedSpace",
            fix(fixer) {
              return fixer.removeRange([
                openingSequence.range[1],
                info.range[0],
              ]);
            },
          });
        }
      },
    };
  },
});
