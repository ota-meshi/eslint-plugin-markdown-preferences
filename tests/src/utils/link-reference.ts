import assert from "node:assert";
import { parseLinkReference } from "../../../src/utils/link-reference.ts";
import { parseMarkdown } from "../../utils/markdown-parser/parser.ts";
import type {
  LinkReference,
  Paragraph,
} from "../../../src/language/ast-types.ts";
import type { ExtendedMarkdownSourceCode } from "../../../src/language/extended-markdown-language.ts";

describe("link-reference", () => {
  describe("parseLinkReference", () => {
    it("should parse simple link reference", () => {
      // Link references need a definition to be recognized as such
      const sourceCode = parseMarkdown(
        "[text][label]\n\n[label]: http://example.com",
        {
          frontmatter: "yaml",
        },
      )!;
      const paragraph = sourceCode.ast.children[0] as Paragraph;
      const linkRef = paragraph.children[0] as LinkReference;

      const result = parseLinkReference(sourceCode, linkRef);
      assert.ok(result);
      assert.strictEqual(sourceCode.text.slice(...result.text.range), "[text]");
      assert.ok(result.label);
      assert.strictEqual(result.label.type, "full");
      if (result.label.type === "full") {
        assert.strictEqual(result.label.text, "[label]");
      }
    });

    it("should parse link reference with escaped backslashes", () => {
      const sourceCode = parseMarkdown(
        "[text\\\\][label\\\\]\n\n[label\\\\]: http://example.com",
        {
          frontmatter: "yaml",
        },
      )!;
      const paragraph = sourceCode.ast.children[0] as Paragraph;
      const linkRef = paragraph.children[0] as LinkReference;

      const result = parseLinkReference(sourceCode, linkRef);
      assert.ok(result);
      assert.strictEqual(
        sourceCode.text.slice(...result.text.range),
        "[text\\\\]",
      );
      assert.ok(result.label);
      if (result.label.type === "full") {
        assert.strictEqual(result.label.text, "[label\\\\]");
      }
    });

    it("should parse link reference with escaped brackets", () => {
      const sourceCode = parseMarkdown(
        "[text\\]][label\\]]\n\n[label\\]]: http://example.com",
        {
          frontmatter: "yaml",
        },
      )!;
      const paragraph = sourceCode.ast.children[0] as Paragraph;
      const linkRef = paragraph.children[0] as LinkReference;

      const result = parseLinkReference(sourceCode, linkRef);
      assert.ok(result);
      assert.strictEqual(
        sourceCode.text.slice(...result.text.range),
        "[text\\]]",
      );
      assert.ok(result.label);
      if (result.label.type === "full") {
        assert.strictEqual(result.label.text, "[label\\]]");
      }
    });

    it("should handle unclosed label brackets", () => {
      // Create a mock link reference with incomplete label that would fail parsing
      const sourceCode = parseMarkdown("dummy text", {
        frontmatter: "yaml",
      })!;

      // Manually edit the source code text to simulate unclosed bracket scenario
      const mockSourceCode: ExtendedMarkdownSourceCode = {
        // @ts-expect-error -- Testing edge case
        __proto__: sourceCode,
        text: "[text][incomplete",
      };

      const mockLinkRef = {
        type: "linkReference",
        position: {
          start: { line: 1, column: 1, offset: 0 },
          end: { line: 1, column: 18, offset: 17 },
        },
        children: [
          {
            type: "text",
            value: "text",
            position: {
              start: { line: 1, column: 2, offset: 1 },
              end: { line: 1, column: 6, offset: 5 },
            },
          },
        ],
        referenceType: "full",
        identifier: "incomplete",
        label: "incomplete",
      } as LinkReference;

      const result = parseLinkReference(mockSourceCode, mockLinkRef);
      // Should return null for unclosed brackets
      assert.strictEqual(result, null);
    });

    it("should handle edge case with backslash at end of string", () => {
      // Test the case where backslash is at the end and there's no character after it
      const sourceCode = parseMarkdown("dummy text", {
        frontmatter: "yaml",
      })!;

      // Simulate a scenario where label ends with backslash
      const mockSourceCode: ExtendedMarkdownSourceCode = {
        // @ts-expect-error -- Testing edge case
        __proto__: sourceCode,
        text: "[text][label\\",
      };

      const mockLinkRef = {
        type: "linkReference",
        position: {
          start: { line: 1, column: 1, offset: 0 },
          end: { line: 1, column: 14, offset: 13 },
        },
        children: [
          {
            type: "text",
            value: "text",
            position: {
              start: { line: 1, column: 2, offset: 1 },
              end: { line: 1, column: 6, offset: 5 },
            },
          },
        ],
        referenceType: "full",
        identifier: "label\\",
        label: "label\\",
      } as LinkReference;

      const result = parseLinkReference(mockSourceCode, mockLinkRef);
      // Should return null for incomplete reference
      assert.strictEqual(result, null);
    });

    it("should handle various escape sequences in label", () => {
      const sourceCode = parseMarkdown(
        "[text][la\\\\bel\\]test]\n\n[la\\\\bel\\]test]: http://example.com",
        {
          frontmatter: "yaml",
        },
      )!;
      const paragraph = sourceCode.ast.children[0] as Paragraph;
      const linkRef = paragraph.children[0] as LinkReference;

      const result = parseLinkReference(sourceCode, linkRef);
      assert.ok(result);
      assert.strictEqual(sourceCode.text.slice(...result.text.range), "[text]");
      assert.ok(result.label);
      if (result.label.type === "full") {
        assert.strictEqual(result.label.text, "[la\\\\bel\\]test]");
      }
    });
  });
});
