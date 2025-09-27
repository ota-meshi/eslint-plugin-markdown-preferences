import assert from "node:assert";
import { parseTableDelimiterRowFromText } from "../../../src/utils/table.ts";

describe("parseTableDelimiterRowFromText", () => {
  it("parses simple delimiter row", () => {
    const result = parseTableDelimiterRowFromText("| --- | --- |");
    assert.deepStrictEqual(result, {
      delimiters: [
        {
          leadingPipe: { text: "|", range: [0, 1] },
          delimiter: { text: "---", range: [2, 5] },
        },
        {
          leadingPipe: { text: "|", range: [6, 7] },
          delimiter: { text: "---", range: [8, 11] },
        },
      ],
      trailingPipe: { text: "|", range: [12, 13] },
    });
  });

  it("parses delimiter row without leading pipe", () => {
    const result = parseTableDelimiterRowFromText(" --- | --- |");
    assert.deepStrictEqual(result, {
      delimiters: [
        {
          leadingPipe: null,
          delimiter: { text: "---", range: [1, 4] },
        },
        {
          leadingPipe: { text: "|", range: [5, 6] },
          delimiter: { text: "---", range: [7, 10] },
        },
      ],
      trailingPipe: { text: "|", range: [11, 12] },
    });
  });

  it("parses delimiter row with alignment colons", () => {
    const result = parseTableDelimiterRowFromText("| :--- | :---: | ---: |");
    assert.deepStrictEqual(result, {
      delimiters: [
        {
          leadingPipe: { text: "|", range: [0, 1] },
          delimiter: { text: ":---", range: [2, 6] },
        },
        {
          leadingPipe: { text: "|", range: [7, 8] },
          delimiter: { text: ":---:", range: [9, 14] },
        },
        {
          leadingPipe: { text: "|", range: [15, 16] },
          delimiter: { text: "---:", range: [17, 21] },
        },
      ],
      trailingPipe: { text: "|", range: [22, 23] },
    });
  });

  it("parses delimiter row without trailing pipe", () => {
    const result = parseTableDelimiterRowFromText("| --- | ---");
    assert.deepStrictEqual(result, {
      delimiters: [
        {
          leadingPipe: { text: "|", range: [0, 1] },
          delimiter: { text: "---", range: [2, 5] },
        },
        {
          leadingPipe: { text: "|", range: [6, 7] },
          delimiter: { text: "---", range: [8, 11] },
        },
      ],
      trailingPipe: null,
    });
  });

  it("returns null for invalid delimiter row", () => {
    const result = parseTableDelimiterRowFromText("| --- | abc |");
    assert.strictEqual(result, null);
  });

  it("returns null for delimiter row with missing pipe between delimiters", () => {
    const result = parseTableDelimiterRowFromText("| --- :---: |");
    assert.strictEqual(result, null);
  });

  it("returns null for delimiter row with invalid delimiter character", () => {
    const result = parseTableDelimiterRowFromText("| --- | :abc: |");
    assert.strictEqual(result, null);
  });

  it("returns null for delimiter row with consecutive pipes", () => {
    const result = parseTableDelimiterRowFromText("| --- || :---: |");
    assert.strictEqual(result, null);
  });

  it("handles delimiter row with blockquote markers", () => {
    const result = parseTableDelimiterRowFromText("> | --- | --- |");
    assert.deepStrictEqual(result, {
      delimiters: [
        {
          leadingPipe: { text: "|", range: [2, 3] },
          delimiter: { text: "---", range: [4, 7] },
        },
        {
          leadingPipe: { text: "|", range: [8, 9] },
          delimiter: { text: "---", range: [10, 13] },
        },
      ],
      trailingPipe: { text: "|", range: [14, 15] },
    });
  });

  it("parses delimiter row with spaces", () => {
    const result = parseTableDelimiterRowFromText(
      "  |  ---  |  :---:  |  ---:  |  ",
    );
    assert.deepStrictEqual(result, {
      delimiters: [
        {
          leadingPipe: { text: "|", range: [2, 3] },
          delimiter: { text: "---", range: [5, 8] },
        },
        {
          leadingPipe: { text: "|", range: [10, 11] },
          delimiter: { text: ":---:", range: [13, 18] },
        },
        {
          leadingPipe: { text: "|", range: [20, 21] },
          delimiter: { text: "---:", range: [23, 27] },
        },
      ],
      trailingPipe: { text: "|", range: [29, 30] },
    });
  });
});
