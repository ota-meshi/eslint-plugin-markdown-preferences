import type { PhrasingContent, Text } from "../language/ast-types.ts";
import type { Heading } from "../language/ast-types.ts";
import { createRule } from "../utils/index.ts";

// Default punctuation characters to disallow at the end of headings
// Includes ASCII, fullwidth CJK, and halfwidth CJK punctuation marks
const DEFAULT_PUNCTUATION = ".,;:!。、，；：！｡､";

// Mapping of heading level ranges to their numeric start and end levels
const LEVEL_RANGE_MAP = {
  "1": [1, 1],
  "2": [2, 2],
  "3": [3, 3],
  "4": [4, 4],
  "5": [5, 5],
  "6": [6, 6],
  "1-2": [1, 2],
  "1-3": [1, 3],
  "1-4": [1, 4],
  "1-5": [1, 5],
  "1-6": [1, 6],
  "2-3": [2, 3],
  "2-4": [2, 4],
  "2-5": [2, 5],
  "2-6": [2, 6],
  "3-4": [3, 4],
  "3-5": [3, 5],
  "3-6": [3, 6],
  "4-5": [4, 5],
  "4-6": [4, 6],
  "5-6": [5, 6],
} as const;

// All heading levels
const HEADING_LEVELS = [1, 2, 3, 4, 5, 6] as const;

type HeadingLevel = (typeof HEADING_LEVELS)[number];
type PunctuationOption =
  | string
  | Partial<Record<"default" | keyof typeof LEVEL_RANGE_MAP, string>>;

type PunctuationMap = Record<HeadingLevel, Set<string>>;

/**
 * Parse heading level ranges and build a map of level -> punctuation string
 */
function buildPunctuationMap(
  option: PunctuationOption | undefined,
  segmenter: Intl.Segmenter,
): PunctuationMap {
  // Handle string option or undefined (use default for all levels)
  if (typeof option === "string" || option === undefined) {
    const punctuation = option ?? DEFAULT_PUNCTUATION;
    const chars = new Set(
      [...segmenter.segment(punctuation)].map((s) => s.segment),
    );
    return Object.fromEntries(
      HEADING_LEVELS.map((level) => [level, chars]),
    ) as PunctuationMap;
  }

  // Handle object option
  const defaultPunctuation = option.default ?? DEFAULT_PUNCTUATION;
  const defaultChars = new Set(
    [...segmenter.segment(defaultPunctuation)].map((s) => s.segment),
  );

  // Initialize all levels with default
  const map = Object.fromEntries(
    HEADING_LEVELS.map((level) => [level, defaultChars]),
  ) as PunctuationMap;

  // Apply level-specific overrides
  for (const [key, value] of Object.entries(option)) {
    if (key === "default" || value == null) continue;

    const range = LEVEL_RANGE_MAP[key as keyof typeof LEVEL_RANGE_MAP];
    if (!range) continue;

    const chars = new Set([...segmenter.segment(value)].map((s) => s.segment));

    for (let level = range[0]; level <= range[1]; level++) {
      map[level] = chars;
    }
  }

  return map;
}

export default createRule<
  [
    {
      punctuation?: PunctuationOption;
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
            oneOf: [
              {
                type: "string",
                description:
                  "String of punctuation characters to disallow at the end of headings.",
              },
              {
                type: "object",
                properties: {
                  default: {
                    type: "string",
                    description:
                      "Default punctuation characters for all heading levels.",
                  },
                  ...Object.fromEntries(
                    Object.entries(LEVEL_RANGE_MAP).map(
                      ([key, [start, end]]) => [
                        key,
                        {
                          type: "string",
                          description:
                            start === end
                              ? `Punctuation characters for heading level ${start}.`
                              : `Punctuation characters for heading levels ${start} to ${end}.`,
                        },
                      ],
                    ),
                  ),
                },
                additionalProperties: false,
              },
            ],
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

    const segmenter = new Intl.Segmenter("en", {
      granularity: "grapheme",
    });
    const punctuationMap = buildPunctuationMap(
      context.options[0]?.punctuation,
      segmenter,
    );

    // Non-text leaf nodes that represent content
    const contentNodeTypes = new Set([
      "inlineCode",
      "image",
      "imageReference",
      "html",
      "break",
      "footnoteReference",
      "inlineMath",
    ]);

    return {
      heading(node: Heading) {
        // Skip empty headings
        if (!node.children.length) {
          return;
        }

        // Get punctuation set for this heading level
        const punctuationChars = punctuationMap[node.depth];
        if (punctuationChars.size === 0) {
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

        // If we encounter a non-text leaf node that represents content
        // (like inlineCode, image, etc.), the heading doesn't end with text,
        // so we shouldn't check for trailing punctuation
        if (contentNodeTypes.has(child.type)) {
          return null;
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
