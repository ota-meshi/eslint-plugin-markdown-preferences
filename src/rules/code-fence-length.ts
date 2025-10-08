import type { Code } from "../language/ast-types.ts";
import type { ParsedFencedCodeBlock } from "../utils/fenced-code-block.ts";
import { parseFencedCodeBlock } from "../utils/fenced-code-block.ts";
import { createRule } from "../utils/index.ts";

type Options = {
  length?: number;
  fallbackLength?: number | "minimum" | "as-is";
  overrides?: {
    lang: string;
    length?: number;
    fallbackLength?: number | "minimum" | "as-is";
  }[];
};
export default createRule<[Options?]>("code-fence-length", {
  meta: {
    type: "layout",
    docs: {
      description:
        "enforce consistent code fence length in fenced code blocks.",
      categories: ["standard"],
      listCategory: "Decorative",
    },
    fixable: "code",
    hasSuggestions: false,
    schema: [
      {
        type: "object",
        properties: {
          length: { type: "integer", minimum: 3 },
          fallbackLength: {
            anyOf: [
              { type: "integer", minimum: 3 },
              { enum: ["minimum", "as-is"] },
            ],
          },
          overrides: {
            type: "array",
            items: {
              type: "object",
              properties: {
                lang: { type: "string" },
                length: { type: "integer", minimum: 3 },
                fallbackLength: {
                  anyOf: [
                    { type: "integer", minimum: 3 },
                    { enum: ["minimum", "as-is"] },
                  ],
                },
              },
              required: ["lang"],
              additionalProperties: false,
            },
          },
        },
        additionalProperties: false,
      },
    ],
    messages: {
      notMatch: "The opening and closing code fence lengths must match.",
      notPreferred:
        "Code fence length should be {{expected}} (was {{actual}}).",
    },
  },
  create(context) {
    const sourceCode = context.sourceCode;
    const options: Options = context.options[0] ?? {};

    /**
     * Get the effective options for the given code block node.
     */
    function getOptionForCode(node: Code): {
      length: number;
      fallbackLength: number | "minimum" | "as-is";
    } {
      const override = options.overrides
        ? [...options.overrides].reverse().find((o) => o.lang === node.lang)
        : null;
      return {
        length: override?.length ?? options.length ?? 3,
        fallbackLength:
          override?.fallbackLength ?? options.fallbackLength ?? "minimum",
      };
    }

    /**
     * Report the given code block node for not preferred length.
     */
    function reportNotPreferred(
      node: Code,
      parsed: ParsedFencedCodeBlock,
      length: number,
    ) {
      const expectedFence = getExpectedFence(parsed, length);
      context.report({
        node,
        loc: {
          start: sourceCode.getLocFromIndex(parsed.openingFence.range[0]),
          end: sourceCode.getLocFromIndex(parsed.openingFence.range[1]),
        },
        data: {
          expected: expectedFence,
          actual: parsed.openingFence.text,
        },
        messageId: "notPreferred",
        *fix(fixer) {
          yield fixer.replaceTextRange(
            parsed.openingFence.range,
            expectedFence,
          );
          if (parsed.closingFence) {
            yield fixer.replaceTextRange(
              parsed.closingFence.range,
              expectedFence,
            );
          }
        },
      });
    }

    /**
     * Verify the length of the given code block node.
     */
    function verifyFenceLength(
      node: Code,
      parsed: ParsedFencedCodeBlock,
    ): boolean {
      const { length, fallbackLength } = getOptionForCode(node);

      if (parsed.openingFence.text.length === length) return true;

      const expectedFence = getExpectedFence(parsed, length);
      if (!node.value.includes(expectedFence)) {
        reportNotPreferred(node, parsed, length);
        return false;
      }
      if (fallbackLength === "as-is") {
        // Do not report if the expected fence exists in the code block
        return true;
      }
      if (fallbackLength === "minimum") {
        let fallback = length + 1;
        while (node.value.includes(getExpectedFence(parsed, fallback))) {
          fallback++;
        }
        if (parsed.openingFence.text.length === fallback) return true;
        reportNotPreferred(node, parsed, fallback);
        return false;
      }
      if (fallbackLength <= length) {
        return true; // No valid fallback
      }
      if (parsed.openingFence.text.length === fallbackLength) return true;
      const fallbackExpectedFence = getExpectedFence(parsed, fallbackLength);
      if (node.value.includes(fallbackExpectedFence)) return true;
      reportNotPreferred(node, parsed, fallbackLength);
      return false;
    }

    /**
     * Get the expected fence string for the given length.
     */
    function getExpectedFence(parsed: ParsedFencedCodeBlock, length: number) {
      const fenceChar = parsed.openingFence.text[0];
      return fenceChar.repeat(Math.max(3, length));
    }

    /**
     * Verify that the opening and closing fence lengths match.
     */
    function verifyClosingFenceLength(
      node: Code,
      { openingFence, closingFence }: ParsedFencedCodeBlock,
    ): boolean {
      if (
        !closingFence ||
        openingFence.text.length === closingFence.text.length
      )
        return true;

      context.report({
        node,
        loc: {
          start: sourceCode.getLocFromIndex(closingFence.range[0]),
          end: sourceCode.getLocFromIndex(closingFence.range[1]),
        },
        messageId: "notMatch",
        fix(fixer) {
          return [
            fixer.replaceTextRange(closingFence.range, openingFence.text),
          ];
        },
      });
      return false;
    }

    return {
      code(node) {
        const parsed = parseFencedCodeBlock(sourceCode, node);
        if (!parsed) return; // Skip if not an indented code block

        if (!verifyFenceLength(node, parsed)) return;

        verifyClosingFenceLength(node, parsed);
      },
    };
  },
});
