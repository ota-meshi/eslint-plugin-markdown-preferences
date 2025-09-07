import { createRule } from "../utils/index.ts";
import { getThematicBreakMarker } from "../utils/ast.ts";

export default createRule<[{ style?: "-" | "*" | "_" }?]>(
  "thematic-break-character-style",
  {
    meta: {
      type: "layout",
      docs: {
        description:
          "enforce consistent character style for thematic breaks (horizontal rules) in Markdown.",
        categories: ["standard"],
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
              enum: ["-", "*", "_"],
            },
          },
          additionalProperties: false,
        },
      ],
      messages: {
        unexpected:
          "Thematic break should use '{{expected}}' but found '{{actual}}'.",
      },
    },
    create(context) {
      // Get rule option
      const option = context.options[0];
      const style = option?.style || "-";

      return {
        thematicBreak(node) {
          const marker = getThematicBreakMarker(context.sourceCode, node);
          if (marker.kind !== style) {
            context.report({
              node,
              messageId: "unexpected",
              data: {
                expected: style,
                actual: marker.kind,
              },
              fix(fixer) {
                const range = context.sourceCode.getRange(node);
                const text = context.sourceCode.getText(node);
                // Replace all marker characters with the preferred style
                const rep = text.replaceAll(marker.kind, style);
                return fixer.replaceTextRange(range, rep);
              },
            });
          }
        },
      };
    },
  },
);
