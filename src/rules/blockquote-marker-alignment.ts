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

          if (base.loc.start.column === marker.loc.start.column) continue;

          blockquoteStack.reported = true;
          context.report({
            node,
            loc: marker.loc,
            messageId: "inconsistentAlignment",
            fix(fixer) {
              const lines = getParsedLines(sourceCode);
              const line = lines.get(lineNumber);
              if (marker.loc.start.column < base.loc.start.column) {
                const addSpaces = " ".repeat(
                  base.loc.start.column - marker.loc.start.column,
                );
                return fixer.insertTextBeforeRange(
                  [
                    line.range[0] + marker.loc.start.column - 1,
                    line.range[0] + marker.loc.start.column - 1,
                  ],
                  addSpaces,
                );
              }
              if (blockquoteLevel === 1) {
                const expectedSpaces = " ".repeat(base.loc.start.column - 1);
                return fixer.replaceTextRange(
                  [line.range[0], line.range[0] + marker.loc.start.column - 1],
                  expectedSpaces,
                );
              }
              const itemBefore = line.text.slice(
                0,
                line.range[0] + marker.loc.start.column - 1,
              );
              if (itemBefore.includes("\t")) return null; // Ignore tab

              let removeStartIndex = marker.loc.start.column - 1;
              for (
                ;
                removeStartIndex > base.loc.start.column - 1;
                removeStartIndex--
              ) {
                if (line.text[removeStartIndex - 1] !== " ") break;
              }
              return fixer.removeRange([
                line.range[0] + removeStartIndex,
                line.range[0] + marker.loc.start.column - 1,
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
