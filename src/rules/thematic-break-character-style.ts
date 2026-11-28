import { createRule } from "../utils/index.ts";
import {
  getParent,
  getPrevSibling,
  getThematicBreakMarker,
} from "../utils/ast.ts";
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
                const sourceCode = context.sourceCode;
                const range = sourceCode.getRange(node);
                const text = sourceCode.getText(node);
                // Replace all marker characters with the preferred style
                const rep = text.replaceAll(marker.kind, style);
                if (
                  style === "-" &&
                  !marker.hasSpaces &&
                  isDirectlyAfterParagraph(sourceCode, node)
                ) {
                  if (getParent(sourceCode, node)?.type === "listItem") {
                    // A blank line inside a list item would make the list
                    // loose and change the rendered HTML, so the autofix
                    // cannot be applied.
                    return null;
                  }
                  // An unspaced `---` on the line directly after a
                  // paragraph is parsed as a setext heading underline, so
                  // insert a blank line before the break. The blank line
                  // uses the break line's own prefix (e.g. `>`), since the
                  // previous line may be a lazy continuation line without
                  // container markers.
                  const lineStartIndex = sourceCode.getIndexFromLoc({
                    line: sourceCode.getLoc(node).start.line,
                    column: 1,
                  });
                  const source = sourceCode.text;
                  let rangeStart = lineStartIndex;
                  if (source[rangeStart - 1] === "\n") rangeStart--;
                  if (source[rangeStart - 1] === "\r") rangeStart--;
                  const eol = source.slice(rangeStart, lineStartIndex) || "\n";
                  const prefix = source.slice(lineStartIndex, range[0]);
                  return fixer.replaceTextRange(
                    [rangeStart, range[1]],
                    `${eol}${prefix.replace(/[\t ]+$/u, "")}${eol}${prefix}${rep}`,
                  );
                }
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
