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
