import type { ExtendedMarkdownSourceCode } from "../language/extended-markdown-language.ts";
import type { Code } from "../language/ast-types.ts";
import { isSpaceOrTab } from "./unicode.ts";
import { getCodeBlockKind } from "./ast.ts";

export type ParsedFencedCodeBlock = {
  openingFence: {
    text: string;
    range: [number, number];
  };
  language: {
    text: string;
    range: [number, number];
  } | null;
  meta: {
    text: string;
    range: [number, number];
  } | null;
  closingFence: {
    text: string;
    range: [number, number];
  } | null;
};
const RE_OPENING_FENCE = /^(`{3,}|~{3,})/u;
const RE_LANGUAGE = /^(\w*)/u;
/**
 * Parse the fenced code block.
 */
export function parseFencedCodeBlock(
  sourceCode: ExtendedMarkdownSourceCode,
  node: Code,
): ParsedFencedCodeBlock | null {
  if (getCodeBlockKind(sourceCode, node) === "indented") {
    return null;
  }
  const loc = sourceCode.getLoc(node);
  const range = sourceCode.getRange(node);
  const text = sourceCode.text.slice(...range);
  const match = RE_OPENING_FENCE.exec(text);
  if (!match) return null;
  const [, fenceText] = match;

  const afterOpeningFence = sourceCode.lines[loc.start.line - 1].slice(
    loc.start.column - 1 + fenceText.length,
  );
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
  const openingFenceRange: [number, number] = [
    range[0],
    range[0] + fenceText.length,
  ];
  const openingFence: {
    text: string;
    range: [number, number];
  } = {
    text: fenceText,
    range: openingFenceRange,
  };
  const languageRange: [number, number] | null = languageText
    ? [
        openingFence.range[1] + spaceAfterOpeningFenceLength,
        openingFence.range[1] +
          spaceAfterOpeningFenceLength +
          languageText.length,
      ]
    : null;
  const language: {
    text: string;
    range: [number, number];
  } | null =
    languageText && languageRange
      ? {
          text: languageText,
          range: languageRange,
        }
      : null;
  const metaRange: [number, number] | null =
    language && metaText
      ? [
          language.range[1] + spaceAfterLanguageLength,
          language.range[1] + spaceAfterLanguageLength + metaText.length,
        ]
      : null;
  const meta: {
    text: string;
    range: [number, number];
  } | null =
    language && metaText && metaRange
      ? {
          text: metaText,
          range: metaRange,
        }
      : null;

  // parse closing fence
  const fenceChar = fenceText[0];
  let closingFenceText = "";
  const trimmed = text.trimEnd();
  const trailingSpacesLength = text.length - trimmed.length;
  for (let index = trimmed.length - 1; index >= 0; index--) {
    const c = trimmed[index];
    if (c === fenceChar || isSpaceOrTab(c)) {
      closingFenceText = c + closingFenceText;
      continue;
    }
    if (c === ">") {
      closingFenceText = ` ${closingFenceText}`;
      continue;
    }
    if (c === "\n") break;
    // invalid closing fence
    closingFenceText = "";
    break;
  }
  closingFenceText = closingFenceText.trimStart();
  if (!closingFenceText || !closingFenceText.startsWith(fenceText)) {
    return {
      openingFence,
      language,
      meta,
      closingFence: null,
    };
  }

  return {
    openingFence,
    language,
    meta,
    closingFence: {
      text: closingFenceText,
      range: [
        range[1] - trailingSpacesLength - closingFenceText.length,
        range[1] - trailingSpacesLength,
      ],
    },
  };
}
