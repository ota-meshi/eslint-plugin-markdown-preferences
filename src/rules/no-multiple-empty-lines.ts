import { createRule } from "../utils/index.ts";
import type { Code, Html, Yaml } from "mdast";
import type { Toml, Json } from "@eslint/markdown/types";
import type { ParsedLine } from "../utils/lines.ts";
import { getParsedLines } from "../utils/lines.ts";

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
        const lines = [...getParsedLines(sourceCode)];

        const bofEmptyLines: ParsedLine[] = [];
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
              return fixer.removeRange([first.range[0], last.range[1]]);
            },
          });
        }
        const eofEmptyLines: ParsedLine[] = [];
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
              return fixer.removeRange([first.range[0], last.range[1]]);
            },
          });
        }

        const emptyLines: ParsedLine[] = [];

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
                return fixer.removeRange([first.range[0], last.range[1]]);
              },
            });
          }
        }
      },
    };
  },
});
