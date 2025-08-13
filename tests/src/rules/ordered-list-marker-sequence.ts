import { SnapshotRuleTester } from "eslint-snapshot-rule-tester";
import rule from "../../../src/rules/ordered-list-marker-sequence.js";
import { loadTestCases } from "../../utils/utils.js";

const tester = new SnapshotRuleTester();

tester.run(
  "ordered-list-marker-sequence",
  rule as any,
  await loadTestCases("ordered-list-marker-sequence"),
);
