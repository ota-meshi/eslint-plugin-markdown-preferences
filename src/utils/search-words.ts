import type { ExtendedMarkdownSourceCode } from "../language/extended-markdown-language.ts";
import type { JSONSchema4 } from "json-schema";
import type { Text } from "../language/ast-types.ts";
import type { GlobalRegExpMatcher } from "./regexp.ts";

export const RE_BOUNDARY =
  /^[\s\p{Letter_Number}\p{Modifier_Letter}\p{Modifier_Symbol}\p{Nonspacing_Mark}\p{Other_Letter}\p{Other_Symbol}\p{Script=Han}!"#$%&'()*+,./:;<=>?\\{|}~\u{2ffc}-\u{303d}\u{30a0}-\u{30fb}\u{3192}-\u{32bf}\u{fe10}-\u{fe1f}\u{fe30}-\u{fe6f}\u{ff00}-\u{ffef}\u{2ebf0}-\u{2ee5d}]*$/u;

/**
 * Iterate through words in a text node that match the specified words.
 */
export function* iterateSearchWords({
  sourceCode,
  node,
  wordMatchers,
  ignores,
}: {
  sourceCode: ExtendedMarkdownSourceCode;
  node: Text;
  wordMatchers: GlobalRegExpMatcher[];
  ignores: SearchWordsIgnoreContext;
}): Generator<{
  wordMatcher: GlobalRegExpMatcher;
  word: string;
  range: [number, number];
  fragment: {
    text: string;
    range: [number, number];
  };
}> {
  const text = sourceCode.getText(node);
  for (const matcher of wordMatchers) {
    for (const match of text.matchAll(matcher)) {
      const word = match[0];
      if (!word || ignores.ignore(word)) continue;
      const index = match.index;
      if (
        !RE_BOUNDARY.test(text[index - 1] || "") ||
        !RE_BOUNDARY.test(text[index + word.length] || "")
      ) {
        // not a whole word
        continue;
      }

      const [nodeStart] = sourceCode.getRange(node);
      const range: [number, number] = [
        nodeStart + index,
        nodeStart + index + word.length,
      ];
      yield {
        wordMatcher: matcher,
        range,
        word,
        fragment: {
          text,
          range: [index, index + word.length],
        },
      };
    }
  }
}

export type Ignore = {
  words?: string[] | string;
  node?: Record<string, unknown>;
};
export type Ignores = Ignore[];

export const IGNORES_SCHEMA: JSONSchema4 = {
  type: "array",
  items: {
    type: "object",
    properties: {
      words: {
        anyOf: [
          {
            type: "string",
          },
          {
            type: "array",
            items: {
              type: "string",
            },
          },
        ],
      },
      node: {
        type: "object",
      },
    },
    additionalProperties: false,
  },
};

export type SearchWordsIgnoreContext = {
  ignore(word: string): boolean;
  enter: (node: Record<string, unknown>) => void;
  exit: (node: Record<string, unknown>) => void;
};

/**
 * Create a context for ignoring specific words or nodes.
 */
export function createSearchWordsIgnoreContext(
  ignores: Ignores | undefined,
): SearchWordsIgnoreContext {
  if (!ignores || ignores.length === 0) {
    return {
      enter: () => undefined,
      exit: () => undefined,
      ignore: () => false,
    };
  }

  type IgnoreCondition = {
    isIgnoreWord: (word: string) => boolean;
    isIgnoreNode: (node: Record<string, unknown>) => boolean;
  };
  const conditions: IgnoreCondition[] = ignores.map((ignore) => {
    const isIgnoreWord: (word: string) => boolean =
      ignore.words == null
        ? () => true
        : Array.isArray(ignore.words)
          ? (word) => (ignore.words as string[]).includes(word)
          : (word) => ignore.words === word;
    const node = ignore.node || {};
    const keys = Object.keys(node);
    return {
      isIgnoreWord,
      isIgnoreNode: (nodeToCheck) => {
        return keys.every((key) => nodeToCheck[key] === node[key]);
      },
    };
  });

  const currentIgnores = new Set<{
    node: Record<string, unknown>;
    condition: IgnoreCondition;
  }>();

  return {
    enter(node) {
      for (const ignore of conditions) {
        if (ignore.isIgnoreNode(node)) {
          currentIgnores.add({ node, condition: ignore });
        }
      }
    },
    exit(node) {
      for (const element of [...currentIgnores]) {
        if (element.node === node) {
          currentIgnores.delete(element);
        }
      }
    },
    ignore(word) {
      for (const { condition } of currentIgnores) {
        if (condition.isIgnoreWord(word)) {
          return true;
        }
      }
      return false;
    },
  };
}
