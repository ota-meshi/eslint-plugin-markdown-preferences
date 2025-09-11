import type { Blockquote, Heading, Root } from "mdast";
import { createRule } from "../utils/index.ts";
import type { BlockquoteMarkerInfo } from "../utils/blockquotes.ts";
import { getBlockquoteLevelFromLine } from "../utils/blockquotes.ts";
import { getParsedLines } from "../utils/lines.ts";

export default createRule("indent", {
  meta: {
    type: "layout",
    docs: {
      description: "enforce consistent indentation in Markdown files",
      categories: ["standard"],
      listCategory: "Stylistic",
    },
    fixable: "whitespace",
    hasSuggestions: false,
    schema: [],
    messages: {
      topLevelHeadingIndentation: "Top-level headings should not be indented.",
    },
  },
  create(context) {
    const sourceCode = context.sourceCode;

    type BlockquoteStack = {
      marker: BlockquoteMarkerInfo | null;
      node: Blockquote | Root;
      level: number;
      upper: BlockquoteStack;
    };
    let blockquoteStack: BlockquoteStack = {
      marker: null,
      node: sourceCode.ast,
      level: 0,
      upper: null!,
    };
    return {
      heading: verifyHeading,
      blockquote(node: Blockquote) {
        const loc = sourceCode.getLoc(node);
        const blockquoteLevel = blockquoteStack.level + 1;
        const blockquoteLevelInfo = getBlockquoteLevelFromLine(
          sourceCode,
          loc.start.line,
        );
        const marker =
          blockquoteLevelInfo.blockquoteMarkers.get(blockquoteLevel) ?? null;
        blockquoteStack = {
          marker,
          node,
          level: blockquoteLevel,
          upper: blockquoteStack,
        };
      },
      "blockquote:exit"() {
        blockquoteStack = blockquoteStack.upper;
      },
    };

    /**
     * Verify a heading node.
     */
    function verifyHeading(node: Heading) {
      const loc = sourceCode.getLoc(node);
      if (blockquoteStack.level === 0) {
        if (loc.start.column > 1) {
          context.report({
            node,
            messageId: "topLevelHeadingIndentation",
            loc: {
              start: { line: loc.start.line, column: 1 },
              end: { line: loc.start.line, column: loc.start.column },
            },
            fix(fixer) {
              const line = getParsedLines(sourceCode).get(loc.start.line);
              if (!line) return null;
              return fixer.replaceTextRange(
                [line.range[0], line.range[0] + loc.start.column - 1],
                "",
              );
            },
          });
        }
      } else {
        const marker = blockquoteStack.marker;
        if (!marker) return;
        const expectedColumn = marker.range[1] + 1;
        // if (loc.start.column !== expectedColumn) {
        //   const line = getParsedLines(sourceCode).get(loc.start.line);
      }
    }
  },
});
