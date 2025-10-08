import type { Heading, Text } from "../language/ast-types.ts";
import { createRule } from "../utils/index.ts";
import { isRegExp, toRegExp } from "../utils/regexp.ts";
import { defaultPreserveWords } from "../resources/preserve-words.ts";
import { defaultMinorWords } from "../resources/minor-words.ts";
import type { CaseStyle } from "../utils/word-casing.ts";
import { convertWordCasing } from "../utils/word-casing.ts";
import { parsePreserveWordsOption } from "../utils/preserve-words.ts";
import type { WordAndOffset } from "../utils/words.ts";
import { parseWordsFromText } from "../utils/words.ts";

type WordType = "normal" | "minor" | "preserved";

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
    const preserveWordsOption = parsePreserveWordsOption(
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
        "/\\w+(?:API|Api)$/u", // webAPI, restAPI, etc.
        "/\\w+(?:SDK|Sdk)$/u", // nodeSDK, etc.
        "/\\w+(?:CLI|Cli)$/u", // nodeCLI, etc.
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

      const wordAndOffsets = parseWordsFromText(text, firstNode, lastNode);

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
        const preservePhrase = preserveWordsOption.findPreservePhrase(
          (function* () {
            const firstWord = wordAndOffsets[index];
            if (firstWord.punctuation) return;
            yield firstWord.word;
            for (let next = index + 1; next < wordAndOffsets.length; next++) {
              yield wordAndOffsets[next].word;
            }
          })(),
        );
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
        const preserveWordList = preserveWordsOption.findPreserveWord(
          wordAndOffset.word,
        );
        if (preserveWordList) {
          if (!preserveWordList.some((w) => w === wordAndOffset.word)) {
            verifyWord(wordAndOffset, preserveWordList[0], "preserved");
          }
          continue;
        }

        const expectedWordResult = convertWordCasing(wordAndOffset, {
          caseStyle,
          minorWords,
        });
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
          loc: {
            start: sourceCode.getLocFromIndex(range[0]),
            end: sourceCode.getLocFromIndex(range[1]),
          },
          fix(fixer) {
            // Replace only the specific word
            return fixer.replaceTextRange(range, expectedWord);
          },
        });
      }
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
              i === children.length - 1, // Last text node
            );
          }
        });
      },
    };
  },
});
