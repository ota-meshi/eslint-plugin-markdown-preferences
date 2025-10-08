import { createRule } from "../utils/index.ts";
import type { Code, Html, Yaml } from "../language/ast-types.ts";
import type { Toml, Json } from "@eslint/markdown/types";

export default createRule("no-multiple-empty-lines", {
  meta: {
    type: "layout",
    docs: {
      description: "disallow multiple empty lines in Markdown files.",
      categories: ["standard"],
      listCategory: "Whitespace",
    },
    fixable: "whitespace",
    hasSuggestions: false,
    schema: [
      {
        type: "object",
        properties: {
          max: {
            type: "integer",
            minimum: 0,
            default: 1,
          },
          maxEOF: {
            type: "integer",
            minimum: 0,
            default: 0,
          },
          maxBOF: {
            type: "integer",
            minimum: 0,
            default: 0,
          },
        },
        additionalProperties: false,
      },
    ],
    messages: {
      blankBeginningOfFile:
        "Too many blank lines at the beginning of file. Max of {{max}} allowed.",
      blankEndOfFile:
        "Too many blank lines at the end of file. Max of {{max}} allowed.",
      consecutiveBlank:
        "More than {{max}} blank {{pluralizedLines}} not allowed.",
    },
  },
  create(context) {
    const sourceCode = context.sourceCode;
    const option = context.options[0] || {};
    const max = typeof option.max === "number" ? option.max : 1;
    const maxEOF = typeof option.maxEOF === "number" ? option.maxEOF : 0;
    const maxBOF = typeof option.maxBOF === "number" ? option.maxBOF : 0;
    const ignoreLocs: { startLine: number; endLine: number }[] = [];

    /**
     * Register the range of nodes to ignore (code, html, yaml, toml, json)
     * @param node mdast node
     */
    function addIgnoreLoc(node: Code | Html | Yaml | Toml | Json) {
      const loc = sourceCode.getLoc(node);
      ignoreLocs.push({
        startLine: loc.start.line,
        endLine: loc.end.line,
      });
    }

    return {
      code: addIgnoreLoc,
      html: addIgnoreLoc,
      yaml: addIgnoreLoc,
      toml: addIgnoreLoc,
      json: addIgnoreLoc,

      "root:exit"() {
        const lines = sourceCode.lines.map((text, index) => ({
          line: index + 1,
          text,
        }));

        if (lines.at(-1)?.text === "") {
          // Remove the last empty line to avoid reporting it as EOF empty line
          lines.pop();
        }

        const bofEmptyLines: {
          line: number;
          text: string;
        }[] = [];
        while (lines.length) {
          if (lines[0].text.trim()) break;
          bofEmptyLines.push(lines.shift()!);
        }
        const invalidBOFEmptyLines = bofEmptyLines.slice(maxBOF);
        if (invalidBOFEmptyLines.length > 0) {
          const first = invalidBOFEmptyLines[0];
          const last = invalidBOFEmptyLines[invalidBOFEmptyLines.length - 1];
          context.report({
            loc: {
              start: { line: first.line, column: 1 },
              end: { line: last.line, column: last.text.length + 1 },
            },
            messageId: "blankBeginningOfFile",
            data: { max: maxBOF },
            fix(fixer) {
              return fixer.removeRange(
                getRangeFromLines(first.line, last.line),
              );
            },
          });
        }
        const eofEmptyLines: {
          line: number;
          text: string;
        }[] = [];
        while (lines.length) {
          if (lines[lines.length - 1].text.trim()) break;
          eofEmptyLines.unshift(lines.pop()!);
        }
        const invalidEOFEmptyLines = eofEmptyLines.slice(maxEOF);
        if (invalidEOFEmptyLines.length > 0) {
          const first = invalidEOFEmptyLines[0];
          const last = invalidEOFEmptyLines[invalidEOFEmptyLines.length - 1];
          context.report({
            loc: {
              start: { line: first.line, column: 1 },
              end: { line: last.line, column: last.text.length + 1 },
            },
            messageId: "blankEndOfFile",
            data: { max: maxEOF },
            fix(fixer) {
              return fixer.removeRange(
                getRangeFromLines(first.line, last.line),
              );
            },
          });
        }

        const emptyLines: {
          line: number;
          text: string;
        }[] = [];

        for (const lineInfo of lines) {
          if (
            !lineInfo.text.trim() &&
            !ignoreLocs.some(({ startLine, endLine }) => {
              return lineInfo.line > startLine && lineInfo.line < endLine;
            })
          ) {
            emptyLines.push(lineInfo);
            continue;
          }

          const invalidEmptyLines = emptyLines.slice(max);
          emptyLines.length = 0; // Reset the empty lines
          if (invalidEmptyLines.length) {
            const first = invalidEmptyLines[0];
            const last = invalidEmptyLines[invalidEmptyLines.length - 1];
            context.report({
              loc: {
                start: { line: first.line, column: 1 },
                end: { line: last.line, column: last.text.length + 1 },
              },
              messageId: "consecutiveBlank",
              data: {
                max,
                pluralizedLines: max === 1 ? "line" : "lines",
              },
              fix(fixer) {
                return fixer.removeRange(
                  getRangeFromLines(first.line, last.line),
                );
              },
            });
          }
        }
      },
    };

    /**
     * Get the range from the given line numbers (1-based)
     */
    function getRangeFromLines(
      firstLine: number,
      lastLine: number,
    ): [number, number] {
      return [
        sourceCode.getIndexFromLoc({ line: firstLine, column: 1 }),
        sourceCode.lines.length > lastLine
          ? sourceCode.getIndexFromLoc({
              line: lastLine + 1,
              column: 1,
            })
          : sourceCode.text.length,
      ];
    }
  },
});
