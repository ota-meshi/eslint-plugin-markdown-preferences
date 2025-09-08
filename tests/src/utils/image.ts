import assert from "node:assert";
import { parseImageFromText } from "../../../src/utils/image.ts";

describe("parseImageFromText", () => {
  it("should parse plain destination without title", () => {
    const result = parseImageFromText("![alt](foo.png)");
    assert.deepStrictEqual(result, {
      text: { range: [1, 6] },
      destination: { type: "plain", text: "foo.png", range: [7, 14] },
      title: null,
    });
  });

  it("should parse angle-bracketed destination", () => {
    const result = parseImageFromText("![alt](<foo.png>)");
    assert.deepStrictEqual(result, {
      text: { range: [1, 6] },
      destination: {
        type: "angle-bracketed",
        text: "<foo.png>",
        range: [7, 16],
      },
      title: null,
    });
  });

  it("should parse destination with double-quoted title", () => {
    const result = parseImageFromText('![alt](foo.png "title")');
    assert.deepStrictEqual(result, {
      text: { range: [1, 6] },
      destination: { type: "plain", text: "foo.png", range: [7, 14] },
      title: { type: "double-quoted", text: '"title"', range: [15, 22] },
    });
  });

  it("should parse destination with single-quoted title", () => {
    const result = parseImageFromText("![alt](foo.png 'title')");
    assert.deepStrictEqual(result, {
      text: { range: [1, 6] },
      destination: { type: "plain", text: "foo.png", range: [7, 14] },
      title: { type: "single-quoted", text: "'title'", range: [15, 22] },
    });
  });

  it("should parse destination with parenthesized title", () => {
    const result = parseImageFromText("![alt](foo.png (title))");
    assert.deepStrictEqual(result, {
      text: { range: [1, 6] },
      destination: { type: "plain", text: "foo.png", range: [7, 14] },
      title: { type: "parenthesized", text: "(title)", range: [15, 22] },
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
      destination: { type: "plain", text: "foo\\(bar\\).png", range: [7, 21] },
      title: null,
    });
  });
});
