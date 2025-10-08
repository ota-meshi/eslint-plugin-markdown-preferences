import type { ExtendedMarkdownSourceCode } from "../language/extended-markdown-language.ts";
import type { Heading } from "../language/ast-types.ts";
import { getHeadingKind } from "./ast.ts";

export type ParsedSetextHeading = {
  contentLines: {
    text: string;
    range: [number, number];
    raws: {
      prefix: string;
      spaceBefore: string;
      spaceAfter: string;
    };
  }[];
  underline: {
    text: string;
    range: [number, number];
    marker: "=" | "-";
    raws: {
      prefix: string;
      spaceBefore: string;
      spaceAfter: string;
    };
  };
};

/**
 * Parse the setext heading.
 */
export function parseSetextHeading(
  sourceCode: ExtendedMarkdownSourceCode,
  node: Heading,
): ParsedSetextHeading | null {
  if (getHeadingKind(sourceCode, node) !== "setext") return null;

  const contentLines: ParsedSetextHeading["contentLines"] = [];

  const nodeLoc = sourceCode.getLoc(node);
  for (
    let lineNumber = nodeLoc.start.line;
    lineNumber < nodeLoc.end.line;
    lineNumber++
  ) {
    const content = parseContent(sourceCode, lineNumber);
    contentLines.push(content);
  }

  const underline = parseUnderline(sourceCode, nodeLoc.end.line);
  if (!underline) return null;

  return {
    contentLines,
    underline,
  };
}

/**
 * Parse the content line of a setext heading.
 */
function parseContent(
  sourceCode: ExtendedMarkdownSourceCode,
  lineNumber: number,
): ParsedSetextHeading["contentLines"][number] {
  const lineText = sourceCode.lines[lineNumber - 1];
  let prefix = "";
  let spaceBefore = "";
  let suffix = "";
  for (let index = 0; index < lineText.length; index++) {
    const c = lineText[index];
    if (!c.trim()) {
      spaceBefore += c;
      continue;
    }
    if (c === ">" && spaceBefore.length < 4) {
      prefix += spaceBefore + c;
      spaceBefore = "";
      continue;
    }
    suffix = lineText.slice(index);
    break;
  }
  const content = suffix.trimEnd();
  const spaceAfter = suffix.slice(content.length);

  const lineStartIndex = sourceCode.getIndexFromLoc({
    line: lineNumber,
    column: 1,
  });
  return {
    text: content,
    range: [
      lineStartIndex + prefix.length + spaceBefore.length,
      lineStartIndex + lineText.length - spaceAfter.length,
    ],
    raws: {
      prefix,
      spaceBefore,
      spaceAfter,
    },
  };
}

/**
 * Parse the underline of a setext heading.
 */
function parseUnderline(
  sourceCode: ExtendedMarkdownSourceCode,
  lineNumber: number,
): ParsedSetextHeading["underline"] | null {
  const lineText = sourceCode.lines[lineNumber - 1];
  let marker: "=" | "-" | null = null;
  let underlineText = "";
  let prefix = "";
  let spaceBefore = "";
  let spaceAfter = "";
  for (let index = lineText.length - 1; index >= 0; index--) {
    const c = lineText[index];
    if (!marker) {
      if (c === "=" || c === "-") {
        underlineText = c + underlineText;
        marker = c;
      } else if (!c.trim()) {
        spaceAfter = c + spaceAfter;
      } else {
        return null;
      }
      continue;
    }

    if (c === marker) {
      underlineText = c + spaceBefore + underlineText;
      spaceBefore = "";
    } else if (!c.trim()) {
      spaceBefore = c + spaceBefore;
    } else {
      prefix = lineText.slice(0, index + 1);
      break;
    }
  }
  if (!marker) return null;

  const lineStartIndex = sourceCode.getIndexFromLoc({
    line: lineNumber,
    column: 1,
  });
  return {
    text: underlineText,
    range: [
      lineStartIndex + prefix.length + spaceBefore.length,
      lineStartIndex + lineText.length - spaceAfter.length,
    ],
    marker,
    raws: {
      prefix,
      spaceBefore,
      spaceAfter,
    },
  };
}
