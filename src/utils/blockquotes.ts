import type { MarkdownSourceCode } from "@eslint/markdown";
import { isSpaceOrTab } from "./unicode.ts";

export type BlockquoteMarkerInfo = {
  index: number;
};
export type BlockquoteLevelInfo = {
  line: number;
  prefix: string;
  level: number;
  blockquoteMarkers: Map<number, BlockquoteMarkerInfo>;
};

const cache = new WeakMap<
  MarkdownSourceCode,
  Map<number, BlockquoteLevelInfo>
>();

/**
 * Helper function to get blockquote level information.
 */
export function getBlockquoteLevelFromLine(
  sourceCode: MarkdownSourceCode,
  lineNumber: number,
): BlockquoteLevelInfo {
  let map = cache.get(sourceCode);
  if (!map) {
    map = new Map();
    cache.set(sourceCode, map);
  }
  const cached = map.get(lineNumber);
  if (cached) return cached;
  const lineText = sourceCode.lines[lineNumber - 1];
  let prefix = "";
  let level = 0;

  let width = 0;
  let leadingMarkerOffset = 0;
  const blockquoteMarkers = new Map<number, BlockquoteMarkerInfo>();
  for (const c of lineText) {
    if (c === ">") {
      if (width - leadingMarkerOffset > 3) break;
      leadingMarkerOffset = width + 1;

      level++;
      blockquoteMarkers.set(level, {
        index: prefix.length,
      });
    } else if (!isSpaceOrTab(c)) {
      break;
    }

    if (c === "\t") {
      width += 4 - (width % 4);
    } else {
      width++;
    }
    if (c !== ">" && prefix.at(-1) === ">") {
      leadingMarkerOffset++;
    }
    prefix += c;
  }
  const result: BlockquoteLevelInfo = {
    line: lineNumber,
    prefix,
    level,
    blockquoteMarkers,
  };
  map.set(lineNumber, result);
  return result;
}
