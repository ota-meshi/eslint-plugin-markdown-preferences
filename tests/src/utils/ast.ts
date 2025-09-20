import assert from "node:assert";
import { parseMarkdown } from "../../utils/markdown-parser/parser.ts";
import {
  getHeadingKind,
  getCodeBlockKind,
  getLinkKind,
  getListItemMarker,
  getThematicBreakMarker,
  getSourceLocationFromRange,
} from "../../../src/utils/ast.ts";
import type {
  Heading,
  Code,
  Link,
  ListItem,
  ThematicBreak,
  Paragraph,
  Text,
} from "../../../src/language/ast-types.ts";

describe("utils/ast", () => {
  describe("getHeadingKind", () => {
    it("should return 'atx' for # heading", () => {
      const src = parseMarkdown("# Heading", { frontmatter: "yaml" });
      const node = src!.ast.children[0] as Heading;
      assert.strictEqual(getHeadingKind(src!, node), "atx");
    });
    it("should return 'setext' for setext heading", () => {
      const src = parseMarkdown("Heading\n=====", { frontmatter: "yaml" });
      const node = src!.ast.children[0] as Heading;
      assert.strictEqual(getHeadingKind(src!, node), "setext");
    });
  });

  describe("getCodeBlockKind", () => {
    it("should return 'backtick-fenced' for ``` code block", () => {
      const src = parseMarkdown("```js\ncode\n```", { frontmatter: "yaml" });
      const node = src!.ast.children[0] as Code;
      assert.strictEqual(getCodeBlockKind(src!, node), "backtick-fenced");
    });
    it("should return 'tilde-fenced' for ~~~ code block", () => {
      const src = parseMarkdown("~~~js\ncode\n~~~", { frontmatter: "yaml" });
      const node = src!.ast.children[0] as Code;
      assert.strictEqual(getCodeBlockKind(src!, node), "tilde-fenced");
    });
    it("should return 'indented' for indented code block", () => {
      const src = parseMarkdown("    code", { frontmatter: "yaml" });
      const node = src!.ast.children[0] as Code;
      assert.strictEqual(getCodeBlockKind(src!, node), "indented");
    });
  });

  describe("getLinkKind", () => {
    it("should return 'inline' for [text](url)", () => {
      const src = parseMarkdown("[text](url)", { frontmatter: "yaml" });
      const para = src!.ast.children[0] as Paragraph;
      const node = para.children[0] as Link;
      assert.strictEqual(getLinkKind(src!, node), "inline");
    });
    it("should return 'autolink' for <https://example.com>", () => {
      const src = parseMarkdown("<https://example.com>", {
        frontmatter: "yaml",
      });
      const para = src!.ast.children[0] as Paragraph;
      const node = para.children[0] as Link;
      assert.strictEqual(getLinkKind(src!, node), "autolink");
    });
    it("should return 'gfm-autolink' for gfm autolink", () => {
      const src = parseMarkdown("www.example.com", { frontmatter: "yaml" });
      const para = src!.ast.children[0] as Paragraph;
      const node = para.children[0] as Link;
      assert.strictEqual(getLinkKind(src!, node), "gfm-autolink");
    });
  });

  describe("getListItemMarker", () => {
    it("should return '-' for bullet list", () => {
      const src = parseMarkdown("- item", { frontmatter: "yaml" });
      const list = src!.ast.children[0];
      const node = (list as any).children[0] as ListItem;
      assert.deepStrictEqual(getListItemMarker(src!, node), {
        kind: "-",
        raw: "-",
      });
    });
    it("should return '*' for bullet list", () => {
      const src = parseMarkdown("* item", { frontmatter: "yaml" });
      const list = src!.ast.children[0];
      const node = (list as any).children[0] as ListItem;
      assert.deepStrictEqual(getListItemMarker(src!, node), {
        kind: "*",
        raw: "*",
      });
    });
    it("should return '+' for bullet list", () => {
      const src = parseMarkdown("+ item", { frontmatter: "yaml" });
      const list = src!.ast.children[0];
      const node = (list as any).children[0] as ListItem;
      assert.deepStrictEqual(getListItemMarker(src!, node), {
        kind: "+",
        raw: "+",
      });
    });
    it("should return '.' and sequence for ordered list", () => {
      const src = parseMarkdown("1. item", { frontmatter: "yaml" });
      const list = src!.ast.children[0];
      const node = (list as any).children[0] as ListItem;
      assert.deepStrictEqual(getListItemMarker(src!, node), {
        kind: ".",
        raw: "1.",
        sequence: {
          value: 1,
          raw: "1",
        },
      });
    });
    it("should return ')' and sequence for ordered list", () => {
      const src = parseMarkdown("1) item", { frontmatter: "yaml" });
      const list = src!.ast.children[0];
      const node = (list as any).children[0] as ListItem;
      assert.deepStrictEqual(getListItemMarker(src!, node), {
        kind: ")",
        raw: "1)",
        sequence: {
          value: 1,
          raw: "1",
        },
      });
    });
    it("should work with List node directly", () => {
      const src = parseMarkdown("- item", { frontmatter: "yaml" });
      const list = src!.ast.children[0];
      assert.deepStrictEqual(getListItemMarker(src!, list as any), {
        kind: "-",
        raw: "-",
      });
    });
  });

  describe("getThematicBreakMarker", () => {
    it("should return kind and text for ---", () => {
      const src = parseMarkdown("---", { frontmatter: "yaml" });
      const node = src!.ast.children[0] as ThematicBreak;
      assert.deepStrictEqual(getThematicBreakMarker(src!, node), {
        kind: "-",
        hasSpaces: false,
        text: "---",
      });
    });
    it("should return kind and text for * * *", () => {
      const src = parseMarkdown("* * *", { frontmatter: "yaml" });
      const node = src!.ast.children[0] as ThematicBreak;
      assert.deepStrictEqual(getThematicBreakMarker(src!, node), {
        kind: "*",
        hasSpaces: true,
        text: "* * *",
      });
    });
    it("should handle trailing spaces", () => {
      const src = parseMarkdown("---   ", { frontmatter: "yaml" });
      const node = src!.ast.children[0] as ThematicBreak;
      assert.deepStrictEqual(getThematicBreakMarker(src!, node), {
        kind: "-",
        hasSpaces: false,
        text: "---",
      });
    });
    it("should return kind and text for ___", () => {
      const src = parseMarkdown("___", { frontmatter: "yaml" });
      const node = src!.ast.children[0] as ThematicBreak;
      assert.deepStrictEqual(getThematicBreakMarker(src!, node), {
        kind: "_",
        hasSpaces: false,
        text: "___",
      });
    });
    it("should return kind and text for _ _ _", () => {
      const src = parseMarkdown("_ _ _", { frontmatter: "yaml" });
      const node = src!.ast.children[0] as ThematicBreak;
      assert.deepStrictEqual(getThematicBreakMarker(src!, node), {
        kind: "_",
        hasSpaces: true,
        text: "_ _ _",
      });
    });
  });

  describe("getSourceLocationFromRange", () => {
    it("should return correct location for text node", () => {
      const src = parseMarkdown("abc\ndef", { frontmatter: "yaml" });
      const para = src!.ast.children[0] as Paragraph;
      const node = para.children[0] as Text;
      const loc = getSourceLocationFromRange(src!, node, [0, 3]);
      assert.deepStrictEqual(loc, {
        start: { line: 1, column: 1 },
        end: { line: 1, column: 4 },
      });
    });
    it("should return correct location for multiline range", () => {
      const src = parseMarkdown("abc\ndef", { frontmatter: "yaml" });
      const para = src!.ast.children[0] as Paragraph;
      const node = para.children[0] as Text;
      const loc = getSourceLocationFromRange(src!, node, [0, 7]);
      assert.deepStrictEqual(loc, {
        start: { line: 1, column: 1 },
        end: { line: 2, column: 4 },
      });
    });
  });
});
