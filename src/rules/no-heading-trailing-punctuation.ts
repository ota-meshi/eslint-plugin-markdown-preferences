import type { PhrasingContent, Text } from "../language/ast-types.ts";
import type { Heading } from "../language/ast-types.ts";
import { createRule } from "../utils/index.ts";

// Default punctuation characters to disallow at the end of headings
// Includes ASCII, fullwidth CJK, and halfwidth CJK punctuation marks
const DEFAULT_PUNCTUATION = ".,;:!。、，；：！｡､";

export default createRule<
  [
    {
      punctuation?: string;
    }?,
  ]
>("no-heading-trailing-punctuation", {
  meta: {
    type: "suggestion",
    docs: {
      description: "disallow trailing punctuation in headings.",
      categories: [],
      listCategory: "Preference",
    },
    hasSuggestions: true,
    schema: [
      {
        type: "object",
        properties: {
          punctuation: {
            type: "string",
            description:
              "String of punctuation characters to disallow at the end of headings.",
          },
        },
        additionalProperties: false,
      },
    ],
    messages: {
      trailingPunctuation:
        "Headings should not end with punctuation '{{char}}'.",
      removePunctuation: "Remove trailing punctuation '{{char}}'.",
    },
  },
  create(context) {
    const sourceCode = context.sourceCode;

    const punctuation = context.options[0]?.punctuation ?? DEFAULT_PUNCTUATION;
    const segmenter = new Intl.Segmenter("en", {
      granularity: "grapheme",
    });
    const punctuationChars = new Set(
      [...segmenter.segment(punctuation)].map((s) => s.segment),
    );

    return {
      heading(node: Heading) {
        // Skip empty headings
        if (!node.children.length) {
          return;
        }

        // Find the last text node that contributes to the heading content
        const lastTextNode = findLastTextNode(node.children);
        if (!lastTextNode) {
          return;
        }

        // Check if the last content ends with disallowed punctuation
        const text = sourceCode.getText(lastTextNode);
        const trimmedText = text.trimEnd();
        if (!trimmedText.length) {
          return;
        }

        // Use Intl.Segmenter to correctly handle grapheme clusters (e.g., emoji)
        const segments = [...segmenter.segment(trimmedText)];
        const lastSegment = segments[segments.length - 1];
        if (!lastSegment) {
          return;
        }
        const lastChar = lastSegment.segment;

        if (!punctuationChars.has(lastChar)) {
          return;
        }

        const [nodeStart] = sourceCode.getRange(lastTextNode);
        const punctuationIndex = nodeStart + lastSegment.index;

        context.report({
          node: lastTextNode,
          messageId: "trailingPunctuation",
          data: {
            char: lastChar,
          },
          loc: {
            start: sourceCode.getLocFromIndex(punctuationIndex),
            end: sourceCode.getLocFromIndex(punctuationIndex + lastChar.length),
          },
          suggest: [
            {
              messageId: "removePunctuation",
              data: {
                char: lastChar,
              },
              fix(fixer) {
                return fixer.removeRange([
                  punctuationIndex,
                  punctuationIndex + lastChar.length,
                ]);
              },
            },
          ],
        });
      },
    };

    /**
     * Find the last text node within a node's children.
     * Recursively traverses nested structures (emphasis, strong, link, etc.).
     */
    function findLastTextNode(children: PhrasingContent[]): Text | null {
      for (let i = children.length - 1; i >= 0; i--) {
        const child = children[i];

        if (child.type === "text") {
          if (child.value.trim()) {
            return child;
          }
          continue;
        }

        if ("children" in child && Array.isArray(child.children)) {
          const nestedLast = findLastTextNode(child.children);
          if (nestedLast) {
            return nestedLast;
          }
        }
      }

      return null;
    }
  },
});
