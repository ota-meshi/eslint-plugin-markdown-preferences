import assert from "node:assert";
import { parseListItem } from "../../../src/utils/list-item.ts";
import { parseMarkdown } from "../../utils/markdown-parser/parser.ts";
import type { List, ListItem } from "../../../src/language/ast-types.ts";
import type { ExtendedMarkdownSourceCode } from "../../../src/language/extended-markdown-language.ts";

describe("list-item", () => {
  describe("parseListItem", () => {
    it("should parse basic task list with checked checkbox", () => {
      const sourceCode = parseMarkdown("- [x] completed task", {
        frontmatter: "yaml",
      })!;
      const list = sourceCode.ast.children[0] as List;
      const listItem = list.children[0] as ListItem;

      const result = parseListItem(sourceCode, listItem);
      assert.ok(result.taskListItemMarker);
      assert.strictEqual(result.taskListItemMarker.text, "[x]");
    });

    it("should handle edge case with invalid checkbox format", () => {
      // This test targets lines 88-93: invalid checkbox middle character
      const sourceCode = parseMarkdown("dummy", { frontmatter: "yaml" })!;

      // Mock a list item with invalid checkbox format
      const mockListItem = {
        type: "listItem",
        checked: true, // This triggers the checkbox parsing path
        position: {
          start: { line: 1, column: 1, offset: 0 },
          end: { line: 1, column: 20, offset: 19 },
        },
        children: [],
      } as ListItem;

      // Modify source code to test edge case
      const mockSourceCode: ExtendedMarkdownSourceCode = {
        // @ts-expect-error -- Testing edge case
        __proto__: sourceCode,
        text: "- [y] invalid format",
        getRange: () => [0, 20],
      };

      const result = parseListItem(mockSourceCode, mockListItem);
      // Should not recognize invalid checkbox format
      assert.strictEqual(result.taskListItemMarker, null);
    });

    it("should handle edge case with incomplete checkbox bracket", () => {
      // This tests the case where bracket is not closed properly
      const sourceCode = parseMarkdown("dummy", { frontmatter: "yaml" })!;

      const mockListItem = {
        type: "listItem",
        checked: true,
        position: {
          start: { line: 1, column: 1, offset: 0 },
          end: { line: 1, column: 20, offset: 19 },
        },
        children: [],
      } as ListItem;

      const mockSourceCode: ExtendedMarkdownSourceCode = {
        // @ts-expect-error -- Testing edge case
        __proto__: sourceCode,
        text: "- [x incomplete",
        getRange: () => [0, 15],
      };

      const result = parseListItem(mockSourceCode, mockListItem);
      assert.strictEqual(result.taskListItemMarker, null);
    });

    it("should handle edge case with non-space character before bracket", () => {
      // This tests the break condition when encountering non-space/tab before [
      const sourceCode = parseMarkdown("dummy", { frontmatter: "yaml" })!;

      const mockListItem = {
        type: "listItem",
        checked: true,
        position: {
          start: { line: 1, column: 1, offset: 0 },
          end: { line: 1, column: 25, offset: 24 },
        },
        children: [],
      } as ListItem;

      const mockSourceCode: ExtendedMarkdownSourceCode = {
        // @ts-expect-error -- Testing edge case
        __proto__: sourceCode,
        text: "- text[x] not checkbox",
        getRange: () => [0, 25],
      };

      const result = parseListItem(mockSourceCode, mockListItem);
      // Should not find checkbox because 't' comes before '['
      assert.strictEqual(result.taskListItemMarker, null);
    });
  });
});
