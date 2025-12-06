import { createRule } from "../utils/index.ts"

export default createRule("max-len", {
    meta: {
        type: "",
        docs: {
            description: "...",
            categories: [],
            listCategory: "...",
        },
        fixable: null,
        hasSuggestions: null,
        schema: [],
        messages: {},
    },
    create(context) {
      const sourceCode = context.sourceCode

        return {
          // ...
        }
    },
})
