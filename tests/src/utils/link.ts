import assert from "node:assert";
import { parseInlineLinkDestAndTitleFromText } from "../../../src/utils/link.ts";

describe("parseInlineLinkDestAndTitleFromText", () => {
  it("returns null for invalid title format", () => {
    // Test line 215-216: title format that is not quoted or parenthesized
    const result = parseInlineLinkDestAndTitleFromText(
      "https://example.com invalid-title",
    );
    assert.strictEqual(result, null);
  });

  it("returns null for extra characters after closing paren", () => {
    // Test line 223-225: extra characters after the closing parenthesis
    const result = parseInlineLinkDestAndTitleFromText(
      "https://example.com) extra",
    );
    assert.strictEqual(result, null);
  });

  it("returns null for malformed title quotes", () => {
    // Test edge cases with malformed quotes
    const result = parseInlineLinkDestAndTitleFromText(
      'https://example.com "unterminated title',
    );
    assert.strictEqual(result, null);
  });

  it("returns null when cursor finishes early", () => {
    // Test line 190-191: cursor.finished() case
    const result = parseInlineLinkDestAndTitleFromText("https://example.com");
    assert.strictEqual(result, null);
  });

  it("returns null when closing paren is missing", () => {
    // Test case where closing parenthesis is missing
    const result = parseInlineLinkDestAndTitleFromText(
      'https://example.com "title"',
    );
    assert.strictEqual(result, null);
  });
});
