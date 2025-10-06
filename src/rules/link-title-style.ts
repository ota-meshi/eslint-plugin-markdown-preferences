import type { Definition, Image, Link } from "../language/ast-types.ts";
import { getLinkKind } from "../utils/ast.ts";
import { parseImage } from "../utils/image.ts";
import { createRule } from "../utils/index.ts";
import { parseLinkDefinition } from "../utils/link-definition.ts";
import { parseInlineLink } from "../utils/link.ts";
import type { SourceLocation } from "estree";

type Options = {
  style?: "double" | "single" | "parentheses";
  avoidEscape?: boolean;
};

const STYLES = {
  double: {
    messageId: "expectedDouble",
    open: '"',
    close: '"',
    typeName: "double-quoted",
  },
  single: {
    messageId: "expectedSingle",
    open: "'",
    close: "'",
    typeName: "single-quoted",
  },
  parentheses: {
    messageId: "expectedParentheses",
    open: "(",
    close: ")",
    typeName: "parenthesized",
  },
} as const;

export default createRule<[Options?]>("link-title-style", {
  meta: {
    type: "layout",
    docs: {
      description: "enforce a consistent style for link titles",
      categories: ["standard"],
      listCategory: "Notation",
    },
    fixable: "code",
    hasSuggestions: false,
    schema: [
      {
        type: "object",
        properties: {
          style: {
            enum: ["double", "single", "parentheses"],
          },
          avoidEscape: {
            type: "boolean",
          },
        },
        additionalProperties: false,
      },
    ],
    messages: {
      expectedDouble: "Expected link title to be double quoted.",
      expectedSingle: "Expected link title to be single quoted.",
      expectedParentheses: "Expected link title to be parenthesized.",
    },
  },
  create(context) {
    const sourceCode = context.sourceCode;
    const options = context.options[0] || {};
    const preferStyle = STYLES[options.style || "double"];
    const avoidEscape = options.avoidEscape ?? true;

    /**
     * Verify title style.
     */
    function verifyTitle(
      node: Link | Image | Definition,
      title: {
        type: "double-quoted" | "single-quoted" | "parenthesized";
        text: string;
        range: [number, number];
        loc: SourceLocation;
      },
    ) {
      if (preferStyle.typeName === title.type) return;
      if (avoidEscape) {
        // Check if the title can be written in the specified style without escaping.
        if (title.text.slice(1, -1).includes(preferStyle.close)) return;
      }

      context.report({
        node,
        loc: title.loc,
        messageId: preferStyle.messageId,
        *fix(fixer) {
          yield fixer.replaceTextRange(
            [title.range[0], title.range[0] + 1],
            preferStyle.open,
          );
          for (
            let index = title.range[0] + 1;
            index < title.range[1] - 1;
            index++
          ) {
            const c = sourceCode.text[index];
            if (c === preferStyle.close) {
              yield fixer.insertTextBeforeRange([index, index], "\\");
            } else if (c === "\\") {
              index++;
            }
          }
          yield fixer.replaceTextRange(
            [title.range[1] - 1, title.range[1]],
            preferStyle.close,
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
        verifyTitle(node, parsed.title);
      },
      image(node) {
        const parsed = parseImage(sourceCode, node);
        if (!parsed || !parsed.title) return;
        verifyTitle(node, parsed.title);
      },
      definition(node) {
        const parsed = parseLinkDefinition(sourceCode, node);
        if (!parsed || !parsed.title) return;
        verifyTitle(node, parsed.title);
      },
    };
  },
});
