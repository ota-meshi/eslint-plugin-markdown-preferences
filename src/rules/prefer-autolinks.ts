import type { Text } from "mdast";
import { createRule } from "../utils/index.ts";
import { getLinkKind } from "../utils/ast.ts";

export default createRule("prefer-autolinks", {
  meta: {
    type: "layout",
    docs: {
      description: "enforce the use of autolinks for URLs",
      categories: ["recommended", "standard"],
      listCategory: "Notation",
    },
    fixable: "code",
    hasSuggestions: false,
    schema: [],
    messages: {
      useAutolinkInsteadGFMAutolink:
        "Use an autolink instead of a GFM autolink (bare url).",
      useAutolinkInsteadInlineLink:
        "Use an autolink instead of an inline link with the same URL.",
    },
  },
  create(context) {
    const sourceCode = context.sourceCode;

    return {
      link(node) {
        const kind = getLinkKind(sourceCode, node);
        if (kind === "autolink") return; // Skip autolinks
        if (node.title) return; // Skip links with titles
        if (node.children.some((child) => child.type !== "text")) return; // Skip links with non-text children
        const label = node.children
          .map((child) => (child as Text).value)
          .join("");
        if (node.url !== label) return; // Skip if URL does not match label

        context.report({
          node,
          messageId:
            kind === "inline"
              ? "useAutolinkInsteadInlineLink"
              : "useAutolinkInsteadGFMAutolink",
          fix(fixer) {
            return fixer.replaceText(node, `<${node.url}>`);
          },
        });
      },
    };
  },
});
