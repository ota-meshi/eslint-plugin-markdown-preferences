import { createRule } from "../utils/index.js";
import type { Link, LinkReference, Heading } from "mdast";
import path from "node:path";

type WordsObject = Record<string, string | null>;
type Words = WordsObject | string[];
export default createRule<[{ words?: Words }?]>("prefer-linked-words", {
  meta: {
    type: "suggestion",
    docs: {
      description: "enforce the specified word to be a link.",
      categories: [],
    },
    fixable: "code",
    hasSuggestions: false,
    schema: [
      {
        type: "object",
        properties: {
          words: {
            anyOf: [
              {
                type: "object",
                patternProperties: {
                  "^[\\s\\S]+$": {
                    type: ["string", "null"],
                  },
                },
              },
              {
                type: "array",
                items: {
                  type: "string",
                },
              },
            ],
          },
        },
        required: ["words"],
      },
    ],
    messages: {
      requireLink: 'The word "{{name}}" should be a link.',
    },
  },
  create(context) {
    const sourceCode = context.sourceCode;
    const words = context.options[0]?.words || {};
    const wordEntries: [string, string | undefined][] = (
      Array.isArray(words)
        ? words.map((word) => [word, undefined] as [string, undefined])
        : Object.entries(words)
    )
      .map(
        ([word, link]) =>
          [word, link ? adjustLink(link) : undefined] as [
            string,
            string | undefined,
          ],
      )
      .filter(([, link]) => link !== `./${path.basename(context.filename)}`);

    type IgnoreNode = Link | LinkReference | Heading;
    let ignore: IgnoreNode | null = null;
    return {
      "link, linkReference, heading"(node: IgnoreNode) {
        if (ignore) return;
        ignore = node;
      },
      "link, linkReference, heading:exit"(node: IgnoreNode) {
        if (ignore === node) ignore = null;
      },
      text(node) {
        if (ignore) return;
        for (const [word, link] of wordEntries) {
          let startPosition = 0;
          while (true) {
            const index = node.value.indexOf(word, startPosition);
            if (index < 0) break;
            startPosition = index + word.length;
            if (
              (node.value[index - 1] || "").trim() ||
              (node.value[index + word.length] || "").trim()
            ) {
              // not a whole word
              continue;
            }

            const loc = sourceCode.getLoc(node);
            const beforeLines = node.value.slice(0, index).split(/\n/u);
            const line = loc.start.line + beforeLines.length - 1;
            const column =
              (beforeLines.length === 1 ? loc.start.column : 1) +
              (beforeLines.at(-1) || "").length;

            context.report({
              node,
              loc: {
                start: { line, column },
                end: { line, column: column + word.length },
              },
              messageId: "requireLink",
              data: {
                name: word,
              },
              fix: link
                ? (fixer) => {
                    const [start] = sourceCode.getRange(node);
                    return fixer.replaceTextRange(
                      [start + index, start + index + word.length],
                      `[${word}](${link})`,
                    );
                  }
                : null,
            });
          }
        }
      },
      inlineCode(node) {
        if (ignore) return;
        for (const [word, link] of wordEntries) {
          if (node.value === word) {
            context.report({
              node,
              messageId: "requireLink",
              data: {
                name: word,
              },
              fix: link
                ? (fixer) => {
                    return fixer.replaceText(node, `[\`${word}\`](${link})`);
                  }
                : null,
            });
          }
        }
      },
    };

    /**
     * Adjust link to be relative to the file.
     */
    function adjustLink(link: string): string {
      if (/^\w+:/.test(link)) {
        return link;
      }
      if (link.startsWith("#")) {
        return link;
      }

      const absoluteLink = path.isAbsolute(link)
        ? link
        : path.join(context.cwd, link);
      return `./${path.relative(path.dirname(context.filename), absoluteLink)}`;
    }
  },
});
