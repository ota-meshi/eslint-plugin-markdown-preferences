import type { MarkdownSourceCode } from "@eslint/markdown";
import type { SourceLocation } from "estree";
import type { Definition } from "mdast";
import { isAsciiControlCharacter, isWhitespace } from "./unicode.ts";
import { getSourceLocationFromRange } from "./ast.ts";

export type ParsedLinkDefinition = {
  label: {
    text: string;
    range: [number, number];
    loc: SourceLocation;
  };
  destination: {
    type: "pointy-bracketed" | "plain";
    text: string;
    range: [number, number];
    loc: SourceLocation;
  };
  title: {
    type: "double-quoted" | "single-quoted" | "parenthesized";
    text: string;
    range: [number, number];
    loc: SourceLocation;
  } | null;
};
/**
 * Parse the link definition.
 */
export function parseLinkDefinition(
  sourceCode: MarkdownSourceCode,
  node: Definition,
): ParsedLinkDefinition | null {
  const text = sourceCode.getText(node);
  const parsed = parseLinkDefinitionFromText(text);
  if (!parsed) return null;
  const nodeRange = sourceCode.getRange(node);
  const labelRange: [number, number] = [
    nodeRange[0] + parsed.label.range[0],
    nodeRange[0] + parsed.label.range[1],
  ];
  const destinationRange: [number, number] = [
    nodeRange[0] + parsed.destination.range[0],
    nodeRange[0] + parsed.destination.range[1],
  ];
  return {
    label: {
      text: parsed.label.text,
      range: labelRange,
      loc: getSourceLocationFromRange(sourceCode, node, labelRange),
    },
    destination: {
      type: parsed.destination.type,
      text: parsed.destination.text,
      range: destinationRange,
      loc: getSourceLocationFromRange(sourceCode, node, destinationRange),
    },
    title: parsed.title
      ? {
          type: parsed.title.type,
          text: parsed.title.text,
          range: [
            nodeRange[0] + parsed.title.range[0],
            nodeRange[0] + parsed.title.range[1],
          ],
          loc: getSourceLocationFromRange(sourceCode, node, [
            nodeRange[0] + parsed.title.range[0],
            nodeRange[0] + parsed.title.range[1],
          ]),
        }
      : null,
  };
}

/**
 * Parse the link definition from the given text.
 */
export function parseLinkDefinitionFromText(text: string): {
  label: {
    text: string;
    range: [number, number];
  };
  destination: {
    type: "pointy-bracketed" | "plain";
    text: string;
    range: [number, number];
  };
  title: {
    type: "double-quoted" | "single-quoted" | "parenthesized";
    text: string;
    range: [number, number];
  } | null;
} | null {
  let index = 0;

  // Skip initial `[`
  if (text[index] !== "[") return null;
  const labelStartIndex = index;
  index++;

  // Find the closing `]`
  if (!skipUntilEnd((c) => c === "]")) return null;
  index++;
  const labelRange: [number, number] = [labelStartIndex, index];
  if (!text.slice(labelRange[0] + 1, labelRange[1] - 1).trim()) return null; // `[]` is not allowed
  if (text[index] !== ":") return null;
  const label = {
    text: text.slice(...labelRange),
    range: labelRange,
  };
  index++;
  skipSpaces();

  let destination: NonNullable<
    ReturnType<typeof parseLinkDefinitionFromText>
  >["destination"];
  const destinationStartIndex = index;
  if (text[index] === "<") {
    // Pointy-bracketed destination
    index++;
    if (!skipUntilEnd((c) => c === ">")) return null;
    index++;
    const destinationRange: [number, number] = [destinationStartIndex, index];
    destination = {
      type: "pointy-bracketed",
      text: text.slice(...destinationRange),
      range: destinationRange,
    };
  } else {
    if (text.length <= index) return null;
    skipUntilEnd((c) => isWhitespace(c) || isAsciiControlCharacter(c));
    const destinationRange: [number, number] = [destinationStartIndex, index];
    destination = {
      type: "plain",
      text: text.slice(...destinationRange),
      range: destinationRange,
    };
  }
  skipSpaces();
  if (text.length <= index) {
    return {
      label,
      destination,
      title: null,
    };
  }

  let title: NonNullable<
    ReturnType<typeof parseLinkDefinitionFromText>
  >["title"];
  const titleStartIndex = index;
  const startChar = text[index];
  if (startChar === "'" || startChar === '"' || startChar === "(") {
    index++;
    const endChar = startChar === "(" ? ")" : startChar;
    if (!skipUntilEnd((c) => c === endChar)) return null;
    index++;
    const titleRange: [number, number] = [titleStartIndex, index];
    title = {
      type:
        startChar === "'"
          ? "single-quoted"
          : startChar === '"'
            ? "double-quoted"
            : "parenthesized",
      text: text.slice(...titleRange),
      range: titleRange,
    };
  } else {
    return null;
  }
  skipSpaces();
  if (index < text.length) {
    // There should be no other characters.
    return null;
  }

  return {
    label,
    destination,
    title,
  };

  /**
   * Skip spaces
   */
  function skipSpaces() {
    while (index < text.length && isWhitespace(text[index])) {
      index++;
    }
  }

  /**
   * Skip until the end by the given condition
   */
  function skipUntilEnd(checkEnd: (c: string) => boolean) {
    while (index < text.length) {
      const c = text[index];
      if (checkEnd(c)) return true;
      index++;
      if (c !== "\\") continue;
      if (
        index < text.length &&
        (text[index] === "\\" || checkEnd(text[index]))
      ) {
        index++;
      }
    }
    return false;
  }
}
