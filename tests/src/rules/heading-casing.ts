import { SnapshotRuleTester } from "eslint-snapshot-rule-tester";
import rule from "../../../src/rules/heading-casing.js";
import { loadTestCases } from "../../utils/utils.js";

const tester = new SnapshotRuleTester();

tester.run(
  "heading-casing",
  rule as any,
  await loadTestCases("heading-casing"),
);
