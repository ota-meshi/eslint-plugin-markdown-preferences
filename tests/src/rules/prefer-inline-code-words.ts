import { SnapshotRuleTester } from "eslint-snapshot-rule-tester";
import rule from "../../../src/rules/prefer-inline-code-words.ts";
import { loadTestCases } from "../../utils/utils.ts";

const tester = new SnapshotRuleTester();

tester.run(
  "prefer-inline-code-words",
  rule as any,
  await loadTestCases("prefer-inline-code-words"),
);
