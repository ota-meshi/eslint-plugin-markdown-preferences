import type { Heading, Text } from "mdast";
import { createRule } from "../utils/index.ts";
import { isRegExp, toRegExp } from "../utils/regexp.ts";
import { defaultPreserveWords } from "../resources/preserve-words.ts";
import { defaultMinorWords } from "../resources/minor-words.ts";
import { getSourceLocationFromRange } from "../utils/ast.ts";

type CaseStyle = "Title Case" | "Sentence case";

type WordType = "normal" | "minor" | "preserved";

/**
 * Parse preserve words and phrases from the options
 * - Single words are added to preserveWords
 * - Multi-word phrases are added to preservePhrases and added to preserveWords with no spaces
 */
function parsePreserveWords(preserveWordsOption: string[]): {
  preserveWords: Map<string, string[]>;
  preservePhrases: string[][];
} {
  const preserveWords = new Map<string, string[]>();

  /**
   * Add a single word to the preserveWords map
   */
  function addPreserveWord(word: string) {
    const lowerWord = word.toLowerCase();
    let list = preserveWords.get(lowerWord);
    if (!list) {
      list = [];
      preserveWords.set(lowerWord, list);
    }
    list.push(word);
  }

  const preservePhrases = new Map<string, string[]>();
  for (const word of preserveWordsOption) {
    const splitted = word.split(/\s+/);
    if (splitted.length <= 1) {
      // Single word
      addPreserveWord(word);
    } else {
      // Multi-word phrases
      preservePhrases.set(word, splitted);
      addPreserveWord(splitted.join(""));
    }
  }
  return {
    preserveWords,
    preservePhrases: [...preservePhrases.values()].sort(
      (a, b) => b.length - a.length,
    ),
  };
}

type WordAndOffset = {
  word: string;
  offset: number;
  punctuation: boolean;
  first: boolean;
  last: boolean;
};

/**
 * Parse text into words with offsets
 */
function parseText(
  text: string,
  firstNode: boolean,
  lastNode: boolean,
): WordAndOffset[] {
  const words: WordAndOffset[] = [];

  // Use regex to match word patterns, emoji and punctuation separately
  const pattern = /(\w+(?:[^\s\w]\w+)*|:\w+:|[^\s\w]+|\s+)/gu;
  let match;

  while ((match = pattern.exec(text)) !== null) {
    const token = match[1];

    // Skip whitespace
    if (/^\s+$/.test(token)) {
      continue;
    }

    // Check if token is purely emoji/punctuation/symbols (no word characters)
    const punctuation = /^(?::\w+:|[^\s\w]+)$/.test(token);

    words.push({
      word: token,
      offset: match.index,
      punctuation,
      first: false,
      last: false,
    });
  }

  if (firstNode) {
    for (const w of words) {
      // Mark first word
      if (!w.punctuation) {
        w.first = true;
        break;
      }
    }
  }

  if (lastNode) {
    for (let i = words.length - 1; i >= 0; i--) {
      // Mark first and last words
      const w = words[i];
      if (!w.punctuation) {
        w.last = true;
        break;
      }
    }
  }

  return words;
}

/**
 * Convert a single word based on case style and context
 */
function convertWord(
  { word, first, last }: WordAndOffset,
  caseStyle: CaseStyle,
  minorWords: string[],
): { word: string; isMinorWord: boolean } {
  if (caseStyle === "Title Case") {
    // Always capitalize first and last words
    if (first || last) {
      return {
        word: word.charAt(0).toUpperCase() + word.slice(1).toLowerCase(),
        isMinorWord: false,
      };
    }

    // Check if it's a word that should remain lowercase
    if (
      minorWords.some(
        (minorWord) => minorWord.toLowerCase() === word.toLowerCase(),
      )
    ) {
      return {
        word: word.toLowerCase(),
        isMinorWord: true,
      };
    }

    // Capitalize other words
    return {
      word: word.charAt(0).toUpperCase() + word.slice(1).toLowerCase(),
      isMinorWord: false,
    };
  }

  // Sentence case
  if (first) {
    return {
      word: word.charAt(0).toUpperCase() + word.slice(1).toLowerCase(),
      isMinorWord: false,
    };
  }
  return {
    word: word.toLowerCase(),
    isMinorWord: false,
  };
}

export default createRule<
  [
    {
      style?: CaseStyle;
      preserveWords?: string[];
      ignorePatterns?: string[];
      minorWords?: string[];
    }?,
  ]
>("heading-casing", {
  meta: {
    type: "suggestion",
    docs: {
      description: "enforce consistent casing in headings.",
      categories: [],
      listCategory: "Preference",
    },
    fixable: "code",
    hasSuggestions: false,
    schema: [
      {
        type: "object",
        properties: {
          style: {
            enum: ["Title Case", "Sentence case"],
          },
          preserveWords: {
            type: "array",
            items: {
              type: "string",
            },
            description:
              "Words that should be preserved as-is (case-insensitive matching)",
          },
          ignorePatterns: {
            type: "array",
            items: {
              type: "string",
            },
            description:
              "Regular expression patterns for words to ignore during casing checks",
          },
          minorWords: {
            type: "array",
            items: {
              type: "string",
            },
            description:
              "Words that should not be capitalized in Title Case (unless they're the first or last word)",
          },
        },
        additionalProperties: false,
      },
    ],
    messages: {
      expectedTitleCase:
        'Expected "{{actual}}" to be "{{expected}}" (Title Case).',
      expectedTitleCaseMinorWord:
        'Expected "{{actual}}" to be "{{expected}}" (Title Case - minor word).',
      expectedSentenceCase:
        'Expected "{{actual}}" to be "{{expected}}" (Sentence case).',
      expectedPreserveWord:
        'Expected "{{actual}}" to be "{{expected}}" (preserved word).',
    },
  },
  create(context) {
    const sourceCode = context.sourceCode;

    const caseStyle = context.options[0]?.style || "Title Case";
    const { preserveWords, preservePhrases } = parsePreserveWords(
      context.options[0]?.preserveWords || defaultPreserveWords,
    );
    const minorWords = context.options[0]?.minorWords || defaultMinorWords;
    const ignorePatterns = (
      context.options[0]?.ignorePatterns || [
        // Version numbers (e.g., v1.2.3, 2.0.1)
        "/^v\\d+/u",

        // File extensions and names
        "/\\w+\\.[a-z\\d]+$/u",

        // Common technical patterns
        "/\\w*(?:API|Api)$/u", // webAPI, restAPI, etc.
        "/\\w*(?:SDK|Sdk)$/u", // nodeSDK, etc.
        "/\\w*(?:CLI|Cli)$/u", // nodeCLI, etc.
      ]
    ).map((pattern) => {
      if (isRegExp(pattern)) {
        return toRegExp(pattern);
      }
      try {
        return new RegExp(pattern, "v");
      } catch {
        // If pattern is invalid, skip it
      }
      try {
        return new RegExp(pattern, "u");
      } catch {
        // If pattern is invalid, skip it
      }
      return new RegExp(pattern);
    });

    /**
     * Check text node and report word-level errors
     */
    function checkTextNode(node: Text, firstNode: boolean, lastNode: boolean) {
      const text = sourceCode.getText(node);

      const wordAndOffsets = parseText(text, firstNode, lastNode);

      const processed = new Set<number>();
      for (let index = 0; index < wordAndOffsets.length; index++) {
        if (processed.has(index)) continue;
        processed.add(index);

        const wordAndOffset = wordAndOffsets[index];

        // Skip punctuation tokens
        if (wordAndOffset.punctuation) {
          continue;
        }

        if (
          ignorePatterns.some((pattern) => pattern.test(wordAndOffset.word))
        ) {
          continue;
        }

        // Check if this word should be preserved as-is (multi-word phrase)
        const preservePhrase = findPreservePhrase(wordAndOffsets, index);
        if (preservePhrase) {
          for (
            let wordIndex = 0;
            wordIndex < preservePhrase.length;
            wordIndex++
          ) {
            processed.add(index + wordIndex);
            verifyWord(
              wordAndOffsets[index + wordIndex],
              preservePhrase[wordIndex],
              "preserved",
            );
          }
          continue;
        }

        // Check if this word should be preserved as-is (single word)
        const preserveWordList = preserveWords.get(
          wordAndOffset.word.toLowerCase(),
        );
        if (preserveWordList) {
          if (!preserveWordList.some((w) => w === wordAndOffset.word)) {
            verifyWord(wordAndOffset, preserveWordList[0], "preserved");
          }
          continue;
        }

        const expectedWordResult = convertWord(
          wordAndOffset,
          caseStyle,
          minorWords,
        );
        verifyWord(
          wordAndOffset,
          expectedWordResult.word,
          expectedWordResult.isMinorWord ? "minor" : "normal",
        );
      }

      /**
       * Verify a single word against the expected casing
       */
      function verifyWord(
        wordAndOffset: WordAndOffset,
        expectedWord: string,
        wordType: WordType = "normal",
      ) {
        const { word, offset } = wordAndOffset;

        if (word === expectedWord) return;

        const [nodeStart] = sourceCode.getRange(node);
        const range: [number, number] = [
          nodeStart + offset,
          nodeStart + offset + word.length,
        ];

        context.report({
          node,
          messageId:
            wordType === "preserved"
              ? "expectedPreserveWord"
              : caseStyle === "Title Case"
                ? wordType === "minor"
                  ? "expectedTitleCaseMinorWord"
                  : "expectedTitleCase"
                : "expectedSentenceCase",
          data: {
            actual: word,
            expected: expectedWord,
          },
          loc: getSourceLocationFromRange(sourceCode, node, range),
          fix(fixer) {
            // Replace only the specific word
            return fixer.replaceTextRange(range, expectedWord);
          },
        });
      }
    }

    /**
     * Find a preserve phrase starting from the given index
     * Returns the longest matching phrase or null if no match is found
     */
    function findPreservePhrase(
      wordAndOffsets: WordAndOffset[],
      index: number,
    ): string[] | null {
      const firstWord = wordAndOffsets[index];
      if (firstWord.punctuation) return null;

      const firstLowerWord = firstWord.word.toLowerCase();
      let returnCandidate: {
        preservePhrase: string[];
        matchCount: number;
      } | null = null;
      let subWords: string[] | null = null;
      for (const phrase of preservePhrases) {
        if (
          returnCandidate &&
          returnCandidate.preservePhrase.length !== phrase.length
        )
          break;
        if (firstLowerWord !== phrase[0].toLowerCase()) continue;
        if (!subWords || subWords.length !== phrase.length) {
          subWords = wordAndOffsets
            .slice(index, index + phrase.length)
            .map((wo) => wo.word);
        }

        if (
          subWords.length === phrase.length &&
          subWords.every(
            (word, i) => word.toLowerCase() === phrase[i].toLowerCase(),
          )
        ) {
          let matchCount = 0;
          for (let i = 0; i < subWords.length; i++) {
            const word = subWords[i];
            if (word === phrase[i]) {
              matchCount++;
            }
          }
          if (!returnCandidate || matchCount > returnCandidate.matchCount) {
            returnCandidate = {
              preservePhrase: phrase,
              matchCount,
            };
          }
        }
      }
      return returnCandidate?.preservePhrase ?? null;
    }

    return {
      heading(node: Heading) {
        // Skip empty headings
        if (!node.children.length) {
          return;
        }

        const children = node.children.filter(
          (child) => child.type !== "text" || child.value.trim(),
        );

        // Check each text node in the heading
        children.forEach((child, i) => {
          if (child.type === "text") {
            checkTextNode(
              child,
              i === 0, // First text node
              i === node.children.length - 1, // Last text node
            );
          }
        });
      },
    };
  },
});
