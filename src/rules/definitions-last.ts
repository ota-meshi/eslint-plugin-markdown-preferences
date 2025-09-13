import type { Definition, FootnoteDefinition } from "mdast";
import { createRule } from "../utils/index.ts";

export default createRule("definitions-last", {
  meta: {
    type: "layout",
    docs: {
      description:
        "require link definitions and footnote definitions to be placed at the end of the document",
      categories: [],
      listCategory: "Notation",
    },
    fixable: "code",
    hasSuggestions: false,
    schema: [],
    messages: {},
  },
  create(context) {
    const sourceCode = context.sourceCode;

    const lastNonDefinition = sourceCode.ast.children.findLast(
      (node) =>
        node.type !== "definition" &&
        node.type !== "footnoteDefinition" &&
        !(
          node.type === "html" &&
          (node.value.startsWith("<!--") ||
            node.value.startsWith("<script") ||
            node.value.startsWith("<style"))
        ),
    );
    if (!lastNonDefinition) {
      return {};
    }
    const lastNonDefinitionRange = sourceCode.getRange(lastNonDefinition);

    return {
      "definition, footnoteDefinition"(node: Definition | FootnoteDefinition) {
        const range = sourceCode.getRange(node);
        if (lastNonDefinitionRange[1] <= range[0]) return;

        context.report({
          node,
          message:
            "Definition or footnote definition should be placed at the end of the document.",
          *fix(fixer) {
            let rangeStart = range[0];
            for (let index = range[0] - 1; index >= 0; index--) {
              const c = sourceCode.text[index];
              if (c.trim()) {
                break;
              }
              rangeStart = index;
            }
            yield fixer.removeRange([rangeStart, range[1]]);
            yield fixer.insertTextAfterRange(
              lastNonDefinitionRange,
              sourceCode.text.slice(rangeStart, range[1]),
            );
          },
        });
      },
    };
  },
});
