import type { MarkdownSourceCode } from "@eslint/markdown";
import type { SourceLocation } from "estree";
import type { Definition } from "mdast";
import { isAsciiControlCharacter } from "./unicode.ts";
import { getSourceLocationFromRange } from "./ast.ts";
import { ForwardCharacterCursor } from "./character-cursor.ts";

export type ParsedLinkDefinition = {
  label: {
    text: string;
    range: [number, number];
    loc: SourceLocation;
  };
  destination: {
    type: "pointy-bracketed" | "bare";
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
    type: "pointy-bracketed" | "bare";
    text: string;
    range: [number, number];
  };
  title: {
    type: "double-quoted" | "single-quoted" | "parenthesized";
    text: string;
    range: [number, number];
  } | null;
} | null {
  // Skip initial `[`
  if (!text.startsWith("[")) return null;
  const cursor = new ForwardCharacterCursor(text);
  const labelStartIndex = 0;
  cursor.next();

  // Find the closing `]`
  if (!cursor.skipUntilEnd((c) => c === "]")) return null;
  cursor.next();
  const labelRange: [number, number] = [labelStartIndex, cursor.currIndex()];
  if (!text.slice(labelRange[0] + 1, labelRange[1] - 1).trim()) return null; // `[]` is not allowed
  if (cursor.curr() !== ":") return null;
  const label = {
    text: text.slice(...labelRange),
    range: labelRange,
  };
  cursor.next();
  cursor.skipSpaces();

  let destination: NonNullable<
    ReturnType<typeof parseLinkDefinitionFromText>
  >["destination"];
  const destinationStartIndex = cursor.currIndex();
  if (cursor.curr() === "<") {
    // Pointy-bracketed destination
    cursor.next();
    if (!cursor.skipUntilEnd((c) => c === ">")) return null;
    cursor.next();
    const destinationRange: [number, number] = [
      destinationStartIndex,
      cursor.currIndex(),
    ];
    destination = {
      type: "pointy-bracketed",
      text: text.slice(...destinationRange),
      range: destinationRange,
    };
  } else {
    if (cursor.finished()) return null;
    cursor.skipUntilEnd(
      (c, i) => cursor.isWhitespace(i) || isAsciiControlCharacter(c),
    );
    const destinationRange: [number, number] = [
      destinationStartIndex,
      cursor.currIndex(),
    ];
    destination = {
      type: "bare",
      text: text.slice(...destinationRange),
      range: destinationRange,
    };
  }
  cursor.skipSpaces();
  if (cursor.finished()) {
    return {
      label,
      destination,
      title: null,
    };
  }

  let title: NonNullable<
    ReturnType<typeof parseLinkDefinitionFromText>
  >["title"];
  const titleStartIndex = cursor.currIndex();
  const startChar = cursor.curr();
  if (startChar === "'" || startChar === '"' || startChar === "(") {
    cursor.next();
    const endChar = startChar === "(" ? ")" : startChar;
    if (!cursor.skipUntilEnd((c) => c === endChar)) return null;
    cursor.next();
    const titleRange: [number, number] = [titleStartIndex, cursor.currIndex()];
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
  cursor.skipSpaces();
  if (!cursor.finished()) {
    // There should be no other characters.
    return null;
  }

  return {
    label,
    destination,
    title,
  };
}
