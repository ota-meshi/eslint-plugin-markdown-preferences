import { SnapshotRuleTester } from "eslint-snapshot-rule-tester";
import rule from "../../../src/rules/prefer-inline-code-words.js";
import { loadTestCases } from "../../utils/utils.js";

const tester = new SnapshotRuleTester();

tester.run(
  "prefer-inline-code-words",
  rule as any,
  await loadTestCases("prefer-inline-code-words"),
);
