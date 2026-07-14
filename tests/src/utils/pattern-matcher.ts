import assert from "node:assert";
import { compilePatternMatcher } from "../../../src/utils/pattern-matcher.ts";

const compilePrefixMatcher = (pattern: string) => (value: string) =>
  value.startsWith(pattern);

describe("compilePatternMatcher", () => {
  it("compiles every pattern once and removes one negation prefix", () => {
    const compiledPatterns: string[] = [];

    compilePatternMatcher(["foo", "!bar", "!!baz"], (pattern) => {
      compiledPatterns.push(pattern);
      return () => false;
    });

    assert.deepStrictEqual(compiledPatterns, ["foo", "bar", "!baz"]);
  });

  it("does not match values when the pattern list is empty", () => {
    const match = compilePatternMatcher([], compilePrefixMatcher);

    assert.strictEqual(match("value"), false);
  });

  it("adds values matched by regular patterns", () => {
    const match = compilePatternMatcher(["foo", "bar"], compilePrefixMatcher);

    assert.strictEqual(match("foo-value"), true);
    assert.strictEqual(match("bar-value"), true);
    assert.strictEqual(match("other"), false);
  });

  it("starts with all values when the first pattern is negated", () => {
    const match = compilePatternMatcher(["!foo"], compilePrefixMatcher);

    assert.strictEqual(match("foo-value"), false);
    assert.strictEqual(match("other"), true);
  });

  it("excludes values matched by any consecutive negated pattern", () => {
    const match = compilePatternMatcher(["!foo", "!bar"], compilePrefixMatcher);

    assert.strictEqual(match("foo-value"), false);
    assert.strictEqual(match("bar-value"), false);
    assert.strictEqual(match("other"), true);
  });

  it("subtracts a negated pattern from a regular pattern", () => {
    const match = compilePatternMatcher(
      ["item", "!item/public"],
      compilePrefixMatcher,
    );

    assert.strictEqual(match("item/private"), true);
    assert.strictEqual(match("item/public/guide"), false);
    assert.strictEqual(match("other"), false);
  });

  it("applies regular and negated patterns in order", () => {
    const match = compilePatternMatcher(
      ["!http", "http://internal", "!http://internal/public"],
      compilePrefixMatcher,
    );

    assert.strictEqual(match("./guide.md"), true);
    assert.strictEqual(match("https://example.com"), false);
    assert.strictEqual(match("http://internal/private"), true);
    assert.strictEqual(match("http://internal/public/guide"), false);
  });

  it("supports multiple alternating overrides", () => {
    const match = compilePatternMatcher(
      [
        "item",
        "!item/public",
        "item/public/internal",
        "!item/public/internal/generated",
      ],
      compilePrefixMatcher,
    );

    assert.strictEqual(match("item/private"), true);
    assert.strictEqual(match("item/public/guide"), false);
    assert.strictEqual(match("item/public/internal/guide"), true);
    assert.strictEqual(match("item/public/internal/generated/file"), false);
  });

  it("supports reapplying the same pattern later", () => {
    const match = compilePatternMatcher(
      ["item", "!item", "item"],
      compilePrefixMatcher,
    );

    assert.strictEqual(match("item"), true);
    assert.strictEqual(match("other"), false);
  });

  it("produces different results when pattern order is reversed", () => {
    const addThenRemove = compilePatternMatcher(
      ["item", "!item"],
      compilePrefixMatcher,
    );
    const removeThenAdd = compilePatternMatcher(
      ["!item", "item"],
      compilePrefixMatcher,
    );

    assert.strictEqual(addThenRemove("item"), false);
    assert.strictEqual(removeThenAdd("item"), true);
  });
});
