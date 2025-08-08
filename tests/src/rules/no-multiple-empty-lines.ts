import { SnapshotRuleTester } from "eslint-snapshot-rule-tester";
import rule from "../../../src/rules/no-multiple-empty-lines.js";
import { loadTestCases } from "../../utils/utils.js";

const tester = new SnapshotRuleTester();

tester.run(
  "no-multiple-empty-lines",
  rule as any,
  await loadTestCases("no-multiple-empty-lines"),
);
