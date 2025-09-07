import type { Blockquote, Root } from "mdast";
import { createRule } from "../utils/index.ts";
import { getParsedLines } from "../utils/lines.ts";
import { getBlockquoteLevelFromLine } from "../utils/blockquotes.ts";

export default createRule("blockquote-marker-alignment", {
  meta: {
    type: "layout",
    docs: {
      description: "enforce consistent alignment of blockquote markers",
      categories: ["recommended", "standard"],
      listCategory: "Stylistic",
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

          if (base.index === marker.index) continue;

          blockquoteStack.reported = true;
          context.report({
            node,
            loc: {
              start: {
                line: lineNumber,
                column: marker.index + 1,
              },
              end: {
                line: lineNumber,
                column: marker.index + 2,
              },
            },
            messageId: "inconsistentAlignment",
            fix(fixer) {
              const lines = getParsedLines(sourceCode);
              const line = lines.get(lineNumber);
              if (marker.index < base.index) {
                const addSpaces = " ".repeat(base.index - marker.index);
                return fixer.insertTextBeforeRange(
                  [line.range[0] + marker.index, line.range[0] + marker.index],
                  addSpaces,
                );
              }
              if (blockquoteLevel === 1) {
                const expectedSpaces = " ".repeat(base.index);
                return fixer.replaceTextRange(
                  [line.range[0], line.range[0] + marker.index],
                  expectedSpaces,
                );
              }
              const itemBefore = line.text.slice(
                0,
                line.range[0] + marker.index,
              );
              if (itemBefore.includes("\t")) return null; // Ignore tab

              let removeStartIndex = marker.index;
              for (; removeStartIndex > base.index; removeStartIndex--) {
                if (line.text[removeStartIndex - 1] !== " ") break;
              }
              return fixer.removeRange([
                line.range[0] + removeStartIndex,
                line.range[0] + marker.index,
              ]);
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
