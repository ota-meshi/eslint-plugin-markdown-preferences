import assert from "node:assert";
import { Linter } from "eslint";
import { SnapshotRuleTester } from "eslint-snapshot-rule-tester";
import plugin from "../../../src/index.ts";
import rule from "../../../src/rules/prefer-link-reference-definitions.ts";
import { loadTestCases } from "../../utils/utils.ts";

const tester = new SnapshotRuleTester();

tester.run(
  "prefer-link-reference-definitions",
  rule as any,
  await loadTestCases("prefer-link-reference-definitions"),
);

describe("prefer-link-reference-definitions", () => {
  it("avoids identifiers that differ only in case", () => {
    const code = `[Foo](/same) and [Foo](/same).

[foo]: /other
`;
    const result = new Linter().verifyAndFix(
      code,
      [
        {
          files: ["**/*.md"],
          plugins: {
            "markdown-preferences": plugin,
          },
          language: "markdown-preferences/extended-syntax",
          rules: {
            "markdown-preferences/prefer-link-reference-definitions": "error",
          },
        },
      ],
      { filename: "test.md" },
    );

    assert.strictEqual(
      result.output,
      `[Foo][Foo-1] and [Foo][Foo-1].

[foo]: /other

[Foo-1]: /same
`,
    );
  });
});
