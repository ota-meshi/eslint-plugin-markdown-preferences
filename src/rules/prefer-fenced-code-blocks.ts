import type { Code } from "../language/ast-types.ts";
import { getCodeBlockKind } from "../utils/ast.ts";
import { createRule } from "../utils/index.ts";

export default createRule("prefer-fenced-code-blocks", {
  meta: {
    type: "layout",
    docs: {
      description:
        "enforce the use of fenced code blocks over indented code blocks",
      categories: ["recommended", "standard"],
      listCategory: "Notation",
    },
    fixable: "code",
    hasSuggestions: false,
    schema: [],
    messages: {
      useFencedCodeBlock:
        "Use a fenced code block instead of an indented code block.",
    },
  },
  create(context) {
    const sourceCode = context.sourceCode;

    return {
      code(node) {
        const kind = getCodeBlockKind(sourceCode, node);
        if (kind === "backtick-fenced" || kind === "tilde-fenced") return; // Skip if not an indented code block

        const loc = sourceCode.getLoc(node);
        context.report({
          node,
          messageId: "useFencedCodeBlock",
          fix(fixer) {
            if (!isFixableIndentedCodeBlock(node)) {
              // Do not fix if the code block is not fixable
              return null;
            }
            const startColumnOffset = loc.start.column - 1;
            const removeRanges: [number, number][] = [];
            let prefixText: string | null = null;
            for (let line = loc.start.line; line <= loc.end.line; line++) {
              const lineText = sourceCode.lines[line - 1];
              const currentPrefix = normalizePrefix(
                lineText.slice(0, startColumnOffset),
              );
              if (!prefixText) {
                prefixText = currentPrefix;
              } else if (currentPrefix !== prefixText) {
                return null; // Do not fix if the indentation is inconsistent
              }
              const lineStartIndex = sourceCode.getIndexFromLoc({
                line,
                column: 1,
              });
              let removeRange: [number, number] = [
                lineStartIndex + startColumnOffset,
                lineStartIndex + startColumnOffset + 4,
              ];
              for (
                let index = removeRange[0];
                index < removeRange[1];
                index++
              ) {
                const c = sourceCode.text[index];
                if (c === " ") continue;
                if (c === "\t") {
                  removeRange = [removeRange[0], index + 1];
                  break;
                }
                return null; // Do not fix if unexpected character is included
              }
              removeRanges.push(removeRange);
            }
            const beginFenceInsertOffset = sourceCode.getIndexFromLoc({
              line: loc.start.line,
              column: 1,
            });

            const endFenceInsertOffset =
              sourceCode.lines.length > loc.end.line
                ? sourceCode.getIndexFromLoc({
                    line: loc.end.line + 1,
                    column: 1,
                  })
                : sourceCode.text.length;

            return [
              fixer.insertTextBeforeRange(
                [beginFenceInsertOffset, beginFenceInsertOffset],
                `${prefixText}\`\`\`\n`,
              ),
              ...removeRanges.map((removeRange) =>
                fixer.removeRange(removeRange),
              ),
              fixer.insertTextAfterRange(
                [endFenceInsertOffset, endFenceInsertOffset],
                `${prefixText}\`\`\`\n`,
              ),
            ];
          },
        });
      },
    };

    /**
     * Determines whether the given indented code block is fixable or not.
     */
    function isFixableIndentedCodeBlock(node: Code): boolean {
      if (!node.value.startsWith(" ")) return true;
      const loc = sourceCode.getLoc(node);
      const firstLineText = sourceCode.lines[loc.start.line - 1];

      const codeBlockFirstLine = normalizePrefix(node.value.split(/\r?\n/u)[0]);

      const startColumnOffset = loc.start.column - 1;
      const normalizedFirstLine = normalizePrefix(
        firstLineText.slice(startColumnOffset),
      );

      // Maybe it is included in tab and the indent is ambiguous.
      return normalizedFirstLine.startsWith(codeBlockFirstLine);
    }
  },
});

/**
 * Normalize the prefix by removing tabs and replacing them with spaces.
 */
function normalizePrefix(prefix: string): string {
  let result = "";
  for (const c of prefix) {
    if (c !== "\t") {
      result += c;
    } else {
      // Replaced by spaces with a tab stop of 4 characters
      result += " ".repeat(4 - (result.length % 4));
    }
  }
  return result;
}
