import type { Code } from "../language/ast-types.ts";
import { createRule } from "../utils/index.ts";
import { parseFencedCodeBlock } from "../utils/fenced-code-block.ts";
import { getCodeBlockKind } from "../utils/ast.ts";
import { getWidth } from "../utils/width.ts";
import { isWhitespace } from "../utils/unicode.ts";

interface CodeBlockInfo {
  ignore: false | "check" | "fix";
  contentRange: [number, number];
  indentWidth: number;
}

type UserOptions = {
  checkTarget?: "all" | "indentation" | "non-indentation";
  ignoreCodeBlocks?: string[];
  codeBlockTabWidth?: number;
};

/**
 * Parse options
 */
function parseOptions(options: UserOptions | undefined) {
  const checkTarget = options?.checkTarget || "all";
  const checkTargets =
    checkTarget === "all" ? ["indentation", "non-indentation"] : [checkTarget];
  const ignoreCodeBlocks: string[] = options?.ignoreCodeBlocks || [];
  const codeBlockTabWidth: number = options?.codeBlockTabWidth ?? 4;
  return { ignoreCodeBlocks, checkTargets, codeBlockTabWidth };
}

export default createRule<[UserOptions?]>("no-tabs", {
  meta: {
    type: "layout",
    docs: {
      description: "Disallow tab characters in Markdown files.",
      categories: ["standard"],
      listCategory: "Whitespace",
    },
    fixable: "whitespace",
    hasSuggestions: false,
    schema: [
      {
        type: "object",
        properties: {
          checkTarget: {
            type: "string",
            enum: ["all", "indentation", "non-indentation"],
            default: "all",
          },
          ignoreCodeBlocks: {
            type: "array",
            items: {
              type: "string",
            },
            default: [],
          },
          codeBlockTabWidth: {
            type: "integer",
            minimum: 1,
            default: 4,
          },
        },
        additionalProperties: false,
      },
    ],
    messages: {
      unexpectedTab: "Unexpected tab character.",
    },
  },
  create(context) {
    const sourceCode = context.sourceCode;
    const { ignoreCodeBlocks, checkTargets, codeBlockTabWidth } = parseOptions(
      context.options[0],
    );

    const codeBlocks: CodeBlockInfo[] = [];

    /** Check if a language should be ignored based on ignoreCodeBlocks option */
    function shouldIgnoreLanguage(language: string | null): boolean {
      if (ignoreCodeBlocks.length === 0) return false;
      if (ignoreCodeBlocks.includes("*")) return true;
      return language !== null && ignoreCodeBlocks.includes(language);
    }

    /**
     * Check if the given index is at indentation (beginning of line)
     */
    function isAtIndentation(index: number): boolean {
      const loc = sourceCode.getLocFromIndex(index);
      const text = sourceCode.lines[loc.line - 1].slice(0, loc.column - 1);
      return !text || isWhitespace(text);
    }

    /**
     * Find the code block containing the given index
     */
    function findCodeBlock(index: number): CodeBlockInfo | null {
      const codeBlock = codeBlocks.find(
        (block) =>
          index >= block.contentRange[0] && index < block.contentRange[1],
      );
      if (!codeBlock) return null;
      const loc = sourceCode.getLocFromIndex(index);
      const indentWidth = getWidth(
        sourceCode.lines[loc.line - 1].slice(0, loc.column - 1),
      );
      if (indentWidth < codeBlock.indentWidth) {
        // The tab is before the code block's indentation
        return null;
      }
      return codeBlock;
    }

    /**
     * Calculate the number of spaces to replace a tab.
     * Handles both regular tabs and tabs within code block content.
     */
    function calculateReplacementSpaces(
      tabIndex: number,
      codeBlock: CodeBlockInfo | null,
    ): number {
      const loc = sourceCode.getLocFromIndex(tabIndex);
      const lineText = sourceCode.lines[loc.line - 1];
      const beforeText = lineText.slice(0, loc.column - 1);

      if (!codeBlock || codeBlockTabWidth === 4) {
        return 4 - (getWidth(beforeText) % 4);
      }

      let tabStop = codeBlock.indentWidth <= 0 ? codeBlockTabWidth : 4;

      let beforeWidth = 0;
      for (const c of beforeText) {
        if (c === "\t") {
          beforeWidth += tabStop - (beforeWidth % tabStop);
        } else {
          beforeWidth++;
        }
        if (tabStop === 4 && codeBlock.indentWidth <= beforeWidth) {
          tabStop = codeBlockTabWidth;
        }
      }
      return tabStop - (beforeWidth % tabStop);
    }

    return {
      code(node: Code) {
        const range = sourceCode.getRange(node);
        const loc = sourceCode.getLoc(node);
        const codeBlockStartLineText = sourceCode.lines[loc.start.line - 1];
        const codeBlockIndentText = codeBlockStartLineText.slice(
          0,
          loc.start.column - 1,
        );

        if (getCodeBlockKind(sourceCode, node) === "indented") {
          // Indented code block
          const baseWidth = getWidth(codeBlockIndentText);
          let indentText: string;
          let indentColumnIndex = loc.start.column;
          while (
            getWidth(
              (indentText = codeBlockStartLineText.slice(0, indentColumnIndex)),
            ) <
            baseWidth + 4
          ) {
            indentColumnIndex++;
          }
          codeBlocks.push({
            contentRange: [range[0] + 1, range[1]],
            indentWidth: getWidth(indentText),
            ignore:
              // Skip only if ignoreCodeBlocks contains '*'.
              shouldIgnoreLanguage(null)
                ? "check"
                : // If the indentation contains tabs, the correct indentation of the content cannot be calculated,
                  // so the auto-fix is skipped.
                  indentText.includes("\t")
                  ? "fix"
                  : false,
          });
          return;
        }

        const parsed = parseFencedCodeBlock(sourceCode, node);

        if (!parsed) {
          // Fallback for unknown fenced code blocks
          codeBlocks.push({
            contentRange: range,
            indentWidth: getWidth(codeBlockIndentText),
            ignore: "check", // Ignore unparseable fenced code blocks
          });
          return;
        }

        codeBlocks.push({
          contentRange: [
            (parsed.meta ?? parsed.language ?? parsed.openingFence).range[1],
            parsed.closingFence?.range[0] ?? range[1],
          ],
          indentWidth: getWidth(codeBlockIndentText),
          ignore: shouldIgnoreLanguage(node.lang?.toLowerCase() ?? null)
            ? "check"
            : false,
        });
      },

      "root:exit"() {
        for (let i = 0; i < sourceCode.text.length; i++) {
          if (sourceCode.text[i] !== "\t") continue;

          // Check based on checkTarget option
          if (isAtIndentation(i)) {
            if (!checkTargets.includes("indentation")) continue;
          } else if (!checkTargets.includes("non-indentation")) continue;

          const codeBlock = findCodeBlock(i);
          if (codeBlock?.ignore === "check") continue;

          context.report({
            loc: {
              start: sourceCode.getLocFromIndex(i),
              end: sourceCode.getLocFromIndex(i + 1),
            },
            messageId: "unexpectedTab",
            fix: (fixer) => {
              if (codeBlock?.ignore === "fix") return null;
              const spaces = calculateReplacementSpaces(i, codeBlock);
              return fixer.replaceTextRange([i, i + 1], " ".repeat(spaces));
            },
          });
        }
      },
    };
  },
});
