import type { SourceLocation } from "@eslint/core";
import { createRule } from "../utils/index.js";
import type { Break, Code, Html, InlineCode, Text, Yaml } from "mdast";
import type { Json, Toml } from "@eslint/markdown/types";

const htmlComment = /<!--.*?-->/su;

export default createRule("no-trailing-spaces", {
  meta: {
    type: "layout",
    docs: {
      description:
        "disallow trailing whitespace at the end of lines in Markdown files.",
      categories: [],
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
        const lines = sourceCode.lines;
        const linebreaks = sourceCode.text.match(/\r?\n/gu);
        const commentLineNumbers = getCommentLineNumbers();

        let totalLength = 0;

        for (let i = 0, ii = lines.length; i < ii; i++) {
          const lineNumber = i + 1;

          // Always add linebreak length to line length to accommodate for line break (\n or \r\n)
          // Because during the fix time they also reserve one spot in the array.
          // Usually linebreak length is 2 for \r\n (CRLF) and 1 for \n (LF)
          const linebreakLength =
            linebreaks && linebreaks[i] ? linebreaks[i].length : 1;
          const lineLength = lines[i].length + linebreakLength;

          const matches = re.exec(lines[i]);

          if (!matches) {
            totalLength += lineLength;
            continue;
          }
          const location = {
            start: {
              line: lineNumber,
              column: matches.index + 1,
            },
            end: {
              line: lineNumber,
              column: lineLength + 1 - linebreakLength,
            },
          };

          const rangeStart = totalLength + location.start.column - 1;
          const rangeEnd = totalLength + location.end.column - 1;

          if (
            ignoreNodes.some((node) => {
              const range = sourceCode.getRange(node);
              return range[0] <= rangeStart && rangeEnd <= range[1];
            })
          ) {
            totalLength += lineLength;
            continue;
          }

          // If the line has only whitespace, and skipBlankLines
          // is true, don't report it
          if (skipBlankLines && skipMatch.test(lines[i])) {
            totalLength += lineLength;
            continue;
          }

          const fixRange = [rangeStart, rangeEnd] as [number, number];

          if (!ignoreComments || !commentLineNumbers.has(lineNumber)) {
            report(location, fixRange);
          }

          totalLength += lineLength;
        }
      },
    };
  },
});
