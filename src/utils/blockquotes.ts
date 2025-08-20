import type { MarkdownSourceCode } from "@eslint/markdown";

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
  const blockquoteMarkers = new Map<number, BlockquoteMarkerInfo>();
  for (const c of lineText) {
    if (c === ">") {
      level++;
      blockquoteMarkers.set(level, {
        index: prefix.length,
      });
    } else if (c.trim()) {
      break;
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
