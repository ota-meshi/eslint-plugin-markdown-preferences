import assert from "node:assert";
import { ExtendedMarkdownLanguage } from "../../../src/language/extended-markdown-language.ts";

describe("ExtendedMarkdownLanguage", () => {
  it("should handle parse errors gracefully", () => {
    const language = new ExtendedMarkdownLanguage();

    // Test with extremely malformed input that might cause parser issues
    // We'll try to trigger an error by passing an object instead of string
    const mockFile = {
      body: null as any, // This might cause parsing to fail
      ok: true,
      errors: [],
      messages: [],
      path: "test.md",
      physicalPath: "test.md",
      bom: false,
    };

    const result = language.parse(mockFile, {} as any);

    // If parsing failed, verify error handling
    assert.strictEqual(result.ok, false);
    assert.strictEqual(Array.isArray(result.errors), true);
    assert.strictEqual(result.errors.length, 1);
  });

  it("should handle parse errors when body is not a string", () => {
    const language = new ExtendedMarkdownLanguage();

    // Create a mock file with invalid body type
    const mockFile = {
      body: 123 as any, // Number instead of string
      ok: true,
      errors: [],
      messages: [],
      path: "test.md",
      physicalPath: "test.md",
      bom: false,
    };

    const result = language.parse(mockFile, {} as any);

    // This should fail and return an error result
    assert.strictEqual(result.ok, false);
    assert.strictEqual(Array.isArray(result.errors), true);
    assert.strictEqual(result.errors.length, 1);
  });

  it("should parse successfully under normal conditions", () => {
    const language = new ExtendedMarkdownLanguage();

    const file = {
      body: "# Test Heading\n\nParagraph content.",
      ok: true,
      errors: [],
      messages: [],
      path: "test.md",
      physicalPath: "test.md",
      bom: false,
    };

    const result = language.parse(file, {} as any);

    assert.strictEqual(result.ok, true);
    assert.notStrictEqual(result.ast, null);
    assert.strictEqual(result.ast.type, "root");
  });
});
