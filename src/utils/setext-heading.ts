import type { SourceLocation } from "@eslint/core";
import type { ExtendedMarkdownSourceCode } from "../language/extended-markdown-language.ts";
import type { Heading } from "../language/ast-types.ts";
import { getHeadingKind } from "./ast.ts";
import type { ParsedLine } from "./lines.ts";
import { getParsedLines } from "./lines.ts";

export type ParsedSetextHeading = {
  contentLines: {
    text: string;
    range: [number, number];
    loc: SourceLocation;
    raws: {
      prefix: string;
      spaceBefore: string;
      spaceAfter: string;
    };
  }[];
  underline: {
    text: string;
    range: [number, number];
    loc: SourceLocation;
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

  const lines = getParsedLines(sourceCode);

  const contentLines: ParsedSetextHeading["contentLines"] = [];

  const nodeLoc = sourceCode.getLoc(node);
  for (
    let lineNumber = nodeLoc.start.line;
    lineNumber < nodeLoc.end.line;
    lineNumber++
  ) {
    const content = parseContent(lines.get(lineNumber));
    contentLines.push(content);
  }

  const underline = parseUnderline(lines.get(nodeLoc.end.line));
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
  line: ParsedLine,
): ParsedSetextHeading["contentLines"][number] {
  let prefix = "";
  let spaceBefore = "";
  let suffix = "";
  for (let index = 0; index < line.text.length; index++) {
    const c = line.text[index];
    if (!c.trim()) {
      spaceBefore += c;
      continue;
    }
    if (c === ">" && spaceBefore.length < 4) {
      prefix += spaceBefore + c;
      spaceBefore = "";
      continue;
    }
    suffix = line.text.slice(index);
    break;
  }
  const content = suffix.trimEnd();
  const spaceAfter = suffix.slice(content.length);

  return {
    text: content,
    range: [
      line.range[0] + prefix.length + spaceBefore.length,
      line.range[1] - line.linebreak.length - spaceAfter.length,
    ],
    loc: {
      start: {
        line: line.line,
        column: prefix.length + spaceBefore.length + 1,
      },
      end: {
        line: line.line,
        column: prefix.length + spaceBefore.length + content.length + 1,
      },
    },
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
  line: ParsedLine,
): ParsedSetextHeading["underline"] | null {
  let marker: "=" | "-" | null = null;
  let underlineText = "";
  let prefix = "";
  let spaceBefore = "";
  let spaceAfter = "";
  for (let index = line.text.length - 1; index >= 0; index--) {
    const c = line.text[index];
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
      prefix = line.text.slice(0, index + 1);
      break;
    }
  }
  if (!marker) return null;

  const underlineLoc: SourceLocation = {
    start: {
      line: line.line,
      column: prefix.length + spaceBefore.length + 1,
    },
    end: {
      line: line.line,
      column: prefix.length + spaceBefore.length + underlineText.length + 1,
    },
  };

  return {
    text: underlineText,
    range: [
      line.range[0] + prefix.length + spaceBefore.length,
      line.range[1] - line.linebreak.length - spaceAfter.length,
    ],
    loc: underlineLoc,
    marker,
    raws: {
      prefix,
      spaceBefore,
      spaceAfter,
    },
  };
}
