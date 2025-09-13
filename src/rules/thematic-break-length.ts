import type { ThematicBreakMarker } from "../utils/ast.ts";
import { getThematicBreakMarker } from "../utils/ast.ts";
import { createRule } from "../utils/index.ts";
import type { ThematicBreak } from "mdast";
import {
  createThematicBreakFromPattern,
  isValidThematicBreakPattern,
} from "../utils/thematic-break.ts";

export default createRule<[{ length?: number }?]>("thematic-break-length", {
  meta: {
    type: "layout",
    docs: {
      description:
        "enforce consistent length for thematic breaks (horizontal rules) in Markdown.",
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
        },
        additionalProperties: false,
      },
    ],
    messages: {
      unexpected:
        "Thematic break should be {{expected}} characters, but found {{actual}}.",
    },
  },
  create(context) {
    const option = context.options[0] || {};
    const expectedLength = option.length ?? 3;
    const sourceCode = context.sourceCode;

    return {
      thematicBreak(node: ThematicBreak) {
        const marker = getThematicBreakMarker(sourceCode, node);
        if (marker.text.length === expectedLength) return;
        context.report({
          node,
          messageId: "unexpected",
          data: {
            expected: String(expectedLength),
            actual: String(marker.text.length),
          },
          fix(fixer) {
            const sequence = replacementSequence(marker);
            if (!sequence) {
              return null;
            }
            return fixer.replaceText(node, sequence);
          },
        });
      },
    };

    /**
     * Replace the sequence in the thematic break marker with the expected length.
     */
    function replacementSequence(marker: ThematicBreakMarker) {
      if (marker.hasSpaces) {
        // Infer sequence pattern
        const pattern = inferSequencePattern(marker.text);
        if (pattern) {
          return createThematicBreakFromPattern(pattern, expectedLength);
        }
        return null;
      }
      return marker.kind.repeat(expectedLength);
    }

    /**
     * Infer sequence pattern from the original string.
     */
    function inferSequencePattern(original: string) {
      for (let length = 2; length < original.length; length++) {
        const pattern = original.slice(0, length);
        if (isValidThematicBreakPattern(pattern, original)) {
          return pattern;
        }
      }
      return null;
    }
  },
});
