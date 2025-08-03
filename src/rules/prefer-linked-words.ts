import { createRule } from "../utils/index.js";
import type { Link, LinkReference, Heading, FootnoteDefinition } from "mdast";
import path from "node:path";
import { iterateSearchWords } from "../utils/search-words.js";

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
    const wordsOption = context.options[0]?.words || {};
    const links: Record<string, string | undefined> = Object.create(null);
    const words: string[] = [];
    if (Array.isArray(wordsOption)) {
      words.push(...wordsOption);
    } else {
      for (const [word, link] of Object.entries(wordsOption)) {
        if (link) {
          const adjustedLink = adjustLink(link);
          if (adjustedLink === `./${path.basename(context.filename)}`) {
            continue;
          }
          links[word] = adjustedLink;
        }
        words.push(word);
      }
    }

    type IgnoreNode = Link | LinkReference | Heading | FootnoteDefinition;
    let ignore: IgnoreNode | null = null;
    return {
      "link, linkReference, heading, footnoteDefinition"(node: IgnoreNode) {
        if (ignore) return;
        ignore = node;
      },
      "link, linkReference, heading, footnoteDefinition:exit"(
        node: IgnoreNode,
      ) {
        if (ignore === node) ignore = null;
      },
      text(node) {
        if (ignore) return;
        for (const { word, loc, range } of iterateSearchWords(
          sourceCode,
          node,
          words,
        )) {
          const link = links[word];
          context.report({
            node,
            loc,
            messageId: "requireLink",
            data: {
              name: word,
            },
            fix: link
              ? (fixer) => {
                  return fixer.replaceTextRange(range, `[${word}](${link})`);
                }
              : null,
          });
        }
      },
      inlineCode(node) {
        if (ignore) return;
        for (const word of words) {
          if (node.value === word) {
            const link = links[word];
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

      const absoluteLink =
        path.isAbsolute(link) || path.posix.isAbsolute(link)
          ? link
          : path.join(context.cwd, link);
      return `./${path.relative(path.dirname(context.filename), absoluteLink)}`;
    }
  },
});
