import assert from "node:assert";
import { parseLinkDefinitionFromText } from "../../../src/utils/link-definition.ts";

describe("parseLinkDefinitionFromText", () => {
  it("parses pointy-bracketed destination with double-quoted title", () => {
    const result = parseLinkDefinitionFromText(
      '[label]: <https://example.com> "Title"',
    );
    assert.deepStrictEqual(result, {
      label: { text: "[label]", range: [0, 7] },
      destination: {
        type: "pointy-bracketed",
        text: "<https://example.com>",
        range: [9, 30],
      },
      title: { type: "double-quoted", text: '"Title"', range: [31, 38] },
    });
  });

  it("parses label and title with escaped characters", () => {
    const result = parseLinkDefinitionFromText("[l\\]abel]: bar 'ti\\'tle'");
    assert.deepStrictEqual(result, {
      label: { text: "[l\\]abel]", range: [0, 9] },
      destination: { type: "bare", text: "bar", range: [11, 14] },
      title: { type: "single-quoted", text: "'ti\\'tle'", range: [15, 24] },
    });
  });

  it("parses label and title with Unicode characters", () => {
    const result = parseLinkDefinitionFromText("[日本語]: bar 'タイトル'");
    assert.deepStrictEqual(result, {
      label: { text: "[日本語]", range: [0, 5] },
      destination: { type: "bare", text: "bar", range: [7, 10] },
      title: { type: "single-quoted", text: "'タイトル'", range: [11, 17] },
    });
  });

  it("parses label with newline", () => {
    const result = parseLinkDefinitionFromText("[a\nb]: bar 'baz'");
    assert.deepStrictEqual(result, {
      label: { text: "[a\nb]", range: [0, 5] },
      destination: { type: "bare", text: "bar", range: [7, 10] },
      title: { type: "single-quoted", text: "'baz'", range: [11, 16] },
    });
  });

  it("parses label with control character", () => {
    const result = parseLinkDefinitionFromText("[a\u0000b]: bar 'baz'");
    assert.deepStrictEqual(result, {
      label: { text: "[a\u0000b]", range: [0, 5] },
      destination: { type: "bare", text: "bar", range: [7, 10] },
      title: { type: "single-quoted", text: "'baz'", range: [11, 16] },
    });
  });

  it("parses label with escaped opening bracket", () => {
    const result = parseLinkDefinitionFromText("[l\\[abel]: bar 't'");
    assert.deepStrictEqual(result, {
      label: { text: "[l\\[abel]", range: [0, 9] },
      destination: { type: "bare", text: "bar", range: [11, 14] },
      title: { type: "single-quoted", text: "'t'", range: [15, 18] },
    });
  });

  it("parses label and title with emoji", () => {
    const result = parseLinkDefinitionFromText("[label😀]: bar 'emoji😀'");
    assert.deepStrictEqual(result, {
      label: { text: "[label😀]", range: [0, 9] },
      destination: { type: "bare", text: "bar", range: [11, 14] },
      title: { type: "single-quoted", text: "'emoji😀'", range: [15, 24] },
    });
  });

  it("parses label with multiple escape sequences", () => {
    const result = parseLinkDefinitionFromText("[l\\[a\\]bel]: bar 't'");
    assert.deepStrictEqual(result, {
      label: { text: "[l\\[a\\]bel]", range: [0, 11] },
      destination: { type: "bare", text: "bar", range: [13, 16] },
      title: { type: "single-quoted", text: "'t'", range: [17, 20] },
    });
  });

  it("parses title with both single and double quotes", () => {
    const result = parseLinkDefinitionFromText("[a]: b '\"t\"'");
    assert.deepStrictEqual(result, {
      label: { text: "[a]", range: [0, 3] },
      destination: { type: "bare", text: "b", range: [5, 6] },
      title: { type: "single-quoted", text: "'\"t\"'", range: [7, 12] },
    });
  });

  it("parses title with combining characters and surrogate pairs", () => {
    const result = parseLinkDefinitionFromText("[a]: b 'a\u0300😀'");
    assert.deepStrictEqual(result, {
      label: { text: "[a]", range: [0, 3] },
      destination: { type: "bare", text: "b", range: [5, 6] },
      title: { type: "single-quoted", text: "'a\u0300😀'", range: [7, 13] },
    });
  });

  it("parses plain destination with single-quoted title", () => {
    const result = parseLinkDefinitionFromText("[foo]: bar 'baz'");
    assert.deepStrictEqual(result, {
      label: { text: "[foo]", range: [0, 5] },
      destination: { type: "bare", text: "bar", range: [7, 10] },
      title: { type: "single-quoted", text: "'baz'", range: [11, 16] },
    });
  });

  it("parses empty single-quoted, double-quoted, and parenthesized titles", () => {
    const result1 = parseLinkDefinitionFromText("[a]: b ''");
    assert.deepStrictEqual(result1, {
      label: { text: "[a]", range: [0, 3] },
      destination: { type: "bare", text: "b", range: [5, 6] },
      title: { type: "single-quoted", text: "''", range: [7, 9] },
    });
    const result2 = parseLinkDefinitionFromText('[a]: b ""');
    assert.deepStrictEqual(result2, {
      label: { text: "[a]", range: [0, 3] },
      destination: { type: "bare", text: "b", range: [5, 6] },
      title: { type: "double-quoted", text: '""', range: [7, 9] },
    });
    const result3 = parseLinkDefinitionFromText("[a]: b ()");
    assert.deepStrictEqual(result3, {
      label: { text: "[a]", range: [0, 3] },
      destination: { type: "bare", text: "b", range: [5, 6] },
      title: { type: "parenthesized", text: "()", range: [7, 9] },
    });
  });

  it("parses label with leading/trailing spaces (should be valid)", () => {
    const result1 = parseLinkDefinitionFromText("[ foo ]: bar 'baz'");
    assert.deepStrictEqual(result1, {
      label: { text: "[ foo ]", range: [0, 7] },
      destination: { type: "bare", text: "bar", range: [9, 12] },
      title: { type: "single-quoted", text: "'baz'", range: [13, 18] },
    });
    const result2 = parseLinkDefinitionFromText("[foo ]: bar 'baz'");
    assert.deepStrictEqual(result2, {
      label: { text: "[foo ]", range: [0, 6] },
      destination: { type: "bare", text: "bar", range: [8, 11] },
      title: { type: "single-quoted", text: "'baz'", range: [12, 17] },
    });
    const result3 = parseLinkDefinitionFromText("[ foo]: bar 'baz'");
    assert.deepStrictEqual(result3, {
      label: { text: "[ foo]", range: [0, 6] },
      destination: { type: "bare", text: "bar", range: [8, 11] },
      title: { type: "single-quoted", text: "'baz'", range: [12, 17] },
    });
  });

  it("returns null for label with only spaces", () => {
    assert.strictEqual(parseLinkDefinitionFromText("[   ]: bar 'baz'"), null);
  });

  it("parses plain destination with parenthesized title", () => {
    const result = parseLinkDefinitionFromText("[a]: b (c)");
    assert.deepStrictEqual(result, {
      label: { text: "[a]", range: [0, 3] },
      destination: { type: "bare", text: "b", range: [5, 6] },
      title: { type: "parenthesized", text: "(c)", range: [7, 10] },
    });
  });

  it("parses destination with tab/space before title", () => {
    const result = parseLinkDefinitionFromText("[a]: b   't'");
    assert.deepStrictEqual(result, {
      label: { text: "[a]", range: [0, 3] },
      destination: { type: "bare", text: "b", range: [5, 6] },
      title: { type: "single-quoted", text: "'t'", range: [9, 12] },
    });
  });

  it("parses destination and title with multiple spaces and tabs", () => {
    const result = parseLinkDefinitionFromText("[a]:    b\t\t'c'");
    assert.deepStrictEqual(result, {
      label: { text: "[a]", range: [0, 3] },
      destination: { type: "bare", text: "b", range: [8, 9] },
      title: { type: "single-quoted", text: "'c'", range: [11, 14] },
    });
  });

  it("parses destination and title with full-width space and zero-width space", () => {
    //  Full-width space (U+3000)
    const result1 = parseLinkDefinitionFromText("[a]: bar\u3000'baz'");
    assert.deepStrictEqual(result1, {
      label: { text: "[a]", range: [0, 3] },
      destination: { type: "bare", text: "bar", range: [5, 8] },
      title: { type: "single-quoted", text: "'baz'", range: [9, 14] },
    });
    //  Zero-width space (U+200B)
    const result2 = parseLinkDefinitionFromText("[a]: bar '\u200bbaz'");
    assert.deepStrictEqual(result2, {
      label: { text: "[a]", range: [0, 3] },
      destination: { type: "bare", text: "bar", range: [5, 8] },
      title: { type: "single-quoted", text: "'\u200bbaz'", range: [9, 15] },
    });
  });

  it("parses destination and title with multiple surrogate pairs", () => {
    const result = parseLinkDefinitionFromText("[a]: bar '😀😀'");
    assert.deepStrictEqual(result, {
      label: { text: "[a]", range: [0, 3] },
      destination: { type: "bare", text: "bar", range: [5, 8] },
      title: { type: "single-quoted", text: "'😀😀'", range: [9, 15] },
    });
  });

  it("parses destination and title with markdown special characters", () => {
    const result = parseLinkDefinitionFromText("[a]: bar 't*e_s[t]()'");
    assert.deepStrictEqual(result, {
      label: { text: "[a]", range: [0, 3] },
      destination: { type: "bare", text: "bar", range: [5, 8] },
      title: { type: "single-quoted", text: "'t*e_s[t]()'", range: [9, 21] },
    });
  });

  it("returns null for destination with only spaces", () => {
    assert.strictEqual(parseLinkDefinitionFromText("[a]:    "), null);
    assert.strictEqual(parseLinkDefinitionFromText("[a]: \u3000\t"), null);
  });

  it("parses single-quoted title with only zero-width space (U+200B)", () => {
    const result = parseLinkDefinitionFromText("[a]: bar '\u200b'");
    assert.deepStrictEqual(result, {
      label: { text: "[a]", range: [0, 3] },
      destination: { type: "bare", text: "bar", range: [5, 8] },
      title: { type: "single-quoted", text: "'\u200b'", range: [9, 12] },
    });
  });

  it("parses title with control character (valid)", () => {
    const result = parseLinkDefinitionFromText("[a]: bar 'b\u0000z'");
    assert.deepStrictEqual(result, {
      label: { text: "[a]", range: [0, 3] },
      destination: { type: "bare", text: "bar", range: [5, 8] },
      title: { type: "single-quoted", text: "'b\u0000z'", range: [9, 14] },
    });
  });

  it("parses plain destination without title", () => {
    const result = parseLinkDefinitionFromText("[a]: b");
    assert.deepStrictEqual(result, {
      label: { text: "[a]", range: [0, 3] },
      destination: { type: "bare", text: "b", range: [5, 6] },
      title: null,
    });
  });

  it("returns null for label without closing bracket", () => {
    assert.strictEqual(parseLinkDefinitionFromText("[label: bar 'baz'"), null);
  });

  it("returns null for empty destination", () => {
    assert.strictEqual(parseLinkDefinitionFromText("[a]:   "), null);
    assert.strictEqual(parseLinkDefinitionFromText("[a]:"), null);
  });

  it("parses pointy-bracketed destination without title", () => {
    const result = parseLinkDefinitionFromText("[a]: <b>");
    assert.deepStrictEqual(result, {
      label: { text: "[a]", range: [0, 3] },
      destination: { type: "pointy-bracketed", text: "<b>", range: [5, 8] },
      title: null,
    });
  });

  it("returns null for unclosed title", () => {
    assert.strictEqual(parseLinkDefinitionFromText("[a]: b 'title"), null);
    assert.strictEqual(parseLinkDefinitionFromText('[a]: b "title'), null);
    assert.strictEqual(parseLinkDefinitionFromText("[a]: b (title"), null);
  });

  it("parses destination with special characters", () => {
    const result = parseLinkDefinitionFromText(
      "[a]: https://example.com/path?foo=1&bar=2",
    );
    assert.deepStrictEqual(result, {
      label: { text: "[a]", range: [0, 3] },
      destination: {
        type: "bare",
        text: "https://example.com/path?foo=1&bar=2",
        range: [5, 41],
      },
      title: null,
    });
  });

  it("parses destination with URL-encoded string", () => {
    const result = parseLinkDefinitionFromText(
      "[a]: https://example.com/%E3%81%82 't'",
    );
    assert.deepStrictEqual(result, {
      label: { text: "[a]", range: [0, 3] },
      destination: {
        type: "bare",
        text: "https://example.com/%E3%81%82",
        range: [5, 34],
      },
      title: { type: "single-quoted", text: "'t'", range: [35, 38] },
    });
  });

  it("parses destination and title with newlines (should be valid)", () => {
    const result1 = parseLinkDefinitionFromText("[a]: b\n 't'");
    assert.deepStrictEqual(result1, {
      label: { text: "[a]", range: [0, 3] },
      destination: { type: "bare", text: "b", range: [5, 6] },
      title: { type: "single-quoted", text: "'t'", range: [8, 11] },
    });
    const result2 = parseLinkDefinitionFromText("[a]: b '\nt'");
    assert.deepStrictEqual(result2, {
      label: { text: "[a]", range: [0, 3] },
      destination: { type: "bare", text: "b", range: [5, 6] },
      title: { type: "single-quoted", text: "'\nt'", range: [7, 11] },
    });
    const result3 = parseLinkDefinitionFromText("[a]: <b\nc> 't'");
    assert.deepStrictEqual(result3, {
      label: { text: "[a]", range: [0, 3] },
      destination: { type: "pointy-bracketed", text: "<b\nc>", range: [5, 10] },
      title: { type: "single-quoted", text: "'t'", range: [11, 14] },
    });
    const result4 = parseLinkDefinitionFromText("[a]: b\n\n 't'");
    assert.deepStrictEqual(result4, {
      label: { text: "[a]", range: [0, 3] },
      destination: { type: "bare", text: "b", range: [5, 6] },
      title: { type: "single-quoted", text: "'t'", range: [9, 12] },
    });
  });

  it("returns null for destination with multiple newlines", () => {
    const result = parseLinkDefinitionFromText("[a]: b\nc\nd 't'");
    assert.deepStrictEqual(result, null);
  });

  it("returns null for double pointy-bracketed destination", () => {
    assert.strictEqual(parseLinkDefinitionFromText("[a]: <<b>>"), null);
  });

  it("parses destination with # in URL (should be valid)", () => {
    const result = parseLinkDefinitionFromText(
      "[a]: https://example.com/foo#bar",
    );
    assert.deepStrictEqual(result, {
      label: { text: "[a]", range: [0, 3] },
      destination: {
        type: "bare",
        text: "https://example.com/foo#bar",
        range: [5, 32],
      },
      title: null,
    });
  });

  it("returns null for invalid input", () => {
    assert.strictEqual(parseLinkDefinitionFromText(""), null);
    assert.strictEqual(parseLinkDefinitionFromText("[a] b"), null);
    assert.strictEqual(parseLinkDefinitionFromText("[a]:"), null);
    assert.strictEqual(parseLinkDefinitionFromText("[a]: <b> 'c' extra"), null);
    assert.strictEqual(
      parseLinkDefinitionFromText("[foo]\t :   bar   'baz'"),
      null,
    );
    assert.strictEqual(parseLinkDefinitionFromText("[]: bar"), null);
    assert.strictEqual(parseLinkDefinitionFromText("[a]: "), null);
    assert.strictEqual(
      parseLinkDefinitionFromText("[a]: bar  'title'  'extra'"),
      null,
    );
    assert.strictEqual(parseLinkDefinitionFromText("[a]: bar # comment"), null);
    // destinationやtitleの直後に不正な文字
    assert.strictEqual(parseLinkDefinitionFromText("[a]: bar 'baz'x"), null);
    assert.strictEqual(parseLinkDefinitionFromText("[a]: bar (baz)y"), null);
    // destinationやtitleに複数のtitle
    assert.strictEqual(parseLinkDefinitionFromText("[a]: bar '' ''"), null);
    // destinationやtitleにバックスラッシュでエスケープされたバックスラッシュ
    assert.strictEqual(
      parseLinkDefinitionFromText("[a]: bar 'ba\\\\z' extra"),
      null,
    );
    // destinationにコントロール文字
    assert.strictEqual(parseLinkDefinitionFromText("[a]: b\u0000c 't'"), null);
    // destinationに複数の改行＋空白
    assert.strictEqual(parseLinkDefinitionFromText("[a]: b\n \nc 't'"), null);
  });

  it("parses destination and title with multiple backslashes and label with colon/escapes (valid)", () => {
    //  Multiple backslashes in destination (valid)
    const result = parseLinkDefinitionFromText("[a]: ba\\\\r 't'");
    assert.deepStrictEqual(result, {
      label: { text: "[a]", range: [0, 3] },
      destination: { type: "bare", text: "ba\\\\r", range: [5, 10] },
      title: { type: "single-quoted", text: "'t'", range: [11, 14] },
    });
    //  Multiple backslashes in title (valid)
    const result2 = parseLinkDefinitionFromText("[a]: bar 'ba\\\\z'");
    assert.deepStrictEqual(result2, {
      label: { text: "[a]", range: [0, 3] },
      destination: { type: "bare", text: "bar", range: [5, 8] },
      title: { type: "single-quoted", text: "'ba\\\\z'", range: [9, 16] },
    });
    //  Colon in label (valid)
    const result3 = parseLinkDefinitionFromText("[foo:bar]: baz 'title'");
    assert.deepStrictEqual(result3, {
      label: { text: "[foo:bar]", range: [0, 9] },
      destination: { type: "bare", text: "baz", range: [11, 14] },
      title: { type: "single-quoted", text: "'title'", range: [15, 22] },
    });
    //  Multiple escapes in label (valid)
    const result4 = parseLinkDefinitionFromText("[l\\[a\\]b\\]el]: bar 't'");
    assert.deepStrictEqual(result4, {
      label: { text: "[l\\[a\\]b\\]el]", range: [0, 13] },
      destination: { type: "bare", text: "bar", range: [15, 18] },
      title: { type: "single-quoted", text: "'t'", range: [19, 22] },
    });
  });

  it("parses single-quoted title with only spaces (valid)", () => {
    const result = parseLinkDefinitionFromText("[a]: bar '   '");
    assert.deepStrictEqual(result, {
      label: { text: "[a]", range: [0, 3] },
      destination: { type: "bare", text: "bar", range: [5, 8] },
      title: { type: "single-quoted", text: "'   '", range: [9, 14] },
    });
  });

  it("parses label with uppercase, hyphen, and underscore (valid)", () => {
    const result = parseLinkDefinitionFromText("[FOO-bar_123]: baz 'title'");
    assert.deepStrictEqual(result, {
      label: { text: "[FOO-bar_123]", range: [0, 13] },
      destination: { type: "bare", text: "baz", range: [15, 18] },
      title: { type: "single-quoted", text: "'title'", range: [19, 26] },
    });
  });

  it("parses destination with escaped characters", () => {
    const result = parseLinkDefinitionFromText("[a]: <b\\>c> 't'");
    assert.deepStrictEqual(result, {
      label: { text: "[a]", range: [0, 3] },
      destination: {
        type: "pointy-bracketed",
        text: "<b\\>c>",
        range: [5, 11],
      },
      title: { type: "single-quoted", text: "'t'", range: [12, 15] },
    });
  });

  it("parses plain destination with two single quotes as URL", () => {
    const result = parseLinkDefinitionFromText("[a]: ''");
    assert.deepStrictEqual(result, {
      label: { text: "[a]", range: [0, 3] },
      destination: { type: "bare", text: "''", range: [5, 7] },
      title: null,
    });
  });
  it("parses pointy-bracketed destination and single-quoted title with escaped close characters", () => {
    const result = parseLinkDefinitionFromText("[a]: <b\\>> 't\\'>'");
    assert.deepStrictEqual(result, {
      label: { text: "[a]", range: [0, 3] },
      destination: { type: "pointy-bracketed", text: "<b\\>>", range: [5, 10] },
      title: { type: "single-quoted", text: "'t\\'>'", range: [11, 17] },
    });
  });

  it("parses pointy-bracketed destination with only space and single-quoted title", () => {
    const result = parseLinkDefinitionFromText("[a]: < > ''");
    assert.deepStrictEqual(result, {
      label: { text: "[a]", range: [0, 3] },
      destination: { type: "pointy-bracketed", text: "< >", range: [5, 8] },
      title: { type: "single-quoted", text: "''", range: [9, 11] },
    });
  });

  it("parses plain destination with only zero-width space", () => {
    const result = parseLinkDefinitionFromText("[a]: \u200b");
    assert.deepStrictEqual(result, {
      label: { text: "[a]", range: [0, 3] },
      destination: { type: "bare", text: "\u200b", range: [5, 6] },
      title: null,
    });
  });
});
