import { createRule } from "../utils/index.ts";
import type { Link, LinkReference } from "../language/ast-types.ts";
import path from "node:path";
import type { Ignores } from "../utils/search-words.ts";
import {
  createSearchWordsIgnoreContext,
  IGNORES_SCHEMA,
  iterateSearchWords,
} from "../utils/search-words.ts";

type WordsObject = Record<string, string | null>;
type Words = WordsObject | string[];

export default createRule<[{ words?: Words; ignores?: Ignores }?]>(
  "prefer-linked-words",
  {
    meta: {
      type: "suggestion",
      docs: {
        description: "enforce the specified word to be a link.",
        categories: [],
        listCategory: "Preference",
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
            ignores: IGNORES_SCHEMA,
          },
          required: ["words"],
          additionalProperties: true,
        },
      ],
      messages: {
        requireLink: 'The word "{{name}}" should be a link.',
      },
    },
    create(context) {
      const sourceCode = context.sourceCode;
      const wordsOption = context.options[0]?.words || {};
      const ignores = createSearchWordsIgnoreContext(
        context.options[0]?.ignores,
      );
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

      type LinkedNode = Link | LinkReference;
      let linkedNode: LinkedNode | null = null;
      return {
        "*"(node) {
          ignores.enter(node);
        },
        "*:exit"(node) {
          ignores.exit(node);
        },
        "link, linkReference"(node: LinkedNode) {
          if (linkedNode) return;
          linkedNode = node;
        },
        "link, linkReference:exit"(node: LinkedNode) {
          if (linkedNode === node) linkedNode = null;
        },
        text(node) {
          if (linkedNode) return;
          for (const { word, loc, range } of iterateSearchWords({
            sourceCode,
            node,
            words,
            ignores,
          })) {
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
          if (linkedNode) return;
          for (const word of words) {
            if (ignores.ignore(word)) continue;
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
        if (URL.canParse(link)) {
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
  },
);
