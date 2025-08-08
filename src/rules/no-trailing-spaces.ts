import type { SourceLocation } from "@eslint/core";
import { createRule } from "../utils/index.ts";
import type { Break, Code, Html, InlineCode, Text, Yaml } from "mdast";
import type { Json, Toml } from "@eslint/markdown/types";
import { parseLines } from "../utils/lines.ts";

const htmlComment = /<!--.*?-->/su;

export default createRule("no-trailing-spaces", {
  meta: {
    type: "layout",
    docs: {
      description:
        "disallow trailing whitespace at the end of lines in Markdown files.",
      categories: [],
      listCategory: "Stylistic",
    },
    fixable: "whitespace",
    hasSuggestions: false,
    schema: [
      {
        type: "object",
        properties: {
          skipBlankLines: {
            type: "boolean",
            default: false,
          },
          ignoreComments: {
            type: "boolean",
            default: false,
          },
        },
        additionalProperties: false,
      },
    ],
    messages: {
      trailingSpace: "Trailing spaces not allowed.",
    },
  },
  create(context) {
    const sourceCode = context.sourceCode;

    const options = context.options[0] || {};
    const skipBlankLines = options.skipBlankLines || false;
    const ignoreComments = options.ignoreComments || false;

    type IgnoreNode = Break | Code | Text | InlineCode | Yaml | Toml | Json;
    const comments: Html[] = [];
    const ignoreNodes: IgnoreNode[] = [];

    /**
     * Report the error message
     * @param node node to report
     * @param location range information
     * @param fixRange Range based on the whole program
     * @returns {void}
     */
    function report(location: SourceLocation, fixRange: [number, number]) {
      // Passing node is a bit dirty, because message data will contain big
      // text in `source`. But... who cares :) ?
      // One more kludge will not make worse the bloody wizardry of this
      // plugin.
      context.report({
        loc: location,
        messageId: "trailingSpace",
        fix(fixer) {
          return fixer.removeRange(fixRange);
        },
      });
    }

    /**
     * Given a list of comment nodes, return the line numbers for those comments.
     * @returns {Set<number>} A set of line numbers containing comments.
     */
    function getCommentLineNumbers() {
      const lines = new Set();

      comments.forEach((comment) => {
        const loc = sourceCode.getLoc(comment);
        const endLine = loc.end.line - 1;

        for (let i = loc.start.line; i <= endLine; i++) {
          lines.add(i);
        }
      });

      return lines;
    }

    return {
      html(node) {
        if (htmlComment.test(node.value)) {
          comments.push(node);
        }
      },
      "break, code, inlineCode, text, yaml, toml, json"(node: IgnoreNode) {
        ignoreNodes.push(node);
      },
      "root:exit"() {
        const re = /[^\S\n\r]+$/u;
        const skipMatch = /^[^\S\n\r]*$/u;
        const lines = parseLines(sourceCode);
        const commentLineNumbers = getCommentLineNumbers();

        for (const lineInfo of lines) {
          const matches = re.exec(lineInfo.text);

          if (!matches) {
            continue;
          }
          const location = {
            start: {
              line: lineInfo.line,
              column: matches.index + 1,
            },
            end: {
              line: lineInfo.line,
              column: matches.index + 1 + matches[0].length,
            },
          };

          const range: [number, number] = [
            lineInfo.range[0] + location.start.column - 1,
            lineInfo.range[0] + location.end.column - 1,
          ];

          if (
            ignoreNodes.some((node) => {
              const nodeRange = sourceCode.getRange(node);
              return nodeRange[0] <= range[0] && range[1] <= nodeRange[1];
            })
          ) {
            continue;
          }

          // If the line has only whitespace, and skipBlankLines
          // is true, don't report it
          if (skipBlankLines && skipMatch.test(lineInfo.text)) {
            continue;
          }

          if (!ignoreComments || !commentLineNumbers.has(lineInfo.line)) {
            report(location, range);
          }
        }
      },
    };
  },
});
