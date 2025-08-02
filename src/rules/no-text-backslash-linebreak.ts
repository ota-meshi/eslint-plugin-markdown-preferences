import { createRule } from "../utils/index.js";

export default createRule("no-text-backslash-linebreak", {
  meta: {
    type: "suggestion",
    docs: {
      description: "disallow text backslash at the end of a line.",
      categories: ["recommended"],
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

        const loc = sourceCode.getLoc(node);
        const beforeLines = sourceCode.text
          .slice(range[0], range[1] - 1)
          .split(/\n/u);
        const line = loc.start.line + beforeLines.length - 1;
        const column =
          (beforeLines.length === 1 ? loc.start.column : 1) +
          (beforeLines.at(-1) || "").length;

        context.report({
          node,
          loc: {
            start: { line, column },
            end: { line, column: column + 1 },
          },
          messageId: "textBackslashWithLinebreak",
          suggest: [
            {
              messageId: "removeBackslash",
              fix: (fixer) => {
                return fixer.removeRange([range[1] - 1, range[1]]);
              },
            },
          ],
        });
      },
    };
  },
});
