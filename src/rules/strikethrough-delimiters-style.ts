import { createRule } from "../utils/index.ts";
import type { Delete } from "../language/ast-types.ts";

type StrikethroughDelimiter = "~" | "~~";

export default createRule<
  [
    {
      delimiter?: StrikethroughDelimiter;
    },
  ]
>("strikethrough-delimiters-style", {
  meta: {
    type: "layout",
    docs: {
      description: "enforce a consistent delimiter style for strikethrough",
      categories: ["standard"],
      listCategory: "Notation",
    },
    fixable: "code",
    hasSuggestions: false,
    schema: [
      {
        type: "object",
        properties: {
          delimiter: { enum: ["~", "~~"] },
        },
        additionalProperties: false,
      },
    ],
    messages: {
      wrongDelimiter:
        "Strikethrough delimiter should be '{{expected}}' (was '{{actual}}').",
    },
  },
  create(context) {
    const sourceCode = context.sourceCode;
    const option = context.options[0] ?? {};
    const delimiter: StrikethroughDelimiter = option.delimiter ?? "~~";

    return {
      delete(node: Delete) {
        const range = sourceCode.getRange(node);

        const actualDelimiter = ["~~", "~"].find(
          (d) =>
            sourceCode.text.startsWith(d, range[0]) &&
            sourceCode.text.endsWith(d, range[1]),
        );

        if (!actualDelimiter || actualDelimiter === delimiter) return;

        context.report({
          node,
          messageId: "wrongDelimiter",
          data: {
            expected: delimiter,
            actual: actualDelimiter,
          },
          fix(fixer) {
            return [
              fixer.replaceTextRange(
                [range[0], range[0] + actualDelimiter.length],
                delimiter,
              ),
              fixer.replaceTextRange(
                [range[1] - actualDelimiter.length, range[1]],
                delimiter,
              ),
            ];
          },
        });
      },
    };
  },
});
