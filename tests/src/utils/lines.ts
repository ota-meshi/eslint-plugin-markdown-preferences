import assert from "node:assert";
import { getParsedLines } from "../../../src/utils/lines.ts";
import { parseMarkdown } from "../../utils/markdown-parser/parser.ts";

describe("lines", () => {
  describe("ParsedLines", () => {
    it("should parse lines with Unix line endings", () => {
      const sourceCode = parseMarkdown("line1\nline2\nline3", {
        frontmatter: "yaml",
      })!;
      const parsedLines = getParsedLines(sourceCode);

      assert.strictEqual(parsedLines.length, 3);

      const line1 = parsedLines.get(1);
      assert.strictEqual(line1.text, "line1");
      assert.deepStrictEqual(line1.range, [0, 6]);
      assert.strictEqual(line1.line, 1);
      assert.strictEqual(line1.linebreak, "\n");

      const line2 = parsedLines.get(2);
      assert.strictEqual(line2.text, "line2");
      assert.deepStrictEqual(line2.range, [6, 12]);
      assert.strictEqual(line2.line, 2);
      assert.strictEqual(line2.linebreak, "\n");

      const line3 = parsedLines.get(3);
      assert.strictEqual(line3.text, "line3");
      assert.deepStrictEqual(line3.range, [12, 17]);
      assert.strictEqual(line3.line, 3);
      assert.strictEqual(line3.linebreak, "");
    });

    it("should parse lines with Windows line endings (CRLF)", () => {
      const sourceCode = parseMarkdown("line1\r\nline2\r\n", {
        frontmatter: "yaml",
      })!;
      const parsedLines = getParsedLines(sourceCode);

      assert.strictEqual(parsedLines.length, 2);

      const line1 = parsedLines.get(1);
      assert.strictEqual(line1.text, "line1");
      assert.deepStrictEqual(line1.range, [0, 7]);
      assert.strictEqual(line1.line, 1);
      assert.strictEqual(line1.linebreak, "\r\n");

      const line2 = parsedLines.get(2);
      assert.strictEqual(line2.text, "line2");
      assert.deepStrictEqual(line2.range, [7, 14]);
      assert.strictEqual(line2.line, 2);
      assert.strictEqual(line2.linebreak, "\r\n");
    });

    it("should parse lines with Mac classic line endings (CR only)", () => {
      // Note: In Markdown, single CR is treated as normal text character, not a line break
      // This test verifies that CR characters are properly handled in the text content
      const sourceCode = parseMarkdown("line1\rline2\r", {
        frontmatter: "yaml",
      })!;
      const parsedLines = getParsedLines(sourceCode);

      assert.strictEqual(parsedLines.length, 1);

      const line1 = parsedLines.get(1);
      // The actual parsed text is "line1\rline2" (trailing \r removed by parser)
      assert.strictEqual(line1.text, "line1\rline2");
      assert.deepStrictEqual(line1.range, [0, 12]);
      assert.strictEqual(line1.line, 1);
      assert.strictEqual(line1.linebreak, "\r");
    });

    it("should handle empty lines", () => {
      const sourceCode = parseMarkdown("line1\n\nline3", {
        frontmatter: "yaml",
      })!;
      const parsedLines = getParsedLines(sourceCode);

      assert.strictEqual(parsedLines.length, 3);

      const line1 = parsedLines.get(1);
      assert.strictEqual(line1.text, "line1");
      assert.strictEqual(line1.linebreak, "\n");

      const line2 = parsedLines.get(2);
      assert.strictEqual(line2.text, "");
      assert.strictEqual(line2.linebreak, "\n");

      const line3 = parsedLines.get(3);
      assert.strictEqual(line3.text, "line3");
      assert.strictEqual(line3.linebreak, "");
    });

    it("should handle single line without line ending", () => {
      const sourceCode = parseMarkdown("single line", {
        frontmatter: "yaml",
      })!;
      const parsedLines = getParsedLines(sourceCode);

      assert.strictEqual(parsedLines.length, 1);

      const line1 = parsedLines.get(1);
      assert.strictEqual(line1.text, "single line");
      assert.deepStrictEqual(line1.range, [0, 11]);
      assert.strictEqual(line1.line, 1);
      assert.strictEqual(line1.linebreak, "");
    });

    it("should be iterable", () => {
      const sourceCode = parseMarkdown("line1\nline2", {
        frontmatter: "yaml",
      })!;
      const parsedLines = getParsedLines(sourceCode);

      const lines = [...parsedLines];
      assert.strictEqual(lines.length, 2);
      assert.strictEqual(lines[0].text, "line1");
      assert.strictEqual(lines[1].text, "line2");
    });

    it("should cache parsed lines", () => {
      const sourceCode = parseMarkdown("line1\nline2", {
        frontmatter: "yaml",
      })!;
      const parsedLines1 = getParsedLines(sourceCode);
      const parsedLines2 = getParsedLines(sourceCode);

      // Should return the same instance from cache
      assert.strictEqual(parsedLines1, parsedLines2);
    });

    // Edge cases to improve coverage
    it("should handle line ending with only carriage return followed by newline", () => {
      // This test specifically targets the \r handling logic (lines 27-29)
      const sourceCode = parseMarkdown("test\r\n", {
        frontmatter: "yaml",
      })!;
      const parsedLines = getParsedLines(sourceCode);

      const line = parsedLines.get(1);
      assert.strictEqual(line.text, "test");
      assert.strictEqual(line.linebreak, "\r\n");
    });

    it("should handle mixed line endings", () => {
      const sourceCode = parseMarkdown("line1\r\nline2\nline3\r", {
        frontmatter: "yaml",
      })!;
      const parsedLines = getParsedLines(sourceCode);

      assert.strictEqual(parsedLines.length, 3);

      const line1 = parsedLines.get(1);
      assert.strictEqual(line1.linebreak, "\r\n");

      const line2 = parsedLines.get(2);
      assert.strictEqual(line2.linebreak, "\n");

      const line3 = parsedLines.get(3);
      assert.strictEqual(line3.linebreak, "\r");
    });
  });
});
