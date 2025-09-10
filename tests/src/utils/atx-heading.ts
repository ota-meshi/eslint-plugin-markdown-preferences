import assert from "assert";
import { parseATXHeadingClosingSequenceFromText } from "../../../src/utils/atx-heading.ts";

describe("parseATXHeadingClosingSequenceFromText", () => {
  it("should return closing sequence for ATX heading with trailing hashes", () => {
    assert.deepStrictEqual(
      parseATXHeadingClosingSequenceFromText("# Heading ###   "),
      {
        closingSequence: "###",
        before: " ",
        after: "   ",
      },
    );
    assert.deepStrictEqual(
      parseATXHeadingClosingSequenceFromText("## Foo ##\t\t"),
      {
        closingSequence: "##",
        before: " ",
        after: "\t\t",
      },
    );
    // Cases where trailing # is interpreted as a closing sequence
    assert.deepStrictEqual(parseATXHeadingClosingSequenceFromText("# # # #"), {
      closingSequence: "#",
      before: " ",
      after: "",
    });
    assert.deepStrictEqual(
      parseATXHeadingClosingSequenceFromText("# Heading #"),
      {
        closingSequence: "#",
        before: " ",
        after: "",
      },
    );
  });

  it("should return null for ATX heading without closing sequence", () => {
    assert.strictEqual(
      parseATXHeadingClosingSequenceFromText("# Heading"),
      null,
    );
    assert.strictEqual(
      parseATXHeadingClosingSequenceFromText("### Foo bar"),
      null,
    );
  });

  it("should return null if content ends with # but not as a closing sequence", () => {
    assert.strictEqual(parseATXHeadingClosingSequenceFromText("# Foo#"), null);
  });

  it("should handle tabs and spaces before/after closing sequence", () => {
    assert.deepStrictEqual(
      parseATXHeadingClosingSequenceFromText("# Foo \t### \t "),
      {
        closingSequence: "###",
        before: " \t",
        after: " \t ",
      },
    );
  });

  it("should return null for empty or non-heading text", () => {
    assert.strictEqual(parseATXHeadingClosingSequenceFromText(""), null);
    assert.strictEqual(
      parseATXHeadingClosingSequenceFromText("plain text"),
      null,
    );
  });
});
