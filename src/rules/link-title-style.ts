import type { Definition, Image, Link } from "mdast";
import { getLinkKind, getSourceLocationFromRange } from "../utils/ast.ts";
import { parseImage } from "../utils/image.ts";
import { createRule } from "../utils/index.ts";
import { parseLinkDefinition } from "../utils/link-definition.ts";
import { parseInlineLink } from "../utils/link.ts";
import { name } from "../meta.ts";

type Options = {
  style?: "double" | "single" | "parenthesis";
  avoidEscape?: boolean;
};

const STYLES = {
  double: {
    name: "double quoted",
    open: '"',
    close: '"',
  },
  single: {
    name: "single quoted",
    open: "'",
    close: "'",
  },
  parenthesis: {
    name: "parenthesized",
    open: "(",
    close: ")",
  },
};

export default createRule<[Options?]>("link-title-style", {
  meta: {
    type: "layout",
    docs: {
      description: "enforce a consistent style for link titles",
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
            enum: ["double", "single", "parenthesis"],
          },
          avoidEscape: {
            type: "boolean",
          },
        },
      },
    ],
    messages: {
      expectedTitleStyle: "Expected link title to be {{styleName}}.",
    },
  },
  create(context) {
    const sourceCode = context.sourceCode;
    const options = context.options[0] || {};
    const style = STYLES[options.style || "double"];
    const avoidEscape = options.avoidEscape ?? true;

    /**
     * Verify title style.
     */
    function verifyTitle(
      node: Link | Image | Definition,
      titleRange: [number, number],
    ) {
      const title = sourceCode.text.slice(...titleRange);
      const isValid =
        title.startsWith(style.open) && title.endsWith(style.close);
      if (isValid) return;
      if (avoidEscape) {
        // Check if the title can be written in the specified style without escaping.
        if (title.slice(1, -1).includes(style.close)) return;
      }

      context.report({
        node,
        loc: getSourceLocationFromRange(sourceCode, node, titleRange),
        messageId: "expectedTitleStyle",
        data: { styleName: style.name },
        *fix(fixer) {
          yield fixer.replaceTextRange(
            [titleRange[0], titleRange[0] + 1],
            style.open,
          );
          for (
            let index = titleRange[0] + 1;
            index < titleRange[1] - 1;
            index++
          ) {
            const c = sourceCode.text[index];
            if (c === style.close) {
              yield fixer.insertTextBeforeRange([index, index], "\\");
            } else if (c === "\\") {
              index++;
            }
          }
          yield fixer.replaceTextRange(
            [titleRange[1] - 1, titleRange[1]],
            style.close,
          );
        },
      });
    }

    return {
      link(node) {
        const kind = getLinkKind(sourceCode, node);
        if (kind !== "inline") return;
        const parsed = parseInlineLink(sourceCode, node);
        if (!parsed || !parsed.title) return;
        verifyTitle(node, parsed.title.range);
      },
      image(node) {
        const parsed = parseImage(sourceCode, node);
        if (!parsed || !parsed.title) return;
        verifyTitle(node, parsed.title.range);
      },
      definition(node) {
        const parsed = parseLinkDefinition(sourceCode, node);
        if (!parsed || !parsed.title) return;
        verifyTitle(node, parsed.title.range);
      },
    };
  },
});
