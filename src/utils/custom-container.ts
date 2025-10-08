import type { ExtendedMarkdownSourceCode } from "../language/extended-markdown-language.ts";
import { isSpaceOrTab } from "./unicode.ts";
import type { CustomContainer } from "../language/ast-types.ts";

export type ParsedCustomContainer = {
  openingSequence: {
    text: string;
    range: [number, number];
  };
  info: {
    text: string;
    range: [number, number];
  };
  closingSequence: {
    text: string;
    range: [number, number];
  } | null;
};
const RE_OPENING_SEQUENCE = /^(:{3,})/u;
/**
 * Parse the custom container.
 */
export function parseCustomContainer(
  sourceCode: ExtendedMarkdownSourceCode,
  node: CustomContainer,
): ParsedCustomContainer | null {
  const loc = sourceCode.getLoc(node);
  const range = sourceCode.getRange(node);
  const text = sourceCode.text.slice(...range);
  const match = RE_OPENING_SEQUENCE.exec(text);
  if (!match) return null;
  const [, sequenceText] = match;

  const afterOpeningSequence = sourceCode.lines[loc.start.line - 1].slice(
    loc.start.column - 1 + sequenceText.length,
  );
  const trimmedAfterOpeningSequence = afterOpeningSequence.trimStart();
  const spaceAfterOpeningSequenceLength =
    afterOpeningSequence.length - trimmedAfterOpeningSequence.length;
  const infoText = trimmedAfterOpeningSequence.trimEnd();
  if (!infoText) return null;
  const openingSequenceRange: [number, number] = [
    range[0],
    range[0] + sequenceText.length,
  ];
  const openingSequence: {
    text: string;
    range: [number, number];
  } = {
    text: sequenceText,
    range: openingSequenceRange,
  };
  const infoRange: [number, number] = [
    openingSequence.range[1] + spaceAfterOpeningSequenceLength,
    openingSequence.range[1] +
      spaceAfterOpeningSequenceLength +
      infoText.length,
  ];
  const info: {
    text: string;
    range: [number, number];
  } = {
    text: infoText,
    range: infoRange,
  };

  // parse closing sequence
  const sequenceChar = sequenceText[0];
  let closingSequenceText = "";
  const trimmed = text.trimEnd();
  const trailingSpacesLength = text.length - trimmed.length;
  for (let index = trimmed.length - 1; index >= 0; index--) {
    const c = trimmed[index];
    if (c === sequenceChar || isSpaceOrTab(c)) {
      closingSequenceText = c + closingSequenceText;
      continue;
    }
    if (c === ">") {
      closingSequenceText = ` ${closingSequenceText}`;
      continue;
    }
    if (c === "\n") break;
    // invalid closing sequence
    closingSequenceText = "";
    break;
  }
  closingSequenceText = closingSequenceText.trimStart();
  if (!closingSequenceText || !closingSequenceText.startsWith(sequenceText)) {
    return {
      openingSequence,
      info,
      closingSequence: null,
    };
  }

  const closingSequenceRange: [number, number] = [
    range[1] - trailingSpacesLength - closingSequenceText.length,
    range[1] - trailingSpacesLength,
  ];
  return {
    openingSequence,
    info,
    closingSequence: {
      text: closingSequenceText,
      range: closingSequenceRange,
    },
  };
}
