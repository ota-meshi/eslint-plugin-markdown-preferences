import assert from "assert";
import { parseExtendedMarkdown } from "../../../../src/language/parser.ts";
import type { ImportCodeSnippet } from "../../../../src/language/ast-types.ts";

describe("parseExtendedMarkdown with Import Code Snippet", () => {
  describe("valid import code snippets", () => {
    it("should parse basic import code snippet", () => {
      const markdown = "<<< ./path/to/file.js";
      const ast = parseExtendedMarkdown(markdown);

      assert.strictEqual(ast.children.length, 1);
      const importNode = ast.children[0] as ImportCodeSnippet;
      assert.strictEqual(importNode.type, "importCodeSnippet");
      assert.strictEqual(importNode.value, "./path/to/file.js");
    });

    it("should parse import code snippet with spaces after marker", () => {
      const markdown = "<<<    ./path/to/file.ts";
      const ast = parseExtendedMarkdown(markdown);

      assert.strictEqual(ast.children.length, 1);
      const importNode = ast.children[0] as ImportCodeSnippet;
      assert.strictEqual(importNode.type, "importCodeSnippet");
      assert.strictEqual(importNode.value, "./path/to/file.ts");
    });

    it("should parse import code snippet with relative path", () => {
      const markdown = "<<< ../parent/file.vue";
      const ast = parseExtendedMarkdown(markdown);

      assert.strictEqual(ast.children.length, 1);
      const importNode = ast.children[0] as ImportCodeSnippet;
      assert.strictEqual(importNode.type, "importCodeSnippet");
      assert.strictEqual(importNode.value, "../parent/file.vue");
    });

    it("should parse import code snippet with absolute path", () => {
      const markdown = "<<< /absolute/path/to/file.py";
      const ast = parseExtendedMarkdown(markdown);

      assert.strictEqual(ast.children.length, 1);
      const importNode = ast.children[0] as ImportCodeSnippet;
      assert.strictEqual(importNode.type, "importCodeSnippet");
      assert.strictEqual(importNode.value, "/absolute/path/to/file.py");
    });

    it("should parse import code snippet with complex filename", () => {
      const markdown = "<<< ./file-name_with.special-chars123.js";
      const ast = parseExtendedMarkdown(markdown);

      assert.strictEqual(ast.children.length, 1);
      const importNode = ast.children[0] as ImportCodeSnippet;
      assert.strictEqual(importNode.type, "importCodeSnippet");
      assert.strictEqual(
        importNode.value,
        "./file-name_with.special-chars123.js",
      );
    });

    it("should parse multiple import code snippets", () => {
      const markdown = `<<< ./file1.js

<<< ./file2.ts`;
      const ast = parseExtendedMarkdown(markdown);

      assert.strictEqual(ast.children.length, 2);

      const firstImport = ast.children[0] as ImportCodeSnippet;
      assert.strictEqual(firstImport.type, "importCodeSnippet");
      assert.strictEqual(firstImport.value, "./file1.js");

      const secondImport = ast.children[1] as ImportCodeSnippet;
      assert.strictEqual(secondImport.type, "importCodeSnippet");
      assert.strictEqual(secondImport.value, "./file2.ts");
    });

    it("should parse import code snippet mixed with other content", () => {
      const markdown = `# Heading

Some paragraph text.

<<< ./example.js

More content here.`;
      const ast = parseExtendedMarkdown(markdown);

      assert.strictEqual(ast.children.length, 4);
      assert.strictEqual(ast.children[0].type, "heading");
      assert.strictEqual(ast.children[1].type, "paragraph");

      const importNode = ast.children[2] as ImportCodeSnippet;
      assert.strictEqual(importNode.type, "importCodeSnippet");
      assert.strictEqual(importNode.value, "./example.js");

      assert.strictEqual(ast.children[3].type, "paragraph");
    });
  });

  describe("edge cases and invalid syntax", () => {
    it("should not parse with less than 3 angle brackets", () => {
      const markdown = "<< ./path/to/file.js";
      const ast = parseExtendedMarkdown(markdown);

      // Should be parsed as a paragraph with text content
      assert.strictEqual(ast.children.length, 1);
      assert.strictEqual(ast.children[0].type, "paragraph");
    });

    it("should not parse with mixed angle brackets", () => {
      const markdown = "< << ./path/to/file.js";
      const ast = parseExtendedMarkdown(markdown);

      // Should be parsed as a paragraph with text content
      assert.strictEqual(ast.children.length, 1);
      assert.strictEqual(ast.children[0].type, "paragraph");
    });

    it("should handle empty path after marker", () => {
      const markdown = "<<<";
      const ast = parseExtendedMarkdown(markdown);

      // Should be parsed as paragraph since no path is provided
      assert.strictEqual(ast.children.length, 1);
      assert.strictEqual(ast.children[0].type, "paragraph");
    });

    it("should handle only spaces after marker", () => {
      const markdown = "<<<   ";
      const ast = parseExtendedMarkdown(markdown);

      // Should be parsed as paragraph since no path is provided
      assert.strictEqual(ast.children.length, 1);
      assert.strictEqual(ast.children[0].type, "paragraph");
    });

    it("should parse with trailing spaces after path", () => {
      const markdown = "<<< ./file.js   ";
      const ast = parseExtendedMarkdown(markdown);

      assert.strictEqual(ast.children.length, 1);
      const importNode = ast.children[0] as ImportCodeSnippet;
      assert.strictEqual(importNode.type, "importCodeSnippet");
      assert.strictEqual(importNode.value, "./file.js");
    });

    it("should handle import code snippet followed by line break", () => {
      const markdown = "<<< ./file.js\n\nNext paragraph";
      const ast = parseExtendedMarkdown(markdown);

      assert.strictEqual(ast.children.length, 2);

      const importNode = ast.children[0] as ImportCodeSnippet;
      assert.strictEqual(importNode.type, "importCodeSnippet");
      assert.strictEqual(importNode.value, "./file.js");

      assert.strictEqual(ast.children[1].type, "paragraph");
    });

    it("should not parse when marker is indented", () => {
      const markdown = "    <<< ./file.js";
      const ast = parseExtendedMarkdown(markdown);

      // Should be parsed as code block since it's indented
      assert.strictEqual(ast.children.length, 1);
      assert.strictEqual(ast.children[0].type, "code");
    });

    it("should not parse when marker is inside other blocks", () => {
      const markdown = "> <<< ./file.js";
      const ast = parseExtendedMarkdown(markdown);

      // Should be parsed as blockquote containing paragraph
      assert.strictEqual(ast.children.length, 1);
      assert.strictEqual(ast.children[0].type, "blockquote");
    });

    it("should not parse when marker has text before it", () => {
      const markdown = "Some text <<< ./file.js";
      const ast = parseExtendedMarkdown(markdown);

      // Should be parsed as paragraph since marker is not at start of line
      assert.strictEqual(ast.children.length, 1);
      assert.strictEqual(ast.children[0].type, "paragraph");
    });

    it("should not parse when marker has characters before it", () => {
      const markdown = "abc<<< ./file.js";
      const ast = parseExtendedMarkdown(markdown);

      // Should be parsed as paragraph since marker is not at start of line
      assert.strictEqual(ast.children.length, 1);
      assert.strictEqual(ast.children[0].type, "paragraph");
    });

    it("should not parse paths with spaces as import code snippet", () => {
      const markdown = "<<< ./path with spaces/file.js";
      const ast = parseExtendedMarkdown(markdown);

      // Paths with spaces should not be recognized as import code snippets
      // and should be parsed as regular paragraph text
      assert.strictEqual(ast.children.length, 1);
      assert.strictEqual(ast.children[0].type, "paragraph");
    });

    it("should parse with more than 3 angle brackets", () => {
      const markdown = "<<<< ./file.js";
      const ast = parseExtendedMarkdown(markdown);

      assert.strictEqual(ast.children.length, 1);
      const importNode = ast.children[0] as ImportCodeSnippet;
      assert.strictEqual(importNode.type, "importCodeSnippet");
      assert.strictEqual(importNode.value, "./file.js");
    });

    it("should handle path with query parameters", () => {
      const markdown = "<<< ./file.js?lines=1-10";
      const ast = parseExtendedMarkdown(markdown);

      assert.strictEqual(ast.children.length, 1);
      const importNode = ast.children[0] as ImportCodeSnippet;
      assert.strictEqual(importNode.type, "importCodeSnippet");
      assert.strictEqual(importNode.value, "./file.js?lines=1-10");
    });

    it("should handle path with hash fragment", () => {
      const markdown = "<<< ./file.js#L1-L10";
      const ast = parseExtendedMarkdown(markdown);

      assert.strictEqual(ast.children.length, 1);
      const importNode = ast.children[0] as ImportCodeSnippet;
      assert.strictEqual(importNode.type, "importCodeSnippet");
      assert.strictEqual(importNode.value, "./file.js#L1-L10");
    });
  });

  describe("position information", () => {
    it("should have correct position information", () => {
      const markdown = "<<< ./file.js";
      const ast = parseExtendedMarkdown(markdown);

      const importNode = ast.children[0] as ImportCodeSnippet;
      assert.ok(importNode.position);
      assert.strictEqual(importNode.position.start.line, 1);
      assert.strictEqual(importNode.position.start.column, 1);
      assert.strictEqual(importNode.position.end.line, 1);
      assert.strictEqual(importNode.position.end.column, 14); // "<<< ./file.js" is 13 characters, end is exclusive
    });

    it("should have correct position for multiline document", () => {
      const markdown = `# Title

<<< ./example.js

End`;
      const ast = parseExtendedMarkdown(markdown);

      const importNode = ast.children[1] as ImportCodeSnippet;
      assert.ok(importNode.position);
      assert.strictEqual(importNode.position.start.line, 3);
      assert.strictEqual(importNode.position.start.column, 1);
      assert.strictEqual(importNode.position.end.line, 3);
      assert.strictEqual(importNode.position.end.column, 17); // "<<< ./example.js" is 16 characters, end column is 17
    });
  });
});
