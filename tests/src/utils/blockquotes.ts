import assert from "node:assert";
import { parseMarkdown } from "../../utils/markdown-parser/parser.ts";
import { getBlockquoteLevelFromLine } from "../../../src/utils/blockquotes.ts";
import type { MarkdownSourceCode } from "@eslint/markdown";

describe("utils/blockquotes", () => {
  function getSrc(md: string): MarkdownSourceCode {
    return parseMarkdown(md, { frontmatter: "yaml" })!;
  }

  it("should handle empty line", () => {
    const src = getSrc("");
    const info = getBlockquoteLevelFromLine(src, 1);
    assert.strictEqual(info.level, 0);
    assert.strictEqual(info.prefix, "");
    assert.deepStrictEqual([...info.blockquoteMarkers], []);
  });

  it("should handle whitespace only line", () => {
    const src = getSrc("   ");
    const info = getBlockquoteLevelFromLine(src, 1);
    assert.strictEqual(info.level, 0);
    assert.strictEqual(info.prefix, "   ");
    assert.deepStrictEqual([...info.blockquoteMarkers], []);
  });

  it("should handle blockquote only (>)", () => {
    const src = getSrc(">");
    const info = getBlockquoteLevelFromLine(src, 1);
    assert.strictEqual(info.level, 1);
    assert.strictEqual(info.prefix, ">");
    assert.deepStrictEqual([...info.blockquoteMarkers], [[1, { index: 0 }]]);
  });

  it("should handle blockquote only with spaces (>'   ')", () => {
    const src = getSrc(">   ");
    const info = getBlockquoteLevelFromLine(src, 1);
    assert.strictEqual(info.level, 1);
    assert.strictEqual(info.prefix, ">   ");
    assert.deepStrictEqual([...info.blockquoteMarkers], [[1, { index: 0 }]]);
  });

  it("should handle blockquote with only marker and newline (>'\\n')", () => {
    const src = getSrc(">\ntext");
    const info = getBlockquoteLevelFromLine(src, 1);
    assert.strictEqual(info.level, 1);
    assert.strictEqual(info.prefix, ">");
    assert.deepStrictEqual([...info.blockquoteMarkers], [[1, { index: 0 }]]);
  });

  it("should handle line with tab before blockquote", () => {
    const src = getSrc("\t> text");
    const info = getBlockquoteLevelFromLine(src, 1);
    assert.strictEqual(info.level, 0);
    assert.strictEqual(info.prefix, "\t");
    assert.deepStrictEqual([...info.blockquoteMarkers], []);
  });

  it("should handle line with multiple spaces and tabs before blockquote", () => {
    const src = getSrc(" \t  > text");
    const info = getBlockquoteLevelFromLine(src, 1);
    assert.strictEqual(info.level, 0);
    assert.strictEqual(info.prefix, " \t  ");
    assert.deepStrictEqual([...info.blockquoteMarkers], []);
  });

  it("should stop at first non-space non-> character", () => {
    const src = getSrc("> >x text");
    const info = getBlockquoteLevelFromLine(src, 1);
    assert.strictEqual(info.level, 2);
    assert.strictEqual(info.prefix, "> >");
    assert.deepStrictEqual(
      [...info.blockquoteMarkers],
      [
        [1, { index: 0 }],
        [2, { index: 2 }],
      ],
    );
  });

  it("should return level 0 for no blockquote", () => {
    const src = getSrc("text");
    const info = getBlockquoteLevelFromLine(src, 1);
    assert.strictEqual(info.level, 0);
    assert.strictEqual(info.prefix, "");
    assert.deepStrictEqual([...info.blockquoteMarkers], []);
  });

  it("should return level 1 for single blockquote", () => {
    const src = getSrc("> text");
    const info = getBlockquoteLevelFromLine(src, 1);
    assert.strictEqual(info.level, 1);
    assert.strictEqual(info.prefix, "> ");
    assert.deepStrictEqual([...info.blockquoteMarkers], [[1, { index: 0 }]]);
  });

  it("should return level 2 for nested blockquote", () => {
    const src = getSrc("> > text");
    const info = getBlockquoteLevelFromLine(src, 1);
    assert.strictEqual(info.level, 2);
    assert.strictEqual(info.prefix, "> > ");
    assert.deepStrictEqual(
      [...info.blockquoteMarkers],
      [
        [1, { index: 0 }],
        [2, { index: 2 }],
      ],
    );
  });

  it("should handle blockquote with no space after >", () => {
    const src = getSrc(">text");
    const info = getBlockquoteLevelFromLine(src, 1);
    assert.strictEqual(info.level, 1);
    assert.strictEqual(info.prefix, ">");
    assert.deepStrictEqual([...info.blockquoteMarkers], [[1, { index: 0 }]]);
  });

  it("should handle blockquote with leading spaces", () => {
    const src = getSrc("   > text");
    const info = getBlockquoteLevelFromLine(src, 1);
    assert.strictEqual(info.level, 1);
    assert.strictEqual(info.prefix, "   > ");
    assert.deepStrictEqual([...info.blockquoteMarkers], [[1, { index: 3 }]]);
  });

  it("should handle blockquote with leading 4 spaces", () => {
    const src = getSrc("    > text");
    const info = getBlockquoteLevelFromLine(src, 1);
    assert.strictEqual(info.level, 0);
    assert.strictEqual(info.prefix, "    ");
    assert.deepStrictEqual([...info.blockquoteMarkers], []);
  });

  it("should handle blockquote with 4 spaces between markers", () => {
    const src = getSrc(">    > text");
    const info = getBlockquoteLevelFromLine(src, 1);
    assert.strictEqual(info.level, 2);
    assert.strictEqual(info.prefix, ">    > ");
    assert.deepStrictEqual(
      [...info.blockquoteMarkers],
      [
        [1, { index: 0 }],
        [2, { index: 5 }],
      ],
    );
  });

  it("should handle blockquote with 5 spaces between markers", () => {
    const src = getSrc(">     > text");
    const info = getBlockquoteLevelFromLine(src, 1);
    assert.strictEqual(info.level, 1);
    assert.strictEqual(info.prefix, ">     ");
    assert.deepStrictEqual([...info.blockquoteMarkers], [[1, { index: 0 }]]);
  });

  it("should handle deeply nested blockquotes", () => {
    const src = getSrc("> > > > text");
    const info = getBlockquoteLevelFromLine(src, 1);
    assert.strictEqual(info.level, 4);
    assert.strictEqual(info.prefix, "> > > > ");
    assert.deepStrictEqual(
      [...info.blockquoteMarkers],
      [
        [1, { index: 0 }],
        [2, { index: 2 }],
        [3, { index: 4 }],
        [4, { index: 6 }],
      ],
    );
  });

  it("should cache results per sourceCode and line", () => {
    const src = getSrc("> text\n> text2");
    const info1 = getBlockquoteLevelFromLine(src, 1);
    const info2 = getBlockquoteLevelFromLine(src, 1);
    assert.strictEqual(info1, info2);
    const info3 = getBlockquoteLevelFromLine(src, 2);
    assert.notStrictEqual(info1, info3);
  });
});
