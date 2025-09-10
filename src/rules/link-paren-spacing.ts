import { createRule } from "../utils/index.ts";

export default createRule("link-paren-spacing", {
  meta: {
    type: "layout",
    docs: {
      description: "enforce consistent spacing inside link parentheses",
      categories: ["standard"],
      listCategory: "Stylistic",
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
      unexpectedSpaceAfterOpeningParen:
        "Unexpected space after opening parenthesis.",
      expectedSpaceAfterOpeningParen:
        "Expected space after opening parenthesis.",
      unexpectedSpaceBeforeClosingParen:
        "Unexpected space before closing parenthesis.",
      expectedSpaceBeforeClosingParen:
        "Expected space before closing parenthesis.",
    },
  },
  create(context) {
    const sourceCode = context.sourceCode;

    return {
      // ...
    };
  },
});
