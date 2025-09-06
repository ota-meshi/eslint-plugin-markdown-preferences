import type { SourceLocation } from "@eslint/core";
import type { MarkdownSourceCode } from "@eslint/markdown";
import type { Code } from "mdast";
import { getParsedLines } from "./lines.ts";

export type ParsedFencedCodeBlock = {
  openingFence: {
    text: string;
    range: [number, number];
    loc: SourceLocation;
  };
  language: {
    text: string;
    range: [number, number];
    loc: SourceLocation;
  } | null;
  meta: {
    text: string;
    range: [number, number];
    loc: SourceLocation;
  } | null;
  closingFence: {
    text: string;
    range: [number, number];
    loc: SourceLocation;
  };
};
const RE_OPENING_FENCE = /^(`{3,}|~{3,})/u;
const RE_LANGUAGE = /^(\w*)/u;
/**
 * Parse the fenced code block.
 */
export function parseFencedCodeBlock(
  sourceCode: MarkdownSourceCode,
  node: Code,
): ParsedFencedCodeBlock | null {
  const loc = sourceCode.getLoc(node);
  const range = sourceCode.getRange(node);
  const text = sourceCode.text.slice(...range);
  const match = RE_OPENING_FENCE.exec(text);
  if (!match) return null;
  const [, fenceText] = match;

  // parse closing fence
  const trimmed = text.trimEnd();
  const trailingSpacesLength = text.length - trimmed.length;
  if (!trimmed.endsWith(`\n${fenceText}`)) return null;

  const lines = getParsedLines(sourceCode);
  const afterOpeningFence = lines
    .get(loc.start.line)
    .text.slice(fenceText.length);
  const trimmedAfterOpeningFence = afterOpeningFence.trimStart();
  const spaceAfterOpeningFenceLength =
    afterOpeningFence.length - trimmedAfterOpeningFence.length;
  let languageText = "";
  if (trimmedAfterOpeningFence) {
    const langMatch = RE_LANGUAGE.exec(trimmedAfterOpeningFence)!;
    languageText = langMatch[1];
  }
  const afterLanguage = trimmedAfterOpeningFence.slice(languageText.length);
  const trimmedAfterLanguage = afterLanguage.trimStart();
  const spaceAfterLanguageLength =
    afterLanguage.length - trimmedAfterLanguage.length;
  const metaText = trimmedAfterLanguage.trimEnd();

  const openingFence: {
    text: string;
    range: [number, number];
    loc: SourceLocation;
  } = {
    text: fenceText,
    range: [range[0], range[0] + fenceText.length],
    loc: {
      start: loc.start,
      end: {
        line: loc.start.line,
        column: loc.start.column + fenceText.length,
      },
    },
  };
  const language: {
    text: string;
    range: [number, number];
    loc: SourceLocation;
  } | null = languageText
    ? {
        text: languageText,
        range: [
          openingFence.range[1] + spaceAfterOpeningFenceLength,
          openingFence.range[1] +
            spaceAfterOpeningFenceLength +
            languageText.length,
        ],
        loc: {
          start: {
            line: openingFence.loc.end.line,
            column: openingFence.loc.end.column + spaceAfterOpeningFenceLength,
          },
          end: {
            line: openingFence.loc.end.line,
            column:
              openingFence.loc.end.column +
              spaceAfterOpeningFenceLength +
              languageText.length,
          },
        },
      }
    : null;
  const meta: {
    text: string;
    range: [number, number];
    loc: SourceLocation;
  } | null =
    language && metaText
      ? {
          text: metaText,
          range: [
            language.range[1] + spaceAfterLanguageLength,
            language.range[1] + spaceAfterLanguageLength + metaText.length,
          ],
          loc: {
            start: {
              line: language.loc.end.line,
              column: language.loc.end.column + spaceAfterLanguageLength,
            },
            end: {
              line: language.loc.end.line,
              column:
                language.loc.end.column +
                spaceAfterLanguageLength +
                metaText.length,
            },
          },
        }
      : null;
  return {
    openingFence,
    language,
    meta,
    closingFence: {
      text: fenceText,
      range: [
        range[1] - trailingSpacesLength - fenceText.length,
        range[1] - trailingSpacesLength,
      ],
      loc: {
        start: {
          line: loc.end.line,
          column: loc.end.column - trailingSpacesLength - fenceText.length,
        },
        end: {
          line: loc.end.line,
          column: loc.end.column - trailingSpacesLength,
        },
      },
    },
  };
}
