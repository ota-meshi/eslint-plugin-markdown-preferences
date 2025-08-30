import { createRule } from "../utils/index.ts";
import type { Heading } from "mdast";
import type { MarkdownSourceCode } from "@eslint/markdown";
import type { ParsedATXHeadingClosingSequence } from "../utils/atx-heading.ts";
import { parseATXHeadingClosingSequence } from "../utils/atx-heading.ts";
import { getParsedLines } from "../utils/lines.ts";
import { getTextWidth } from "../utils/get-text-width.ts";

type Options = {
  mode?:
    | "match-opening"
    | "length"
    | "consistent"
    | "consistent-line-length"
    | "fixed-line-length";
  length?: number;
};

export default createRule<[Options?]>("atx-headings-closing-sequence-length", {
  meta: {
    type: "layout",
    docs: {
      description:
        "enforce consistent length for the closing sequence (trailing #s) in ATX headings.",
      categories: [],
      listCategory: "Stylistic",
    },
    fixable: "code",
    hasSuggestions: false,
    schema: [
      {
        type: "object",
        properties: {
          mode: {
            enum: [
              "match-opening",
              "length",
              "consistent",
              "consistent-line-length",
              "fixed-line-length",
            ],
          },
          length: { type: "integer", minimum: 1 },
        },
        additionalProperties: false,
      },
    ],
    messages: {
      wrongClosingLength:
        "The closing sequence length should be {{expected}} (was {{actual}}).",
    },
  },
  create(context) {
    const sourceCode: MarkdownSourceCode = context.sourceCode;
    const option = Object.assign(
      { mode: "match-opening" },
      context.options[0] || {},
    );

    /**
     * Verify the closing sequence length of an ATX heading.
     */
    function verifyATXHeadingClosingSequenceLength(
      node: Heading,
      getExpected: (
        node: Heading,
        parsed: ParsedATXHeadingClosingSequence,
      ) => number,
    ) {
      const parsed = parseATXHeadingClosingSequence(sourceCode, node);
      if (!parsed || parsed.closingSequence == null) return;
      const actualLength = parsed.closingSequence.text.length;
      const expectedLength = getExpected(node, parsed);
      if (expectedLength === actualLength) return;
      context.report({
        node,
        loc: parsed.closingSequence.loc,
        messageId: "wrongClosingLength",
        data: {
          expected: String(expectedLength),
          actual: String(actualLength),
        },
        fix: (fixer) => {
          return fixer.replaceTextRange(
            parsed.closingSequence.range,
            "#".repeat(expectedLength),
          );
        },
      });
    }

    return option.mode === "match-opening"
      ? (() => {
          const getExpected = (node: Heading) => node.depth;
          return {
            heading(node: Heading) {
              verifyATXHeadingClosingSequenceLength(node, getExpected);
            },
          };
        })()
      : option.mode === "length"
        ? (() => {
            const expected = option.length || 2;
            const getExpected = () => expected;
            return {
              heading(node: Heading) {
                verifyATXHeadingClosingSequenceLength(node, getExpected);
              },
            };
          })()
        : option.mode === "fixed-line-length"
          ? (() => {
              const totalLength = option.length || 80;
              const getExpected = (
                _node: Heading,
                parsed: ParsedATXHeadingClosingSequence,
              ) => {
                return totalLength - getContentLength(parsed);
              };
              return {
                heading(node: Heading) {
                  verifyATXHeadingClosingSequenceLength(node, getExpected);
                },
              };
            })()
          : option.mode === "consistent"
            ? (() => {
                let getExpected:
                  | ((
                      node: Heading,
                      parsed: ParsedATXHeadingClosingSequence,
                    ) => number)
                  | null = null;
                return {
                  heading(node: Heading) {
                    if (getExpected == null) {
                      const parsed = parseATXHeadingClosingSequence(
                        sourceCode,
                        node,
                      );
                      if (!parsed || parsed.closingSequence == null) return;
                      const expected = parsed.closingSequence.text.length;
                      getExpected = () => expected;
                    } else {
                      verifyATXHeadingClosingSequenceLength(node, getExpected);
                    }
                  },
                };
              })()
            : option.mode === "consistent-line-length"
              ? (() => {
                  type HeadingInfo = {
                    node: Heading;
                    parsed: ParsedATXHeadingClosingSequence;
                  };
                  const headings: HeadingInfo[] = [];
                  return {
                    heading(node: Heading) {
                      const parsed = parseATXHeadingClosingSequence(
                        sourceCode,
                        node,
                      );
                      if (!parsed || !parsed.closingSequence) return;
                      headings.push({ node, parsed });
                    },
                    "root:exit"() {
                      // Find the heading with the longest content
                      let mostLongContentHeading:
                        | (HeadingInfo & {
                            contentLength: number;
                            lineLength: number;
                          })
                        | null = null;
                      for (const heading of headings) {
                        const contentLength = getContentLength(heading.parsed);
                        if (
                          mostLongContentHeading == null ||
                          contentLength > mostLongContentHeading.contentLength
                        ) {
                          const lineLength = getLineLength(heading.parsed);
                          mostLongContentHeading = {
                            ...heading,
                            contentLength,
                            lineLength,
                          };
                        }
                      }
                      if (!mostLongContentHeading) return;
                      // Among headings longer than the longest content, find the shortest line
                      let minLineLength: number =
                        mostLongContentHeading.lineLength;
                      for (const heading of headings) {
                        const lineLength = getLineLength(heading.parsed);
                        if (
                          mostLongContentHeading.contentLength < lineLength &&
                          lineLength < minLineLength
                        ) {
                          minLineLength = Math.min(minLineLength, lineLength);
                        }
                      }
                      const getExpected = (
                        _node: Heading,
                        parsed: ParsedATXHeadingClosingSequence,
                      ) => {
                        return minLineLength - getContentLength(parsed);
                      };
                      for (const { node } of headings) {
                        verifyATXHeadingClosingSequenceLength(
                          node,
                          getExpected,
                        );
                      }
                    },
                  };
                })()
              : {};

    /**
     * Get the content length of the heading.
     */
    function getContentLength(parsed: ParsedATXHeadingClosingSequence) {
      const lines = getParsedLines(sourceCode);
      const line = lines.get(parsed.closingSequence.loc.start.line);
      // Length before the closing sequence
      const beforeClosing = sourceCode.text.slice(
        line.range[0],
        parsed.closingSequence.range[0],
      );
      return getTextWidth(beforeClosing);
    }

    /**
     * Get the line length of the heading.
     */
    function getLineLength(parsed: ParsedATXHeadingClosingSequence) {
      const lines = getParsedLines(sourceCode);
      const line = lines.get(parsed.closingSequence.loc.start.line);
      const lineText = sourceCode.text.slice(
        line.range[0],
        parsed.closingSequence.range[1],
      );
      return getTextWidth(lineText);
    }
  },
});
