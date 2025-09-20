import { createRule } from "../utils/index.ts";
import { getThematicBreakMarker } from "../utils/ast.ts";
import type { ThematicBreak } from "../language/ast-types.ts";
import {
  createThematicBreakFromPattern,
  isValidThematicBreakPattern,
} from "../utils/thematic-break.ts";

export default createRule<[{ pattern?: string }?]>(
  "thematic-break-sequence-pattern",
  {
    meta: {
      type: "layout",
      docs: {
        description:
          "enforce consistent repeating patterns for thematic breaks (horizontal rules) in Markdown.",
        categories: ["standard"],
        listCategory: "Decorative",
      },
      fixable: "code",
      hasSuggestions: false,
      schema: [
        {
          type: "object",
          properties: {
            pattern: {
              anyOf: [
                {
                  type: "string",
                  minLength: 1,
                  pattern: "^\\-[\t \\-]*$",
                },
                {
                  type: "string",
                  minLength: 1,
                  pattern: "^\\*[\t *]*$",
                },
                {
                  type: "string",
                  minLength: 1,
                  pattern: "^_[\t _]*$",
                },
              ],
            },
          },
          required: ["pattern"],
          additionalProperties: false,
        },
      ],
      messages: {
        inconsistentPattern:
          "Thematic break does not match the preferred repeating pattern '{{pattern}}'.",
      },
    },
    create(context) {
      const option = context.options[0] || {};
      const pattern = option.pattern ?? "-";
      const sourceCode = context.sourceCode;

      const patterns = {
        "-": pattern.replaceAll(/[*_]/gu, "-"),
        "*": pattern.replaceAll(/[-_]/gu, "*"),
        _: pattern.replaceAll(/[*-]/gu, "_"),
      };

      return {
        thematicBreak(node: ThematicBreak) {
          const marker = getThematicBreakMarker(sourceCode, node);
          const patternForKind = patterns[marker.kind];
          if (isValidThematicBreakPattern(patternForKind, marker.text)) return;

          context.report({
            node,
            messageId: "inconsistentPattern",
            data: { pattern },
            fix(fixer) {
              const replacement = createThematicBreakFromPattern(
                patternForKind,
                marker.text.length,
              );
              if (!replacement) return null;
              return fixer.replaceText(node, replacement);
            },
          });
        },
      };
    },
  },
);
