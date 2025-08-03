import type { MarkdownSourceCode } from "@eslint/markdown";
import type { SourceLocation } from "estree";
import type { Text } from "mdast";

export const RE_BOUNDARY =
  /^[\s\p{Letter_Number}\p{Modifier_Letter}\p{Modifier_Symbol}\p{Nonspacing_Mark}\p{Other_Letter}\p{Other_Symbol}\p{Script=Han}!"#$%&'(),./:;<=>?\\{|}~\u{2ffc}-\u{303d}\u{30a0}-\u{30fb}\u{3192}-\u{32bf}\u{fe10}-\u{fe1f}\u{fe30}-\u{fe6f}\u{ff00}-\u{ffef}\u{2ebf0}-\u{2ee5d}]*$/u;

/**
 * Iterate through words in a text node that match the specified words.
 */
export function* iterateSearchWords(
  sourceCode: MarkdownSourceCode,
  node: Text,
  words: string[],
): Generator<{
  word: string;
  loc: SourceLocation;
  range: [number, number];
}> {
  const text = sourceCode.getText(node);

  for (const word of words) {
    let startPosition = 0;
    while (true) {
      const index = text.indexOf(word, startPosition);
      if (index < 0) break;
      startPosition = index + word.length;
      if (
        !RE_BOUNDARY.test(text[index - 1] || "") ||
        !RE_BOUNDARY.test(text[index + word.length] || "")
      ) {
        // not a whole word
        continue;
      }

      const loc = sourceCode.getLoc(node);
      const beforeLines = text.slice(0, index).split(/\n/u);
      const line = loc.start.line + beforeLines.length - 1;
      const column =
        (beforeLines.length === 1 ? loc.start.column : 1) +
        (beforeLines.at(-1) || "").length;

      const range = sourceCode.getRange(node);
      yield {
        loc: {
          start: { line, column },
          end: { line, column: column + word.length },
        },
        range: [range[0] + index, range[0] + index + word.length],
        word,
      };
    }
  }
}
