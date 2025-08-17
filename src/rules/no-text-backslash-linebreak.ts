import { getSourceLocationFromRange } from "../utils/ast.ts";
import { createRule } from "../utils/index.ts";

export default createRule("no-text-backslash-linebreak", {
  meta: {
    type: "layout",
    docs: {
      description: "disallow text backslash at the end of a line.",
      categories: ["recommended"],
      listCategory: "Stylistic",
    },
    fixable: undefined,
    hasSuggestions: true,
    schema: [],
    messages: {
      textBackslashWithLinebreak:
        "Text backslash at the end of a line is not allowed.",
      removeBackslash: "Remove the backslash.",
    },
  },
  create(context) {
    const sourceCode = context.sourceCode;

    return {
      text(node) {
        if (!node.value.endsWith("\\")) return;
        const range = sourceCode.getRange(node);

        for (let i = range[1]; i < sourceCode.text.length; i++) {
          const c = sourceCode.text[i];
          if (c.trim() !== "") return;
          if (c === "\n") {
            break;
          }
        }

        const backslashRange: [number, number] = [range[1] - 1, range[1]];

        context.report({
          node,
          loc: getSourceLocationFromRange(sourceCode, node, backslashRange),
          messageId: "textBackslashWithLinebreak",
          suggest: [
            {
              messageId: "removeBackslash",
              fix: (fixer) => {
                return fixer.removeRange(backslashRange);
              },
            },
          ],
        });
      },
    };
  },
});
