import type { ExtendedMarkdownSourceCode } from "../language/extended-markdown-ianguage.ts";
import type { SourceLocation } from "estree";
import type { ListItem } from "../language/ast-types.ts";
import { isAsciiControlCharacter, isSpaceOrTab } from "./unicode.ts";
import type { BulletListMarkerKind, OrderedListMarkerKind } from "./ast.ts";
import { getListItemMarker, getSourceLocationFromRange } from "./ast.ts";
import { ForwardCharacterCursor } from "./character-cursor.ts";

export type ParsedBulletListMarker = {
  kind: BulletListMarkerKind;
  text: string;
  range: [number, number];
  loc: SourceLocation;
};
export type ParsedOrderedListMarker = {
  kind: OrderedListMarkerKind;
  text: string;
  value: number;
  range: [number, number];
  loc: SourceLocation;
};
export type ParsedListItem = {
  marker: ParsedBulletListMarker | ParsedOrderedListMarker;
  taskListItemMarker: {
    text: string;
    range: [number, number];
    loc: SourceLocation;
  } | null;
};
/**
 * Parse the list item.
 */
export function parseListItem(
  sourceCode: ExtendedMarkdownSourceCode,
  node: ListItem,
): ParsedListItem {
  const marker = getListItemMarker(sourceCode, node);
  const nodeRange = sourceCode.getRange(node);
  const markerRange: [number, number] = [
    nodeRange[0],
    nodeRange[0] + marker.raw.length,
  ];
  const parsedMarker: ParsedBulletListMarker | ParsedOrderedListMarker =
    marker.kind === "." || marker.kind === ")"
      ? {
          kind: marker.kind,
          text: marker.raw,
          value: marker.sequence.value,
          range: markerRange,
          loc: getSourceLocationFromRange(sourceCode, node, markerRange),
        }
      : {
          kind: marker.kind,
          text: marker.raw,
          range: markerRange,
          loc: getSourceLocationFromRange(sourceCode, node, markerRange),
        };
  if (node.checked == null) {
    return {
      marker: parsedMarker,
      taskListItemMarker: null,
    };
  }
  for (
    let index = nodeRange[0] + marker.raw.length;
    index < nodeRange[1];
    index++
  ) {
    const c = sourceCode.text[index];
    if (isSpaceOrTab(c)) continue;
    if (c !== "[") break;
    const middle = sourceCode.text[index + 1];
    if (middle !== "x" && middle !== " ") break;
    if (sourceCode.text[index + 2] !== "]") break;
    const taskListItemMarkerRange: [number, number] = [index, index + 3];
    return {
      marker: parsedMarker,
      taskListItemMarker: {
        text: sourceCode.text.slice(...taskListItemMarkerRange),
        range: taskListItemMarkerRange,
        loc: getSourceLocationFromRange(
          sourceCode,
          node,
          taskListItemMarkerRange,
        ),
      },
    };
  }

  return {
    marker: parsedMarker,
    taskListItemMarker: null,
  };
}

/**
 * Parse the inline link destination and link title from the given text.
 */
export function parseInlineLinkDestAndTitleFromText(text: string): {
  openingParen: {
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
  closingParen: {
    range: [number, number];
  };
} | null {
  // Skip initial `(`
  if (!text.startsWith("(")) return null;
  const cursor = new ForwardCharacterCursor(text);
  cursor.next();
  cursor.skipSpaces();

  let destination: NonNullable<
    ReturnType<typeof parseInlineLinkDestAndTitleFromText>
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
      (c, i) =>
        cursor.isWhitespace(i) || isAsciiControlCharacter(c) || c === ")",
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
  if (cursor.curr() === ")") {
    const closingParenStartIndex = cursor.currIndex();
    cursor.next();
    cursor.skipSpaces();
    if (!cursor.finished()) {
      // There should be no other characters.
      return null;
    }
    return {
      openingParen: {
        range: [0, 1],
      },
      destination,
      title: null,
      closingParen: {
        range: [closingParenStartIndex, closingParenStartIndex + 1],
      },
    };
  }
  if (cursor.finished()) {
    return null;
  }

  let title: NonNullable<
    ReturnType<typeof parseInlineLinkDestAndTitleFromText>
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
  if (cursor.curr() !== ")") return null;
  const closingParenStartIndex = cursor.currIndex();
  cursor.next();
  cursor.skipSpaces();
  if (!cursor.finished()) {
    // There should be no other characters.
    return null;
  }

  return {
    openingParen: {
      range: [0, 1],
    },
    destination,
    title,
    closingParen: {
      range: [closingParenStartIndex, closingParenStartIndex + 1],
    },
  };
}
