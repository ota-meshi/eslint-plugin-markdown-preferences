import type { SourceLocation } from "@eslint/core";
import { createRule } from "../utils/index.ts";
import type {
  Break,
  Code,
  Html,
  InlineCode,
  Text,
  Yaml,
} from "../language/ast-types.ts";
import type { Json, Toml } from "@eslint/markdown/types";
import { isWhitespace } from "../utils/unicode.ts";

const htmlComment = /<!--.*?-->/su;

export default createRule("no-trailing-spaces", {
  meta: {
    type: "layout",
    docs: {
      description:
        "disallow trailing whitespace at the end of lines in Markdown files.",
      categories: ["standard"],
      listCategory: "Whitespace",
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
      break(node) {
        ignoreNodes.push(node);

        const range = sourceCode.getRange(node);
        let trailingSpaceCount = 0;
        for (let index = range[1] - 1; index >= range[0]; index--) {
          const c = sourceCode.text[index];
          if (c === "\n" || c === "\r") {
            trailingSpaceCount = 0;
            continue;
          }
          if (!isWhitespace(c)) return;

          trailingSpaceCount++;
        }

        const extraSpaces = trailingSpaceCount - 2;
        if (extraSpaces <= 0) return;

        context.report({
          node,
          loc: {
            start: sourceCode.getLocFromIndex(range[0]),
            end: sourceCode.getLocFromIndex(range[0] + extraSpaces),
          },
          messageId: "trailingSpace",
          fix(fixer) {
            return fixer.removeRange([range[0], range[0] + extraSpaces]);
          },
        });
      },
      "code, inlineCode, text, yaml, toml, json"(node: IgnoreNode) {
        ignoreNodes.push(node);
      },
      "root:exit"() {
        const re = /[^\S\n\r]+$/u;
        const skipMatch = /^[^\S\n\r]*$/u;
        const commentLineNumbers = getCommentLineNumbers();

        for (const [lineIndex, lineText] of sourceCode.lines.entries()) {
          const lineNumber = lineIndex + 1;
          const matches = re.exec(lineText);

          if (!matches) {
            continue;
          }
          const location = {
            start: {
              line: lineNumber,
              column: matches.index + 1,
            },
            end: {
              line: lineNumber,
              column: matches.index + 1 + matches[0].length,
            },
          };

          const range: [number, number] = [
            sourceCode.getIndexFromLoc(location.start),
            sourceCode.getIndexFromLoc(location.end),
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
          if (skipBlankLines && skipMatch.test(lineText)) {
            continue;
          }

          if (!ignoreComments || !commentLineNumbers.has(lineNumber)) {
            report(location, range);
          }
        }
      },
    };
  },
});
