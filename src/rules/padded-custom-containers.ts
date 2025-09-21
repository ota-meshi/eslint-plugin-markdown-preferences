import { createRule } from "../utils/index.ts";

export default createRule("padded-custom-containers", {
  meta: {
    type: "layout",
    docs: {
      description: "disallow or require padding inside custom containers",
      categories: ["standard"],
      listCategory: "Whitespace",
    },
    fixable: "whitespace",
    hasSuggestions: false,
    schema: [],
    messages: {},
  },
  create(context) {
    const sourceCode = context.sourceCode;

    return {
      // ...
    };
  },
});
