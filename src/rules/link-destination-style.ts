import type { Definition, Image, Link } from "mdast";
import { getLinkKind } from "../utils/ast.ts";
import { createRule } from "../utils/index.ts";
import { parseInlineLink } from "../utils/link.ts";
import { parseImage } from "../utils/image.ts";
import { parseLinkDefinition } from "../utils/link-definition.ts";
import type { SourceLocation } from "estree";
import { isAsciiControlCharacter, isWhitespace } from "../utils/unicode.ts";

type Options = {
  style?: "bare" | "pointy-brackets";
  avoidEscape?: boolean;
};

const STYLES = {
  bare: {
    messageId: "expectedBare",
    typeName: "bare",
  },
  "pointy-brackets": {
    messageId: "expectedPointyBrackets",
    typeName: "pointy-bracketed",
  },
} as const;

export default createRule<[Options?]>("link-destination-style", {
  meta: {
    type: "layout",
    docs: {
      description: "enforce a consistent style for link destinations",
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
            enum: ["bare", "pointy-brackets"],
          },
          avoidEscape: {
            type: "boolean",
          },
        },
      },
    ],
    messages: {
      expectedBare:
        "Link destination should not be enclosed in pointy brackets.",
      expectedPointyBrackets:
        "Expected link destination to be pointy bracketed.",
    },
  },
  create(context) {
    const sourceCode = context.sourceCode;
    const options = context.options[0] || {};
    const preferStyle = STYLES[options.style || "bare"];
    const avoidEscape = options.avoidEscape ?? true;

    /**
     * Verify destination style.
     */
    function verifyDestination(
      node: Link | Image | Definition,
      destination: {
        type: "pointy-bracketed" | "bare";
        text: string;
        range: [number, number];
        loc: SourceLocation;
      },
    ) {
      if (preferStyle.typeName === destination.type) return;
      if (avoidEscape) {
        // Check if the destination can be written in the specified style without escaping.
        if (preferStyle.typeName === "bare") {
          if (
            hasWhitespaceOrControlCharacter(destination.text) ||
            !isBalancedDestinationParentheses(destination.text)
          ) {
            return;
          }
        } else if (preferStyle.typeName === "pointy-bracketed") {
          if (hasLoneLastBackslash(destination.text)) {
            return;
          }
        }
      }

      context.report({
        node,
        loc: destination.loc,
        messageId: preferStyle.messageId,
        *fix(fixer) {
          if (
            destination.type === "bare" &&
            preferStyle.typeName === "pointy-bracketed"
          ) {
            // bare -> pointy-bracketed
            yield fixer.insertTextBeforeRange(
              [destination.range[0], destination.range[0]],
              "<",
            );
            if (hasLoneLastBackslash(destination.text)) {
              yield fixer.insertTextBeforeRange(
                [destination.range[1] - 1, destination.range[1]],
                "\\",
              );
            }
            yield fixer.insertTextAfterRange(
              [destination.range[1], destination.range[1]],
              ">",
            );
          } else if (
            destination.type === "pointy-bracketed" &&
            preferStyle.typeName === "bare"
          ) {
            // pointy-bracketed -> bare
            yield fixer.removeRange([
              destination.range[0],
              destination.range[0] + 1,
            ]);
            const balancedParentheses = isBalancedDestinationParentheses(
              destination.text,
            );

            const textStartIndex = destination.range[0] + 1;
            const textEndIndex = destination.range[1] - 1;
            for (let index = textStartIndex; index < textEndIndex; index++) {
              const c = sourceCode.text[index];
              if (c === "(" || c === ")") {
                if (!balancedParentheses) {
                  yield fixer.insertTextBeforeRange([index, index], "\\");
                }
              } else if (isWhitespace(c) || isAsciiControlCharacter(c)) {
                yield fixer.replaceTextRange([index, index + 1], encodeURI(c));
              } else if (c === "\\") {
                index++;
              }
            }
            yield fixer.removeRange([
              destination.range[1] - 1,
              destination.range[1],
            ]);
          }
        },
      });
    }

    return {
      link(node) {
        const kind = getLinkKind(sourceCode, node);
        if (kind !== "inline") return;
        const parsed = parseInlineLink(sourceCode, node);
        if (!parsed) return;
        verifyDestination(node, parsed.destination);
      },
      image(node) {
        const parsed = parseImage(sourceCode, node);
        if (!parsed) return;
        verifyDestination(node, parsed.destination);
      },
      definition(node) {
        if (!node.url && preferStyle.typeName === "bare") {
          // Ignore empty definitions because they cannot be written in bare style.
          return;
        }
        const parsed = parseLinkDefinition(sourceCode, node);
        if (!parsed) return;
        verifyDestination(node, parsed.destination);
      },
    };
  },
});

/**
 * Checks if the text has whitespace or control characters.
 */
function hasWhitespaceOrControlCharacter(text: string) {
  for (let index = 0; index < text.length; index++) {
    const c = text[index];
    if (isWhitespace(c) || isAsciiControlCharacter(c)) {
      return true;
    } else if (c === "\\") {
      index++;
    }
  }
  return false;
}

/**
 * Checks if the destination text is balanced parentheses.
 */
function isBalancedDestinationParentheses(text: string) {
  let parentheses = 0;

  for (let index = 0; index < text.length; index++) {
    const c = text[index];
    if (c === "(") {
      parentheses++;
    } else if (c === ")") {
      parentheses--;
      if (parentheses < 0) return false;
    } else if (c === "\\") {
      index++;
    }
  }
  if (parentheses > 0) return false;
  return true;
}

/**
 * Checks if the text has a lone last backslash.
 */
function hasLoneLastBackslash(text: string) {
  if (!text.endsWith("\\")) return false;

  let escapeText = "";
  while (text.endsWith(`${escapeText}\\`)) {
    escapeText += "\\";
  }
  // An odd number of backslashes has lone last backslash.
  return escapeText.length % 2 === 1;
}
