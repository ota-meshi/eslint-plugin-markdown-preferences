import { SnapshotRuleTester } from "eslint-snapshot-rule-tester";
import rule from "../../../src/rules/prefer-linked-words.js";
import { loadTestCases } from "../../utils/utils.js";

const tester = new SnapshotRuleTester();

tester.run(
  "prefer-linked-words",
  rule as any,
  await loadTestCases("prefer-linked-words"),
);
