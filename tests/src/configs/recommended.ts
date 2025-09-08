import assert from "assert";
import * as plugin from "../../../src/index.ts";
import { ESLint } from "eslint";

const code = `# Test`;
describe("`recommended` config", () => {
  it("should work. ", async () => {
    const linter = new ESLint({
      overrideConfigFile: true,
      overrideConfig: [plugin.configs.recommended],
    });
    const result = await linter.lintText(code, { filePath: "test/test.md" });
    const messages = result[0].messages;

    assert.deepStrictEqual(
      messages.map((m) => ({
        ruleId: m.ruleId,
        line: m.line,
        message: m.message,
      })),
      [],
    );
  });
});
