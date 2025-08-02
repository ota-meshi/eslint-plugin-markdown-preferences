import { createRule } from "../utils/index.js";

export default createRule("hard-linebreak-style", {
  meta: {
    type: "layout",
    docs: {
      description: "enforce consistent hard linebreak style.",
      categories: ["recommended"],
    },
    fixable: "code",
    hasSuggestions: false,
    schema: [
      {
        type: "object",
        properties: {
          style: {
            enum: ["backslash", "spaces"],
          },
        },
        additionalProperties: false,
      },
    ],
    messages: {
      expectedBackslash: "Expected a backslash linebreak.",
      expectedSpaces: "Expected a space linebreak.",
    },
  },
  create(context) {
    const sourceCode = context.sourceCode;
    const linebreakStyle = context.options[0]?.style || "backslash";

    return {
      break: (node) => {
        const text = sourceCode.getText(node);

        if (linebreakStyle === "backslash" && !text.startsWith("\\")) {
          context.report({
            node,
            messageId: "expectedBackslash",
            fix(fixer) {
              return fixer.replaceText(node, "\\\n");
            },
          });
        } else if (linebreakStyle === "spaces" && !text.startsWith("  ")) {
          context.report({
            node,
            messageId: "expectedSpaces",
            fix(fixer) {
              return fixer.replaceText(node, "  \n");
            },
          });
        }
      },
    };
  },
});
