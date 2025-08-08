import { createRule } from "../utils/index.ts";
import type { Blockquote } from "mdast";
import type { ParsedLine } from "../utils/lines.ts";
import { parseLines } from "../utils/lines.ts";

type BlockquoteLineInfo = {
  prefix: string;
  level: number;
  line: ParsedLine;
};

/**
 * Helper function to get blockquote line information.
 */
function getBlockquoteLineInfo(line: ParsedLine): BlockquoteLineInfo {
  const regex = /^\s*(?:>\s*)*/u;
  const match = regex.exec(line.text)!;
  return {
    line,
    prefix: match[0],
    level: (match[0].match(/>/gu) || []).length,
  };
}

export default createRule("no-laziness-blockquotes", {
  meta: {
    type: "problem",
    docs: {
      description: "disallow laziness in blockquotes",
      categories: ["recommended"],
      listCategory: "Stylistic",
    },
    fixable: undefined,
    hasSuggestions: true,
    schema: [],
    messages: {
      lazyBlockquoteLine:
        "Expected {{level}} '>' marker(s), but found {{actualLevel}}. This line will be interpreted as part of level {{level}} blockquote.",
      addMarker: "Add {{missingMarkers}} '>' marker(s).",
      addLineBreak: "Add line break to separate from blockquote.",
    },
  },
  create(context) {
    const sourceCode = context.sourceCode;
    const checkedLines = new Set<number>();

    // Get all lines in the document
    const lines = parseLines(sourceCode);

    /**
     * Report invalid blockquote lines.
     */
    function reportInvalidLines(
      invalidLines: BlockquoteLineInfo[],
      base: BlockquoteLineInfo,
    ) {
      type InvalidGroup = {
        level: number;
        lines: BlockquoteLineInfo[];
      };
      const invalidGroups: InvalidGroup[] = [];
      for (const invalidLine of invalidLines) {
        const currentGroup = invalidGroups.at(-1);
        if (!currentGroup || currentGroup.level < invalidLine.level) {
          invalidGroups.push({
            level: invalidLine.level,
            lines: [invalidLine],
          });
          continue;
        }
        if (currentGroup.level === invalidLine.level) {
          currentGroup.lines.push(invalidLine);
          continue;
        }
        if (invalidLine.level < currentGroup.level) {
          break;
        }
      }
      for (const group of invalidGroups) {
        const first = group.lines[0];
        const last = group.lines.at(-1)!;
        context.report({
          loc: {
            start: {
              line: first.line.line,
              column: 1,
            },
            end: { line: last.line.line, column: last.line.text.length + 1 },
          },
          messageId: "lazyBlockquoteLine",
          data: {
            level: `${base.level}`,
            actualLevel: `${group.level}`,
          },
          suggest: [
            {
              messageId: "addMarker",
              data: {
                missingMarkers: `${base.level - group.level}`,
              },
              *fix(fixer) {
                for (const invalidLine of group.lines) {
                  yield fixer.replaceTextRange(
                    [
                      invalidLine.line.range[0],
                      invalidLine.line.range[0] + invalidLine.prefix.length,
                    ],
                    base.prefix,
                  );
                }
              },
            },
            {
              messageId: "addLineBreak",
              fix: (fixer) => {
                return fixer.insertTextBeforeRange(
                  [first.line.range[0], first.line.range[0]],
                  `${first.prefix.trimEnd()}\n`,
                );
              },
            },
          ],
        });
      }
    }

    return {
      "blockquote:exit"(node: Blockquote) {
        const loc = sourceCode.getLoc(node);
        const startLine = loc.start.line;
        const endLine = loc.end.line;

        // Get the base blockquote level from the first line of this blockquote
        const base = getBlockquoteLineInfo(lines.get(startLine));

        //
        const invalidLines: BlockquoteLineInfo[] = [];

        // Only process lines that are part of this blockquote
        for (
          let lineNumber = startLine + 1;
          lineNumber <= endLine;
          lineNumber++
        ) {
          // Skip if already checked by child blockquotes
          if (checkedLines.has(lineNumber)) {
            reportInvalidLines(invalidLines, base);
            invalidLines.length = 0; // Reset invalid lines
            continue;
          }
          checkedLines.add(lineNumber);

          const line = lines.get(lineNumber);

          const current = getBlockquoteLineInfo(line);

          if (base.level <= current.level) {
            reportInvalidLines(invalidLines, base);
            invalidLines.length = 0; // Reset invalid lines
            continue;
          }

          invalidLines.push(current);
        }
        reportInvalidLines(invalidLines, base);
      },
    };
  },
});
