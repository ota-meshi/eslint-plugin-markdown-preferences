import type { Code } from "mdast";
import { getCodeBlockKind } from "../utils/ast.ts";
import { createRule } from "../utils/index.ts";
import { parseLines } from "../utils/lines.ts";

export default createRule("prefer-fenced-code-blocks", {
  meta: {
    type: "layout",
    docs: {
      description:
        "enforce the use of fenced code blocks over indented code blocks",
      categories: ["recommended"],
      listCategory: "Stylistic",
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

    const lines = parseLines(sourceCode);

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
              const parsedLine = lines.get(line);
              const currentPrefix = normalizePrefix(
                parsedLine.text.slice(0, startColumnOffset),
              );
              if (!prefixText) {
                prefixText = currentPrefix;
              } else if (currentPrefix !== prefixText) {
                return null; // Do not fix if the indentation is inconsistent
              }
              let removeRange: [number, number] = [
                parsedLine.range[0] + startColumnOffset,
                parsedLine.range[0] + startColumnOffset + 4,
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
            const beginFenceInsertOffset = lines.get(loc.start.line).range[0];
            const endFenceInsertOffset = lines.get(loc.end.line).range[1];
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
      const firstLine = lines.get(loc.start.line);

      const codeBlockFirstLine = normalizePrefix(node.value.split(/\r?\n/u)[0]);

      const startColumnOffset = loc.start.column - 1;
      const normalizedFirstLine = normalizePrefix(
        firstLine.text.slice(startColumnOffset),
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
