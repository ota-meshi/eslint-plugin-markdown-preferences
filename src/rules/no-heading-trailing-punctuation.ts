import type { PhrasingContent, Text } from "../language/ast-types.ts";
import type { Heading } from "../language/ast-types.ts";
import { createRule } from "../utils/index.ts";

// Default punctuation characters to disallow at the end of headings
// Includes ASCII, fullwidth CJK, and halfwidth CJK punctuation marks
const DEFAULT_PUNCTUATION = ".,;:!。、，；：！｡､";

// Heading level range pattern (e.g., "1", "2-4", "1-3")
const LEVEL_RANGE_PATTERN = /^([1-6])(?:-([1-6]))?$/u;

type PunctuationOption =
  | string
  | {
      default?: string;
      [levelOrRange: string]: string | undefined;
    };

type HeadingLevel = 1 | 2 | 3 | 4 | 5 | 6;
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
    return {
      1: chars,
      2: chars,
      3: chars,
      4: chars,
      5: chars,
      6: chars,
    };
  }

  // Handle object option
  const defaultPunctuation = option.default ?? DEFAULT_PUNCTUATION;
  const defaultChars = new Set(
    [...segmenter.segment(defaultPunctuation)].map((s) => s.segment),
  );

  // Initialize all levels with default
  const map: PunctuationMap = {
    1: defaultChars,
    2: defaultChars,
    3: defaultChars,
    4: defaultChars,
    5: defaultChars,
    6: defaultChars,
  };

  // Apply level-specific overrides
  for (const [key, value] of Object.entries(option)) {
    if (key === "default" || value == null) continue;

    const match = LEVEL_RANGE_PATTERN.exec(key);
    if (!match) continue;

    const start = Number(match[1]) as HeadingLevel;
    const end = (match[2] ? Number(match[2]) : start) as HeadingLevel;
    const chars = new Set([...segmenter.segment(value)].map((s) => s.segment));

    for (
      let level = Math.min(start, end);
      level <= Math.max(start, end);
      level++
    ) {
      map[level as HeadingLevel] = chars;
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
                },
                patternProperties: {
                  "^[1-6](-[1-6])?$": {
                    type: "string",
                    description:
                      "Punctuation characters for specific heading level(s). Use '1-3' for a range.",
                  },
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
