import assert from "node:assert";
import { parseMarkdown } from "../../utils/markdown-parser/parser.ts";
import { parseSetextHeading } from "../../../src/utils/setext-heading.ts";
import type { Heading } from "../../../src/language/ast-types.ts";

function parseSetextHeadingFromTest(code: string) {
  const sourceCode = parseMarkdown(code, { frontmatter: "yaml" })!;
  return parseSetextHeading(sourceCode, sourceCode.ast.children[0] as Heading);
}

describe("utils/setext-heading", () => {
  describe("parseSetextHeading", () => {
    it("should parse a level 1 setext heading", () => {
      const result = parseSetextHeadingFromTest("Heading\n=====");
      assert(result, "should parse heading");
      assert.deepStrictEqual(result, {
        contentLines: [
          {
            text: "Heading",
            range: [0, 7],
            loc: {
              start: { line: 1, column: 1 },
              end: { line: 1, column: 8 },
            },
            raws: {
              prefix: "",
              spaceBefore: "",
              spaceAfter: "",
            },
          },
        ],
        underline: {
          text: "=====",
          range: [8, 13],
          loc: {
            start: { line: 2, column: 1 },
            end: { line: 2, column: 6 },
          },
          marker: "=",
          raws: {
            prefix: "",
            spaceBefore: "",
            spaceAfter: "",
          },
        },
      });
    });

    it("should parse a level 2 setext heading", () => {
      const result = parseSetextHeadingFromTest("Title\n---");
      assert(result, "should parse heading");
      assert.deepStrictEqual(result, {
        contentLines: [
          {
            text: "Title",
            range: [0, 5],
            loc: {
              start: { line: 1, column: 1 },
              end: { line: 1, column: 6 },
            },
            raws: {
              prefix: "",
              spaceBefore: "",
              spaceAfter: "",
            },
          },
        ],
        underline: {
          text: "---",
          range: [6, 9],
          loc: {
            start: { line: 2, column: 1 },
            end: { line: 2, column: 4 },
          },
          marker: "-",
          raws: {
            prefix: "",
            spaceBefore: "",
            spaceAfter: "",
          },
        },
      });
    });

    it("should parse heading with spaces and prefix", () => {
      const result = parseSetextHeadingFromTest(">   Heading\n>   ---");
      assert(result, "should parse heading");
      assert.deepStrictEqual(result, {
        contentLines: [
          {
            text: "Heading",
            range: [4, 11],
            loc: {
              start: { line: 1, column: 5 },
              end: { line: 1, column: 12 },
            },
            raws: {
              prefix: ">",
              spaceBefore: "   ",
              spaceAfter: "",
            },
          },
        ],
        underline: {
          text: "---",
          range: [16, 19],
          loc: {
            start: { line: 2, column: 5 },
            end: { line: 2, column: 8 },
          },
          marker: "-",
          raws: {
            prefix: ">",
            spaceBefore: "   ",
            spaceAfter: "",
          },
        },
      });
    });

    it("should return null for non-setext heading", () => {
      const result = parseSetextHeadingFromTest("# Heading");
      assert.strictEqual(result, null);
    });
  });
});
