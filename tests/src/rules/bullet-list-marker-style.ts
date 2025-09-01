import { SnapshotRuleTester } from "eslint-snapshot-rule-tester";
import rule from "../../../src/rules/bullet-list-marker-style.js";
import { loadTestCases } from "../../utils/utils.js";
import { describe, it } from "mocha";
import assert from "node:assert";

const tester = new SnapshotRuleTester();

tester.run(
  "bullet-list-marker-style",
  rule as any,
  await loadTestCases("bullet-list-marker-style"),
);

// Additional tests for configuration validation
describe("bullet-list-marker-style configuration validation", () => {
  it("should throw error when primary equals secondary", () => {
    assert.throws(() => {
      const ruleInstance = rule as any;
      // Create a minimal context to test configuration parsing
      const context = {
        options: [{ primary: "-", secondary: "-" }],
        sourceCode: {
          ast: { type: "root", children: [] },
        },
        report() {
          // Empty report function for testing
        },
      };
      ruleInstance.create(context);
    }, /`primary` and `secondary` cannot be the same/);
  });

  it("should throw error when override primary equals secondary", () => {
    assert.throws(() => {
      const ruleInstance = rule as any;
      const context = {
        options: [
          {
            overrides: [{ primary: "*", secondary: "*" }],
          },
        ],
        sourceCode: {
          ast: { type: "root", children: [] },
        },
        report() {
          // Empty report function for testing
        },
      };
      ruleInstance.create(context);
    }, /overrides\[0\]: `primary` and `secondary` cannot be the same/);
  });
});
