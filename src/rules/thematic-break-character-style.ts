import { createRule } from "../utils/index.ts";
import { getPrevSibling, getThematicBreakMarker } from "../utils/ast.ts";
import type { ThematicBreak } from "../language/ast-types.ts";
import type { ExtendedMarkdownSourceCode } from "../language/extended-markdown-language.ts";

export default createRule<[{ style?: "-" | "*" | "_" }?]>(
  "thematic-break-character-style",
  {
    meta: {
      type: "layout",
      languages: ["markdown/*", "markdown-preferences/*"],
      docs: {
        description:
          "enforce consistent character style for thematic breaks (horizontal rules) in Markdown.",
        categories: ["standard"],
        listCategory: "Notation",
      },
      fixable: "code",
      hasSuggestions: false,
      schema: [
        {
          type: "object",
          properties: {
            style: {
              type: "string",
              enum: ["-", "*", "_"],
            },
          },
          additionalProperties: false,
        },
      ],
      messages: {
        unexpected:
          "Thematic break should use '{{expected}}' but found '{{actual}}'.",
      },
    },
    create(context) {
      // Get rule option
      const option = context.options[0];
      const style = option?.style || "-";

      return {
        thematicBreak(node) {
          const marker = getThematicBreakMarker(context.sourceCode, node);
          if (marker.kind !== style) {
            context.report({
              node,
              messageId: "unexpected",
              data: {
                expected: style,
                actual: marker.kind,
              },
              fix(fixer) {
                if (
                  style === "-" &&
                  isDirectlyAfterParagraph(context.sourceCode, node)
                ) {
                  // A `---` line right after a paragraph is parsed as a
                  // setext heading underline instead of a thematic break,
                  // so the autofix cannot be applied.
                  return null;
                }
                const range = context.sourceCode.getRange(node);
                const text = context.sourceCode.getText(node);
                // Replace all marker characters with the preferred style
                const rep = text.replaceAll(marker.kind, style);
                return fixer.replaceTextRange(range, rep);
              },
            });
          }
        },
      };
    },
  },
);

/**
 * Check whether the thematic break starts on the line directly after the end of a paragraph.
 */
function isDirectlyAfterParagraph(
  sourceCode: ExtendedMarkdownSourceCode,
  node: ThematicBreak,
): boolean {
  const prev = getPrevSibling(sourceCode, node);
  if (!prev || prev.type !== "paragraph") return false;
  return (
    sourceCode.getLoc(prev).end.line === sourceCode.getLoc(node).start.line - 1
  );
}
