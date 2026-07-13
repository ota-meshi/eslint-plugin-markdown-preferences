import { createRule } from "../utils/index.ts";
import type { Link, LinkReference } from "../language/ast-types.ts";
import path from "node:path";
import type { Ignores } from "../utils/search-words.ts";
import {
  createSearchWordsIgnoreContext,
  IGNORES_SCHEMA,
  iterateSearchWords,
} from "../utils/search-words.ts";
import type { RegExpMatcher } from "../utils/regexp.ts";
import { toRegExpMatcher } from "../utils/regexp.ts";

type WordsObject = Record<string, string | null>;
type Words = WordsObject | string[];

class WordToMatchers {
  private readonly _patternToMatchers = new Map<string, RegExpMatcher>();

  private readonly _matcherToPatterns = new Map<RegExpMatcher, string>();

  private readonly _matchers: RegExpMatcher[] = [];

  public get matchers(): RegExpMatcher[] {
    return this._matchers;
  }

  public addPattern(pattern: string): void {
    const matcher = toRegExpMatcher(pattern);
    this._patternToMatchers.set(pattern, matcher);
    this._matcherToPatterns.set(matcher, pattern);
    this._matchers.push(matcher);
  }

  public getPattern(matcher: RegExpMatcher) {
    return this._matcherToPatterns.get(matcher);
  }
}

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
          additionalProperties: false,
        },
      ],
      languages: ["markdown/*", "markdown-preferences/*"],
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
      const wordMatchers = new WordToMatchers();
      if (Array.isArray(wordsOption)) {
        for (const word of wordsOption) {
          wordMatchers.addPattern(word);
        }
      } else {
        for (const [word, link] of Object.entries(wordsOption)) {
          if (link) {
            links[word] = link;
          }
          wordMatchers.addPattern(word);
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
          for (const { wordMatcher, word, range } of iterateSearchWords({
            sourceCode,
            node,
            wordMatchers: wordMatchers.matchers,
            ignores,
          })) {
            const pattern = wordMatchers.getPattern(wordMatcher);

            const link =
              pattern && resolveLink(word, links[pattern], wordMatcher);
            if (isSelfLink(link)) continue;
            context.report({
              node,
              loc: {
                start: sourceCode.getLocFromIndex(range[0]),
                end: sourceCode.getLocFromIndex(range[1]),
              },
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
          for (const matcher of wordMatchers.matchers) {
            const word = node.value;
            if (!word) continue;
            if (ignores.ignore(word)) continue;
            // Check if the entire range matches
            const iterator = word.matchAll(matcher);
            const match = iterator.next();
            if (match.done) continue;
            if (match.value[0] !== word) continue;

            const pattern = wordMatchers.getPattern(matcher);
            const link = pattern && resolveLink(word, links[pattern], matcher);
            if (isSelfLink(link)) continue;
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
        },
      };

      /**
       * Resolve a link template for a match.
       */
      function resolveLink(
        text: string,
        linkTemplate: string | undefined,
        matcher: RegExpMatcher,
      ): string | undefined {
        if (!linkTemplate) return linkTemplate;
        const newLink = text.replace(matcher, linkTemplate);

        const adjustedLink = adjustLink(newLink);
        return adjustedLink;
      }

      /**
       * Check whether a link points to the file currently being checked.
       */
      function isSelfLink(link: string | undefined): boolean {
        return link === `./${path.basename(context.filename)}`;
      }

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
