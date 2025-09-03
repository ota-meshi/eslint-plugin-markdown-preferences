import { createRule } from "../utils/index.ts";
import type { Heading } from "mdast";
import type { MarkdownSourceCode } from "@eslint/markdown";
import type { ParsedATXHeadingWithClosingSequence } from "../utils/atx-heading.ts";
import { parseATXHeading } from "../utils/atx-heading.ts";
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

export default createRule<[Options?]>("atx-heading-closing-sequence-length", {
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
      parsed: ParsedATXHeadingWithClosingSequence,
      reportNode: Heading,
      expectedLength: number,
    ) {
      const actualLength = parsed.closingSequence.text.length;
      if (expectedLength === actualLength) return;
      context.report({
        node: reportNode,
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

    if (option.mode === "match-opening") {
      return {
        heading(node: Heading) {
          const parsed = parseATXHeading(sourceCode, node);
          if (!parsed || parsed.closingSequence == null) return;
          verifyATXHeadingClosingSequenceLength(parsed, node, node.depth);
        },
      };
    }
    if (option.mode === "length") {
      const expected = option.length || 2;
      return {
        heading(node: Heading) {
          const parsed = parseATXHeading(sourceCode, node);
          if (!parsed || parsed.closingSequence == null) return;
          verifyATXHeadingClosingSequenceLength(parsed, node, expected);
        },
      };
    }
    if (option.mode === "fixed-line-length") {
      const totalLength = option.length || 80;
      return {
        heading(node: Heading) {
          const parsed = parseATXHeading(sourceCode, node);
          if (!parsed || parsed.closingSequence == null) return;
          verifyATXHeadingClosingSequenceLength(
            parsed,
            node,
            totalLength - getContentLength(parsed),
          );
        },
      };
    }
    if (option.mode === "consistent") {
      let expectedLength: number | null = null;
      return {
        heading(node: Heading) {
          const parsed = parseATXHeading(sourceCode, node);
          if (!parsed || parsed.closingSequence == null) return;
          if (expectedLength == null) {
            expectedLength = parsed.closingSequence.text.length;
          } else {
            verifyATXHeadingClosingSequenceLength(parsed, node, expectedLength);
          }
        },
      };
    }
    if (option.mode === "consistent-line-length") {
      type HeadingInfo = {
        node: Heading;
        parsed: ParsedATXHeadingWithClosingSequence;
      };
      const headings: HeadingInfo[] = [];
      return {
        heading(node: Heading) {
          const parsed = parseATXHeading(sourceCode, node);
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
          let minLineLength: number = mostLongContentHeading.lineLength;
          for (const heading of headings) {
            const lineLength = getLineLength(heading.parsed);
            if (
              mostLongContentHeading.contentLength < lineLength &&
              lineLength < minLineLength
            ) {
              minLineLength = Math.min(minLineLength, lineLength);
            }
          }
          for (const heading of headings) {
            verifyATXHeadingClosingSequenceLength(
              heading.parsed,
              heading.node,
              minLineLength - getContentLength(heading.parsed),
            );
          }
        },
      };
    }

    return {};

    /**
     * Get the content length of the heading.
     */
    function getContentLength(parsed: ParsedATXHeadingWithClosingSequence) {
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
    function getLineLength(parsed: ParsedATXHeadingWithClosingSequence) {
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
