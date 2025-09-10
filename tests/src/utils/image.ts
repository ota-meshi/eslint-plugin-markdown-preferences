import assert from "node:assert";
import { parseImageFromText } from "../../../src/utils/image.ts";

describe("parseImageFromText", () => {
  it("should parse plain destination without title", () => {
    const result = parseImageFromText("![alt](foo.png)");
    assert.deepStrictEqual(result, {
      text: { range: [1, 6] },
      openingParen: { range: [6, 7] },
      destination: { type: "bare", text: "foo.png", range: [7, 14] },
      closingParen: { range: [14, 15] },
      title: null,
    });
  });

  it("should parse pointy-bracketed destination", () => {
    const result = parseImageFromText("![alt](<foo.png>)");
    assert.deepStrictEqual(result, {
      text: { range: [1, 6] },
      openingParen: { range: [6, 7] },
      destination: {
        type: "pointy-bracketed",
        text: "<foo.png>",
        range: [7, 16],
      },
      closingParen: { range: [16, 17] },
      title: null,
    });
  });

  it("should parse destination with double-quoted title", () => {
    const result = parseImageFromText('![alt](foo.png "title")');
    assert.deepStrictEqual(result, {
      text: { range: [1, 6] },
      openingParen: { range: [6, 7] },
      destination: { type: "bare", text: "foo.png", range: [7, 14] },
      title: { type: "double-quoted", text: '"title"', range: [15, 22] },
      closingParen: { range: [22, 23] },
    });
  });

  it("should parse destination with single-quoted title", () => {
    const result = parseImageFromText("![alt](foo.png 'title')");
    assert.deepStrictEqual(result, {
      text: { range: [1, 6] },
      openingParen: { range: [6, 7] },
      destination: { type: "bare", text: "foo.png", range: [7, 14] },
      title: { type: "single-quoted", text: "'title'", range: [15, 22] },
      closingParen: { range: [22, 23] },
    });
  });

  it("should parse destination with parenthesized title", () => {
    const result = parseImageFromText("![alt](foo.png (title))");
    assert.deepStrictEqual(result, {
      text: { range: [1, 6] },
      openingParen: { range: [6, 7] },
      destination: { type: "bare", text: "foo.png", range: [7, 14] },
      title: { type: "parenthesized", text: "(title)", range: [15, 22] },
      closingParen: { range: [22, 23] },
    });
  });

  it("should return null for invalid image syntax", () => {
    assert.strictEqual(parseImageFromText("![alt]foo.png"), null);
    assert.strictEqual(parseImageFromText("alt](foo.png)"), null);
    assert.strictEqual(parseImageFromText("[alt](foo.png)"), null);
    assert.strictEqual(parseImageFromText("![alt](foo.png"), null);
    assert.strictEqual(parseImageFromText("![alt](foo.png"), null);
  });

  it("should parse destination with escaped parens", () => {
    const result = parseImageFromText("![alt](foo\\(bar\\).png)");
    assert.deepStrictEqual(result, {
      text: { range: [1, 6] },
      openingParen: { range: [6, 7] },
      destination: { type: "bare", text: "foo\\(bar\\).png", range: [7, 21] },
      closingParen: { range: [21, 22] },
      title: null,
    });
  });

  it("should parse image with spaces around parens", () => {
    // space before closing paren
    const result2 = parseImageFromText("![alt](foo.png )");
    assert.deepStrictEqual(result2, {
      text: { range: [1, 6] },
      openingParen: { range: [6, 7] },
      destination: { type: "bare", text: "foo.png", range: [7, 14] },
      closingParen: { range: [15, 16] },
      title: null,
    });

    // space after opening paren
    const result3 = parseImageFromText("![alt]( foo.png)");
    assert.deepStrictEqual(result3, {
      text: { range: [1, 6] },
      openingParen: { range: [6, 7] },
      destination: { type: "bare", text: "foo.png", range: [8, 15] },
      closingParen: { range: [15, 16] },
      title: null,
    });

    // spaces both sides
    const result4 = parseImageFromText("![alt]( foo.png )");
    assert.deepStrictEqual(result4, {
      text: { range: [1, 6] },
      openingParen: { range: [6, 7] },
      destination: { type: "bare", text: "foo.png", range: [8, 15] },
      closingParen: { range: [16, 17] },
      title: null,
    });
  });

  it("return null image with spaces before opening paren", () => {
    // space after [alt]
    const result1 = parseImageFromText("![alt] (foo.png)");
    assert.deepStrictEqual(result1, null);
  });
});
