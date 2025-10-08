import type {
  Definition,
  Image,
  ImageReference,
  Link,
  LinkReference,
} from "../language/ast-types.ts";
import { createRule } from "../utils/index.ts";
import { getLinkKind } from "../utils/ast.ts";
import { parseInlineLink } from "../utils/link.ts";
import { parseImage } from "../utils/image.ts";
import { isWhitespace } from "../utils/unicode.ts";

type Options = {
  newline?: "always" | "never" | "consistent";
  multiline?: boolean;
};
export default createRule<[Options?]>("link-paren-newline", {
  meta: {
    type: "layout",
    docs: {
      description:
        "enforce linebreaks after opening and before closing link parentheses",
      categories: ["standard"],
      listCategory: "Whitespace",
    },
    fixable: "whitespace",
    hasSuggestions: false,
    schema: [
      {
        type: "object",
        properties: {
          newline: {
            enum: ["always", "never", "consistent"],
          },
          multiline: {
            type: "boolean",
          },
        },
        additionalProperties: false,
      },
    ],
    messages: {
      expectedNewlineAfterOpeningParen:
        "Expected a linebreak after this opening parenthesis.",
      unexpectedNewlineAfterOpeningParen:
        "Unexpected linebreak after this opening parenthesis.",
      expectedNewlineBeforeClosingParen:
        "Expected a linebreak before this closing parenthesis.",
      unexpectedNewlineBeforeClosingParen:
        "Unexpected linebreak before this closing parenthesis.",
    },
  },
  create(context) {
    const sourceCode = context.sourceCode;
    const optionProvider = parseOptions(context.options[0]);

    /**
     * Parse the options.
     */
    function parseOptions(option?: Options) {
      const newline = option?.newline ?? "never";
      const multiline = option?.multiline ?? false;
      return (openingParenIndex: number, closingParenIndex: number) => {
        if (multiline) {
          const text = sourceCode.text.slice(
            openingParenIndex + 1,
            closingParenIndex,
          );
          if (text.trim().includes("\n")) {
            return "always";
          }
        }
        return newline;
      };
    }

    /**
     * Verify the newline around the parentheses.
     */
    function verifyNewlineAroundParens(
      node: Link | LinkReference | Image | ImageReference | Definition,
      openingParenIndex: number,
      closingParenIndex: number,
    ) {
      const newline = optionProvider(openingParenIndex, closingParenIndex);
      const spaceAfterOpeningParen =
        getSpaceAfterOpeningParen(openingParenIndex);
      verifyNewlineAfterOpeningParen(
        node,
        spaceAfterOpeningParen,
        openingParenIndex,
        newline,
      );

      const newlineOptionBeforeClosingParen =
        newline === "consistent"
          ? getSpaceAfterOpeningParen(openingParenIndex).includes("\n")
            ? "always"
            : "never"
          : newline;
      verifyNewlineBeforeClosingParen(
        node,
        getSpaceBeforeClosingParen(closingParenIndex),
        openingParenIndex,
        closingParenIndex,
        newlineOptionBeforeClosingParen,
      );
    }

    /**
     * Verify the newline after the opening parenthesis and before the closing parenthesis.
     */
    function verifyNewlineAfterOpeningParen(
      node: Link | LinkReference | Image | ImageReference | Definition,
      spaceAfterOpeningParen: string,
      openingParenIndex: number,
      newline: "always" | "never" | "consistent",
    ) {
      if (newline === "always") {
        if (spaceAfterOpeningParen.includes("\n")) return;
        const loc = {
          start: sourceCode.getLocFromIndex(openingParenIndex),
          end: sourceCode.getLocFromIndex(openingParenIndex + 1),
        };
        context.report({
          node,
          loc,
          messageId: "expectedNewlineAfterOpeningParen",
          fix: (fixer) =>
            fixer.insertTextAfterRange(
              [openingParenIndex, openingParenIndex + 1],
              `\n${" ".repeat(loc.start.column)}${spaceAfterOpeningParen}`,
            ),
        });
      } else if (newline === "never") {
        if (!spaceAfterOpeningParen.includes("\n")) return;
        context.report({
          node,
          loc: {
            start: sourceCode.getLocFromIndex(openingParenIndex + 1),
            end: sourceCode.getLocFromIndex(
              openingParenIndex + 1 + spaceAfterOpeningParen.length,
            ),
          },
          messageId: "unexpectedNewlineAfterOpeningParen",
          fix: (fixer) =>
            fixer.replaceTextRange(
              [
                openingParenIndex + 1,
                openingParenIndex + 1 + spaceAfterOpeningParen.length,
              ],
              " ",
            ),
        });
      }
    }

    /**
     * Verify the newline before the closing parenthesis.
     */
    function verifyNewlineBeforeClosingParen(
      node: Link | LinkReference | Image | ImageReference | Definition,
      spaceBeforeClosingParen: string,
      openingParenIndex: number,
      closingParenIndex: number,
      newline: "always" | "never",
    ) {
      if (
        openingParenIndex + 1 ===
        closingParenIndex - spaceBeforeClosingParen.length
      ) {
        // It space is already checked by `verifyNewlineAfterOpeningParen()`.
        return;
      }
      if (newline === "always") {
        if (spaceBeforeClosingParen.includes("\n")) return;
        context.report({
          node,
          loc: {
            start: sourceCode.getLocFromIndex(closingParenIndex),
            end: sourceCode.getLocFromIndex(closingParenIndex + 1),
          },
          messageId: "expectedNewlineBeforeClosingParen",
          fix: (fixer) => {
            const openingParenStartLoc =
              sourceCode.getLocFromIndex(openingParenIndex);
            return fixer.insertTextBeforeRange(
              [closingParenIndex, closingParenIndex + 1],
              `\n${" ".repeat(openingParenStartLoc.column)}`,
            );
          },
        });
      } else if (newline === "never") {
        if (!spaceBeforeClosingParen.includes("\n")) return;
        context.report({
          node,
          loc: {
            start: sourceCode.getLocFromIndex(
              closingParenIndex - spaceBeforeClosingParen.length,
            ),
            end: sourceCode.getLocFromIndex(closingParenIndex),
          },
          messageId: "unexpectedNewlineBeforeClosingParen",
          fix: (fixer) =>
            fixer.replaceTextRange(
              [
                closingParenIndex - spaceBeforeClosingParen.length,
                closingParenIndex,
              ],
              " ",
            ),
        });
      }
    }

    return {
      link(node) {
        const kind = getLinkKind(sourceCode, node);
        if (kind !== "inline") return;
        const parsed = parseInlineLink(sourceCode, node);
        if (!parsed) return;
        verifyNewlineAroundParens(
          node,
          parsed.openingParen.range[0],
          parsed.closingParen.range[0],
        );
      },
      image(node) {
        const parsed = parseImage(sourceCode, node);
        if (!parsed) return;
        verifyNewlineAroundParens(
          node,
          parsed.openingParen.range[0],
          parsed.closingParen.range[0],
        );
      },
    };

    /**
     * Get the spaces after the opening parenthesis.
     */
    function getSpaceAfterOpeningParen(openingParenIndex: number) {
      for (let i = openingParenIndex + 1; i < sourceCode.text.length; i++) {
        const char = sourceCode.text[i];
        if (isWhitespace(char)) {
          continue;
        }
        return sourceCode.text.slice(openingParenIndex + 1, i);
      }
      return sourceCode.text.slice(openingParenIndex + 1);
    }

    /**
     * Get the spaces before the closing parenthesis.
     */
    function getSpaceBeforeClosingParen(closingParenIndex: number) {
      for (let i = closingParenIndex - 1; i >= 0; i--) {
        const char = sourceCode.text[i];
        if (isWhitespace(char)) {
          continue;
        }
        return sourceCode.text.slice(i + 1, closingParenIndex);
      }
      return sourceCode.text.slice(0, closingParenIndex);
    }
  },
});
