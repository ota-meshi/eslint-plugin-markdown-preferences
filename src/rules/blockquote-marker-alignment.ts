import type { Blockquote, Root } from "../language/ast-types.ts";
import { createRule } from "../utils/index.ts";
import { getParsedLines } from "../utils/lines.ts";
import { getBlockquoteLevelFromLine } from "../utils/blockquotes.ts";
import { getWidth } from "../utils/width.ts";
import { isWhitespace } from "../utils/unicode.ts";

export default createRule("blockquote-marker-alignment", {
  meta: {
    type: "layout",
    docs: {
      description: "enforce consistent alignment of blockquote markers",
      categories: ["recommended", "standard"],
      listCategory: "Whitespace",
    },
    fixable: "whitespace",
    hasSuggestions: false,
    schema: [],
    messages: {
      inconsistentAlignment:
        "Blockquote markers should be consistently aligned at the same nesting level.",
    },
  },
  create(context) {
    const sourceCode = context.sourceCode;

    type BlockquoteStack = {
      node: Blockquote | Root;
      level: number;
      upper: BlockquoteStack;
      reported?: boolean;
    };
    let blockquoteStack: BlockquoteStack = {
      node: sourceCode.ast,
      level: 0,
      upper: null!,
    };
    return {
      blockquote(node: Blockquote) {
        blockquoteStack = {
          node,
          level: blockquoteStack.level + 1,
          upper: blockquoteStack,
          reported: blockquoteStack.reported,
        };
        if (blockquoteStack.reported) return;
        const blockquoteLevel = blockquoteStack.level;
        const loc = sourceCode.getLoc(node);
        const startLine = loc.start.line;
        const endLine = loc.end.line;

        // Get the base blockquote marker from the first line of this blockquote
        const base = getBlockquoteLevelFromLine(
          sourceCode,
          startLine,
        ).blockquoteMarkers.get(blockquoteLevel);
        if (!base) return;

        const baseBeforeMarker = sourceCode.lines[startLine - 1].slice(
          0,
          base.loc.start.column - 1,
        );
        const baseIndentWidth = getWidth(baseBeforeMarker);

        // Only process lines that are part of this blockquote
        for (
          let lineNumber = startLine + 1;
          lineNumber <= endLine;
          lineNumber++
        ) {
          const marker = getBlockquoteLevelFromLine(
            sourceCode,
            lineNumber,
          ).blockquoteMarkers.get(blockquoteLevel);

          if (!marker) continue;

          const indentWidth = getWidth(
            sourceCode.lines[lineNumber - 1].slice(
              0,
              marker.loc.start.column - 1,
            ),
          );

          if (baseIndentWidth === indentWidth) continue;

          blockquoteStack.reported = true;
          context.report({
            node,
            loc: marker.loc,
            messageId: "inconsistentAlignment",
            fix(fixer) {
              const lines = getParsedLines(sourceCode);
              const line = lines.get(lineNumber);
              if (indentWidth < baseIndentWidth) {
                const addSpaces = " ".repeat(baseIndentWidth - indentWidth);
                return fixer.insertTextBeforeRange(
                  [
                    line.range[0] + marker.loc.start.column - 1,
                    line.range[0] + marker.loc.start.column - 1,
                  ],
                  addSpaces,
                );
              }

              const beforeMarker = line.text.slice(
                0,
                marker.loc.start.column - 1,
              );

              let newBeforeMarker = beforeMarker;
              while (getWidth(newBeforeMarker) > baseIndentWidth) {
                const last = newBeforeMarker.at(-1);
                if (last && isWhitespace(last)) {
                  newBeforeMarker = newBeforeMarker.slice(0, -1);
                } else {
                  return null; // Cannot fix if there's no whitespace to remove
                }
              }
              if (getWidth(newBeforeMarker) < baseIndentWidth) {
                newBeforeMarker += " ".repeat(
                  baseIndentWidth - getWidth(newBeforeMarker),
                );
              }
              if (
                !baseBeforeMarker.includes(">") ||
                baseBeforeMarker === newBeforeMarker
              ) {
                return fixer.replaceTextRange(
                  [line.range[0], line.range[0] + marker.loc.start.column - 1],
                  newBeforeMarker,
                );
              }

              // Maybe includes a mismatched blockquote
              return null;
            },
          });
        }
      },
      "blockquote:exit"() {
        blockquoteStack = blockquoteStack.upper;
      },
    };
  },
});
