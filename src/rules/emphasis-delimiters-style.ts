import type { Emphasis, Strong } from "mdast";
import { createRule } from "../utils/index.ts";
import { isPunctuation, isWhitespace } from "../utils/unicode.ts";

/**
 * Options for emphasis-delimiters-style rule
 */
type EmphasisDelimiter = "*" | "_";
type StrongDelimiter = "**" | "__";
type StrongEmphasisString = "***" | "___";
type StrongEmphasisObject =
  | { outer: "*"; inner: "__" }
  | { outer: "**"; inner: "_" }
  | { outer: "_"; inner: "**" }
  | { outer: "__"; inner: "*" };
type EmphasisDelimitersStyleOption = {
  emphasis?: EmphasisDelimiter;
  strong?: StrongDelimiter;
  strongEmphasis?: StrongEmphasisString | StrongEmphasisObject;
};

type Delimiter =
  | EmphasisDelimiter
  | StrongDelimiter
  | `${EmphasisDelimiter}${StrongDelimiter}`
  | `${StrongDelimiter}${EmphasisDelimiter}`;
type DelimiterPair = { opening: Delimiter; closing: Delimiter };

/**
 * Check if the emphasis/strong node is intraword (inside a word)
 * CommonMark: Intraword emphasis with _ is not allowed
 */
function isIntrawordForUnderline(
  text: string,
  range: [number, number],
): boolean {
  const before = text[range[0] - 1];
  if (!isWhitespace(before) && !isPunctuation(before)) return true;
  const after = text[range[1]];
  if (!isWhitespace(after) && !isPunctuation(after)) return true;
  return false;
}

export default createRule<[EmphasisDelimitersStyleOption?]>(
  "emphasis-delimiters-style",
  {
    meta: {
      type: "layout",
      docs: {
        description:
          "enforce a consistent delimiter style for emphasis and strong emphasis",
        categories: [],
        listCategory: "Stylistic",
      },
      fixable: "code",
      hasSuggestions: false,
      schema: [
        {
          type: "object",
          properties: {
            emphasis: { enum: ["*", "_"] },
            strong: { enum: ["**", "__"] },
            strongEmphasis: {
              anyOf: [
                { enum: ["***", "___"] },
                {
                  type: "object",
                  properties: { outer: { const: "*" }, inner: { const: "__" } },
                  required: ["outer", "inner"],
                  additionalProperties: false,
                },
                {
                  type: "object",
                  properties: { outer: { const: "**" }, inner: { const: "_" } },
                  required: ["outer", "inner"],
                  additionalProperties: false,
                },
                {
                  type: "object",
                  properties: { outer: { const: "_" }, inner: { const: "**" } },
                  required: ["outer", "inner"],
                  additionalProperties: false,
                },
                {
                  type: "object",
                  properties: { outer: { const: "__" }, inner: { const: "*" } },
                  required: ["outer", "inner"],
                  additionalProperties: false,
                },
              ],
            },
          },
          additionalProperties: false,
        },
      ],
      messages: {
        wrongEmphasis:
          "Emphasis delimiter should be '{{expectedOpening}}' (was '{{actualOpening}}').",
        wrongStrong:
          "Strong emphasis delimiter should be '{{expectedOpening}}' (was '{{actualOpening}}').",
        wrongStrongEmphasis:
          "Delimiter for strong+emphasis should be '{{expectedOpening}}' (was '{{actualOpening}}').",
        wrongStrongEmphasisDelimiterPair:
          "Delimiters for strong+emphasis should be '{{expectedOpening}}' ... '{{expectedClosing}}' (was '{{actualOpening}}' ... '{{actualClosing}}').",
      },
    },
    create(context) {
      const sourceCode = context.sourceCode;
      // Parse options with defaults
      const option = context.options[0] ?? {};
      const emphasisDelimiter: EmphasisDelimiter = option.emphasis ?? "_";
      const emphasis: DelimiterPair = {
        opening: emphasisDelimiter,
        closing: emphasisDelimiter,
      };
      const strongDelimiter: StrongDelimiter = option.strong ?? "**";
      const strong: DelimiterPair = {
        opening: strongDelimiter,
        closing: strongDelimiter,
      };
      const strongEmphasis = parseStrongEmphasis(
        emphasisDelimiter,
        strongDelimiter,
        option.strongEmphasis,
      );

      const processed = new Set<Emphasis | Strong>();

      /**
       * Verify the delimiter of the node
       */
      function verifyDelimiter(
        node: Emphasis | Strong,
        expected: DelimiterPair,
        messageId: "wrongEmphasis" | "wrongStrong" | "wrongStrongEmphasis",
      ) {
        const range = sourceCode.getRange(node);
        if (
          sourceCode.text.startsWith(expected.opening, range[0]) &&
          sourceCode.text.endsWith(expected.closing, range[1])
        ) {
          return;
        }
        if (
          sourceCode.text[range[0] - 1] === expected.opening[0] ||
          sourceCode.text[range[1]] === expected.closing.at(-1) ||
          sourceCode.text[range[0] + expected.opening.length] ===
            expected.opening.at(-1) ||
          sourceCode.text[range[1] - expected.closing.length - 1] ===
            expected.closing[0]
        ) {
          // When converted, it will be recognized as a delimiter with a different meaning and will be ignored
          return;
        }

        // CommonMark: Intraword emphasis with _ is not allowed
        // Example: foo_bar_ → not emphasized
        // If trying to convert delimiter to _, skip if inside a word
        if (
          (expected.opening.startsWith("_") ||
            expected.closing.at(-1) === "_") &&
          isIntrawordForUnderline(sourceCode.text, range)
        ) {
          // Do not convert to _ delimiter inside a word
          return;
        }

        const actual = {
          opening: sourceCode.text.slice(
            range[0],
            range[0] + expected.opening.length,
          ),
          closing: sourceCode.text.slice(
            range[1] - expected.closing.length,
            range[1],
          ),
        };

        context.report({
          node,
          messageId:
            expected.opening === expected.closing &&
            actual.opening === actual.closing
              ? messageId
              : "wrongStrongEmphasisDelimiterPair",
          data: {
            expectedOpening: expected.opening,
            actualOpening: actual.opening,
            expectedClosing: expected.closing,
            actualClosing: actual.closing,
          },
          fix(fixer) {
            return [
              fixer.replaceTextRange(
                [range[0], range[0] + expected.opening.length],
                expected.opening,
              ),
              fixer.replaceTextRange(
                [range[1] - expected.closing.length, range[1]],
                expected.closing,
              ),
            ];
          },
        });
      }

      /**
       * Verify the emphasis node has the correct delimiter
       */
      function verifyEmphasis(node: Emphasis) {
        verifyDelimiter(node, emphasis, "wrongEmphasis");
      }

      /**
       * Verify the emphasis node has the correct delimiter
       */
      function verifyStrong(node: Strong) {
        verifyDelimiter(node, strong, "wrongStrong");
      }

      /**
       * Verify the strong emphasis node has the correct delimiter
       */
      function verifyStrongEmphasis(node: Emphasis | Strong) {
        verifyDelimiter(node, strongEmphasis, "wrongStrongEmphasis");
      }

      return {
        emphasis(node) {
          if (processed.has(node)) return;
          processed.add(node);
          if (
            node.children.length === 1 &&
            node.children[0].type === "strong"
          ) {
            processed.add(node.children[0]);
            verifyStrongEmphasis(node);
            return;
          }
          verifyEmphasis(node);
        },
        strong(node) {
          if (processed.has(node)) return;
          processed.add(node);
          if (
            node.children.length === 1 &&
            node.children[0].type === "emphasis"
          ) {
            processed.add(node.children[0]);
            verifyStrongEmphasis(node);
            return;
          }
          verifyStrong(node);
        },
      };
    },
  },
);

/**
 * Parse strongEmphasis option to normalized object form
 */
function parseStrongEmphasis(
  emphasis: EmphasisDelimiter,
  strong: StrongDelimiter,
  strongEmphasisOpt?: StrongEmphasisString | StrongEmphasisObject,
): DelimiterPair {
  if (strongEmphasisOpt != null) {
    if (typeof strongEmphasisOpt === "string") {
      return { opening: strongEmphasisOpt, closing: strongEmphasisOpt };
    }
    return {
      opening: strongEmphasisOpt.outer + strongEmphasisOpt.inner,
      closing: strongEmphasisOpt.inner + strongEmphasisOpt.outer,
    } as DelimiterPair;
  }
  if (emphasis === "*") {
    if (strong === "**") {
      return { opening: "***", closing: "***" };
    }
    return { opening: "*__", closing: "__*" };
  } else if (strong === "**") {
    return { opening: "**_", closing: "_**" };
  }
  return { opening: "___", closing: "___" };
}
