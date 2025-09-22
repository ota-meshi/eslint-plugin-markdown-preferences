import assert from "assert";
import * as plugin from "../../src/index.ts";
import { Linter } from "eslint";

const testCases: {
  name: string;
  code: string;
  rules: Linter.RulesRecord;
  output?: string;
  only?: boolean;
}[] = [
  {
    name: "table-pipe-alignment with table-pipe-spacing",
    code: `
| Name   | Age | Role      |
| ------- | ---| --------- |
| Alice  | 30  | Developer |
| Bob    | 25  | Designer  |
| Charlie| 35  | Manager   |`,
    rules: {
      "markdown-preferences/table-pipe-alignment": "error",
      "markdown-preferences/table-pipe-spacing": "error",
    },
  },
  {
    name: "table-pipe-alignment with table-pipe-spacing",
    code: `
| Name      | age | role      |
|-----------|----:|:---------:|
| Alice     |  30 | Developer |
| Bob       |  25 | Designer  |
| Charlie   |  35 | Manager   |`,
    rules: {
      "markdown-preferences/table-pipe-alignment": "error",
      "markdown-preferences/table-pipe-spacing": "error",
    },
    output: `
| Name    | age |   role    |
| ------- | --: | :-------: |
| Alice   |  30 | Developer |
| Bob     |  25 | Designer  |
| Charlie |  35 |  Manager  |`,
  },
];
describe("No conflicts between multiple rules", () => {
  for (const testCase of testCases) {
    (testCase.only ? it.only : it)(testCase.name, () => {
      const linter = new Linter();
      const result = linter.verifyAndFix(testCase.code, {
        plugins: {
          "markdown-preferences": plugin,
        },
        language: "markdown-preferences/extended-syntax",
        rules: testCase.rules,
      });
      const messages = result.messages;

      assert.deepStrictEqual(
        messages.map((m) => ({
          ruleId: m.ruleId,
          line: m.line,
          message: m.message,
        })),
        [],
      );
      if (testCase.output) {
        assert.strictEqual(result.output, testCase.output);
      }
    });
  }
});
