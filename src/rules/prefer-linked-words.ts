import { createRule } from "../utils/index.ts";
import type { Link, LinkReference } from "../language/ast-types.ts";
import path from "node:path";
import type { Ignores } from "../utils/search-words.ts";
import {
  createSearchWordsIgnoreContext,
  IGNORES_SCHEMA,
  iterateSearchWords,
} from "../utils/search-words.ts";
import type { GlobalRegExpMatcher } from "../utils/regexp.ts";
import {
  toGlobalRegExpMatcher,
  toStickyRegExpMatcher,
} from "../utils/regexp.ts";

type WordsObject = Record<string, string | null>;
type UserWordsOption = WordsObject | string[];

class WordsOptions {
  private readonly _patternToMatchers = new Map<string, GlobalRegExpMatcher>();

  private readonly _matcherToPatterns = new Map<GlobalRegExpMatcher, string>();

  private readonly _matchers: GlobalRegExpMatcher[] = [];

  private readonly _links: Record<string, string | undefined> =
    Object.create(null);

  public constructor(wordsOption: UserWordsOption) {
    if (Array.isArray(wordsOption)) {
      for (const word of wordsOption) {
        this.addPattern(word);
      }
    } else {
      for (const [word, link] of Object.entries(wordsOption)) {
        if (link) {
          this._links[word] = link;
        }
        this.addPattern(word);
      }
    }
  }

  public get globalMatchers(): GlobalRegExpMatcher[] {
    return this._matchers;
  }

  public addPattern(pattern: string): void {
    const matcher = toGlobalRegExpMatcher(pattern);
    this._patternToMatchers.set(pattern, matcher);
    this._matcherToPatterns.set(matcher, pattern);
    this._matchers.push(matcher);
  }

  public resolveNewLink(
    source: {
      text: string;
      range: [number, number];
    },
    matcher: GlobalRegExpMatcher,
  ) {
    const pattern = this._matcherToPatterns.get(matcher);
    if (!pattern) return undefined;
    const link = this._links[pattern];
    if (!link) return null;

    const stickyMatcher = toStickyRegExpMatcher(pattern);
    stickyMatcher.lastIndex = source.range[0];
    const newText = source.text.replace(stickyMatcher, link);

    const offsetFromEnd = source.text.length - source.range[1];
    if (offsetFromEnd === 0) {
      return newText.slice(source.range[0]);
    }

    return newText.slice(source.range[0], -offsetFromEnd);
  }
}

export default createRule<[{ words?: UserWordsOption; ignores?: Ignores }?]>(
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
      const words = new WordsOptions(wordsOption);

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
          for (const {
            wordMatcher,
            word,
            range,
            fragment,
          } of iterateSearchWords({
            sourceCode,
            node,
            wordMatchers: words.globalMatchers,
            ignores,
          })) {
            const link = resolveLink(fragment, wordMatcher);
            if (link && isSelfLink(link)) continue;
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
          for (const matcher of words.globalMatchers) {
            const word = node.value;
            if (!word) continue;
            if (ignores.ignore(word)) continue;
            // Check if the entire range matches
            const matches = [...word.matchAll(matcher)];
            if (
              matches.length !== 1 ||
              matches[0].index !== 0 ||
              matches[0][0] !== word
            ) {
              continue;
            }

            const link = resolveLink(
              { text: word, range: [0, word.length] },
              matcher,
            );
            if (link && isSelfLink(link)) continue;
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
        fragment: {
          text: string;
          range: [number, number];
        },
        matcher: GlobalRegExpMatcher,
      ): string | null {
        const newLink = words.resolveNewLink(fragment, matcher);
        if (!newLink) return null;
        const adjustedLink = adjustLink(newLink);
        return adjustedLink;
      }

      /**
       * Check whether a link points to the file currently being checked.
       */
      function isSelfLink(link: string | null): boolean {
        return link != null && link === `./${path.basename(context.filename)}`;
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
