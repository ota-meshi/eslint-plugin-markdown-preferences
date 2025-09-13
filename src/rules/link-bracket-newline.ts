import type {
  Definition,
  Image,
  ImageReference,
  Link,
  LinkReference,
} from "mdast";
import { createRule } from "../utils/index.ts";
import { getLinkKind, getSourceLocationFromRange } from "../utils/ast.ts";
import { parseInlineLink } from "../utils/link.ts";
import { parseLinkReference } from "../utils/link-reference.ts";
import { parseImage } from "../utils/image.ts";
import { parseImageReference } from "../utils/image-reference.ts";
import { parseLinkDefinition } from "../utils/link-definition.ts";
import { isWhitespace } from "../utils/unicode.ts";

type Options = {
  newline?: "always" | "never" | "consistent";
  multiline?: boolean;
};
export default createRule<[Options?]>("link-bracket-newline", {
  meta: {
    type: "layout",
    docs: {
      description:
        "enforce linebreaks after opening and before closing link brackets",
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
      expectedNewlineAfterOpeningBracket:
        "Expected a linebreak after this opening bracket.",
      unexpectedNewlineAfterOpeningBracket:
        "Unexpected linebreak after this opening bracket.",
      expectedNewlineBeforeClosingBracket:
        "Expected a linebreak before this closing bracket.",
      unexpectedNewlineBeforeClosingBracket:
        "Unexpected linebreak before this closing bracket.",
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
      return (bracketsRange: [number, number]) => {
        if (multiline) {
          const text = sourceCode.text.slice(
            bracketsRange[0] + 1,
            bracketsRange[1] - 1,
          );
          if (text.trim().includes("\n")) {
            return "always";
          }
        }
        return newline;
      };
    }

    /**
     * Verify the newline around the brackets.
     */
    function verifyNewlineAroundBrackets(
      node: Link | LinkReference | Image | ImageReference | Definition,
      bracketsRange: [number, number],
    ) {
      const newline = optionProvider(bracketsRange);
      const openingBracketIndex = bracketsRange[0];
      const spaceAfterOpeningBracket =
        getSpaceAfterOpeningBracket(openingBracketIndex);
      verifyNewlineAfterOpeningBracket(
        node,
        spaceAfterOpeningBracket,
        openingBracketIndex,
        newline,
      );

      const closingBracketIndex = bracketsRange[1] - 1;
      const newlineOptionBeforeClosingBracket =
        newline === "consistent"
          ? getSpaceAfterOpeningBracket(bracketsRange[0]).includes("\n")
            ? "always"
            : "never"
          : newline;
      verifyNewlineBeforeClosingBracket(
        node,
        getSpaceBeforeClosingBracket(closingBracketIndex),
        openingBracketIndex,
        closingBracketIndex,
        newlineOptionBeforeClosingBracket,
      );
    }

    /**
     * Verify the newline after the opening bracket and before the closing bracket.
     */
    function verifyNewlineAfterOpeningBracket(
      node: Link | LinkReference | Image | ImageReference | Definition,
      spaceAfterOpeningBracket: string,
      openingBracketIndex: number,
      newline: "always" | "never" | "consistent",
    ) {
      if (newline === "always") {
        if (spaceAfterOpeningBracket.includes("\n")) return;
        const loc = getSourceLocationFromRange(sourceCode, node, [
          openingBracketIndex,
          openingBracketIndex + 1,
        ]);
        context.report({
          node,
          loc,
          messageId: "expectedNewlineAfterOpeningBracket",
          fix: (fixer) =>
            fixer.insertTextAfterRange(
              [openingBracketIndex, openingBracketIndex + 1],
              `\n${" ".repeat(loc.start.column)}${spaceAfterOpeningBracket}`,
            ),
        });
      } else if (newline === "never") {
        if (!spaceAfterOpeningBracket.includes("\n")) return;
        context.report({
          node,
          loc: getSourceLocationFromRange(sourceCode, node, [
            openingBracketIndex + 1,
            openingBracketIndex + 1 + spaceAfterOpeningBracket.length,
          ]),
          messageId: "unexpectedNewlineAfterOpeningBracket",
          fix: (fixer) =>
            fixer.replaceTextRange(
              [
                openingBracketIndex + 1,
                openingBracketIndex + 1 + spaceAfterOpeningBracket.length,
              ],
              " ",
            ),
        });
      }
    }

    /**
     * Verify the newline before the closing bracket.
     */
    function verifyNewlineBeforeClosingBracket(
      node: Link | LinkReference | Image | ImageReference | Definition,
      spaceBeforeClosingBracket: string,
      openingBracketIndex: number,
      closingBracketIndex: number,
      newline: "always" | "never",
    ) {
      if (
        openingBracketIndex + 1 ===
        closingBracketIndex - spaceBeforeClosingBracket.length
      ) {
        // It space is already checked by `verifyNewlineAfterOpeningBracket()`.
        return;
      }
      if (newline === "always") {
        if (spaceBeforeClosingBracket.includes("\n")) return;
        context.report({
          node,
          loc: getSourceLocationFromRange(sourceCode, node, [
            closingBracketIndex,
            closingBracketIndex + 1,
          ]),
          messageId: "expectedNewlineBeforeClosingBracket",
          fix: (fixer) => {
            const openingBracketLoc = getSourceLocationFromRange(
              sourceCode,
              node,
              [openingBracketIndex, openingBracketIndex + 1],
            );
            return fixer.insertTextBeforeRange(
              [closingBracketIndex, closingBracketIndex + 1],
              `\n${" ".repeat(openingBracketLoc.start.column)}`,
            );
          },
        });
      } else if (newline === "never") {
        if (!spaceBeforeClosingBracket.includes("\n")) return;
        context.report({
          node,
          loc: getSourceLocationFromRange(sourceCode, node, [
            closingBracketIndex - spaceBeforeClosingBracket.length,
            closingBracketIndex,
          ]),
          messageId: "unexpectedNewlineBeforeClosingBracket",
          fix: (fixer) =>
            fixer.replaceTextRange(
              [
                closingBracketIndex - spaceBeforeClosingBracket.length,
                closingBracketIndex,
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
        verifyNewlineAroundBrackets(node, parsed.text.range);
      },
      linkReference(node) {
        const parsed = parseLinkReference(sourceCode, node);
        if (!parsed) return;
        verifyNewlineAroundBrackets(node, parsed.text.range);
        if (parsed.label?.type === "full") {
          verifyNewlineAroundBrackets(node, parsed.label.range);
        }
      },
      image(node) {
        const parsed = parseImage(sourceCode, node);
        if (!parsed) return;
        verifyNewlineAroundBrackets(node, parsed.text.range);
      },
      imageReference(node) {
        const parsed = parseImageReference(sourceCode, node);
        if (!parsed) return;
        verifyNewlineAroundBrackets(node, parsed.text.range);
        if (parsed.label?.type === "full") {
          verifyNewlineAroundBrackets(node, parsed.label.range);
        }
      },
      definition(node) {
        const parsed = parseLinkDefinition(sourceCode, node);
        if (!parsed) return;
        verifyNewlineAroundBrackets(node, parsed.label.range);
      },
    };

    /**
     * Get the spaces after the opening bracket.
     */
    function getSpaceAfterOpeningBracket(openingBracketIndex: number) {
      for (let i = openingBracketIndex + 1; i < sourceCode.text.length; i++) {
        const char = sourceCode.text[i];
        if (isWhitespace(char)) {
          continue;
        }
        return sourceCode.text.slice(openingBracketIndex + 1, i);
      }
      return sourceCode.text.slice(openingBracketIndex + 1);
    }

    /**
     * Get the spaces before the closing bracket.
     */
    function getSpaceBeforeClosingBracket(closingBracketIndex: number) {
      for (let i = closingBracketIndex - 1; i >= 0; i--) {
        const char = sourceCode.text[i];
        if (isWhitespace(char)) {
          continue;
        }
        return sourceCode.text.slice(i + 1, closingBracketIndex);
      }
      return sourceCode.text.slice(0, closingBracketIndex);
    }
  },
});
