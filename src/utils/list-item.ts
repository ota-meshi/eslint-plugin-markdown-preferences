import type { ExtendedMarkdownSourceCode } from "../language/extended-markdown-language.ts";
import type { ListItem } from "../language/ast-types.ts";
import { isSpaceOrTab } from "./unicode.ts";
import type { BulletListMarkerKind, OrderedListMarkerKind } from "./ast.ts";
import { getListItemMarker } from "./ast.ts";

export type ParsedBulletListMarker = {
  kind: BulletListMarkerKind;
  text: string;
  range: [number, number];
};
export type ParsedOrderedListMarker = {
  kind: OrderedListMarkerKind;
  text: string;
  value: number;
  range: [number, number];
};
export type ParsedListItem = {
  marker: ParsedBulletListMarker | ParsedOrderedListMarker;
  taskListItemMarker: {
    text: string;
    range: [number, number];
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
        }
      : {
          kind: marker.kind,
          text: marker.raw,
          range: markerRange,
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
      },
    };
  }

  return {
    marker: parsedMarker,
    taskListItemMarker: null,
  };
}
