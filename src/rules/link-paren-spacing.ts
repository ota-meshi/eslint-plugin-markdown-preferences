import type { Image, Link } from "../language/ast-types.ts";
import { getLinkKind, getSourceLocationFromRange } from "../utils/ast.ts";
import { parseImage } from "../utils/image.ts";
import { createRule } from "../utils/index.ts";
import { parseInlineLink } from "../utils/link.ts";
import { isWhitespace } from "../utils/unicode.ts";
import type { SourceLocation } from "estree";

type Options = {
  space?: "always" | "never";
};

export default createRule<[Options?]>("link-paren-spacing", {
  meta: {
    type: "layout",
    docs: {
      description: "enforce consistent spacing inside link parentheses",
      categories: ["standard"],
      listCategory: "Whitespace",
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
    type RangeAndLoc = {
      range: [number, number];
      loc: SourceLocation;
    };

    const sourceCode = context.sourceCode;
    const spaceOption = context.options[0]?.space || "never";

    /**
     * Verify the space after the opening paren and before the closing paren.
     */
    function verifySpaceAfterOpeningParen(
      node: Link | Image,
      openingParen: RangeAndLoc,
    ) {
      const space = getSpaceAfterOpeningParen(openingParen);
      if (space.includes("\n")) return;
      if (spaceOption === "always") {
        if (space.length > 0) return;
        context.report({
          node,
          loc: openingParen.loc,
          messageId: "expectedSpaceAfterOpeningParen",
          fix: (fixer) => fixer.insertTextAfterRange(openingParen.range, " "),
        });
      } else if (spaceOption === "never") {
        if (space.length === 0) return;
        context.report({
          node,
          loc: getSourceLocationFromRange(sourceCode, node, [
            openingParen.range[1],
            openingParen.range[1] + space.length,
          ]),
          messageId: "unexpectedSpaceAfterOpeningParen",
          fix: (fixer) =>
            fixer.removeRange([
              openingParen.range[1],
              openingParen.range[1] + space.length,
            ]),
        });
      }
    }

    /**
     * Verify the space before the closing paren.
     */
    function verifySpaceBeforeClosingParen(
      node: Link | Image,
      closingParen: RangeAndLoc,
    ) {
      const space = getSpaceBeforeClosingParen(closingParen);
      if (space.includes("\n")) return;
      if (spaceOption === "always") {
        if (space.length > 0) return;
        context.report({
          node,
          loc: closingParen.loc,
          messageId: "expectedSpaceBeforeClosingParen",
          fix: (fixer) => fixer.insertTextBeforeRange(closingParen.range, " "),
        });
      } else if (spaceOption === "never") {
        if (space.length === 0) return;
        context.report({
          node,
          loc: getSourceLocationFromRange(sourceCode, node, [
            closingParen.range[0] - space.length,
            closingParen.range[0],
          ]),
          messageId: "unexpectedSpaceBeforeClosingParen",
          fix: (fixer) =>
            fixer.removeRange([
              closingParen.range[0] - space.length,
              closingParen.range[0],
            ]),
        });
      }
    }

    return {
      link(node) {
        const kind = getLinkKind(sourceCode, node);
        if (kind !== "inline") return;
        const parsed = parseInlineLink(sourceCode, node);
        if (!parsed) return;
        verifySpaceAfterOpeningParen(node, parsed.openingParen);
        verifySpaceBeforeClosingParen(node, parsed.closingParen);
      },
      image(node) {
        const parsed = parseImage(sourceCode, node);
        if (!parsed) return;
        verifySpaceAfterOpeningParen(node, parsed.openingParen);
        verifySpaceBeforeClosingParen(node, parsed.closingParen);
      },
    };

    /**
     * Get the spaces after the opening paren.
     */
    function getSpaceAfterOpeningParen(openingParen: RangeAndLoc) {
      for (let i = openingParen.range[1]; i < sourceCode.text.length; i++) {
        const char = sourceCode.text[i];
        if (isWhitespace(char)) {
          continue;
        }
        return sourceCode.text.slice(openingParen.range[1], i);
      }
      return sourceCode.text.slice(openingParen.range[1]);
    }

    /**
     * Get the spaces before the closing paren.
     */
    function getSpaceBeforeClosingParen(closingParen: RangeAndLoc) {
      for (let i = closingParen.range[0] - 1; i >= 0; i--) {
        const char = sourceCode.text[i];
        if (isWhitespace(char)) {
          continue;
        }
        return sourceCode.text.slice(i + 1, closingParen.range[0]);
      }
      return sourceCode.text.slice(0, closingParen.range[0]);
    }
  },
});
