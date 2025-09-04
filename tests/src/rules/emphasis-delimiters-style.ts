import { SnapshotRuleTester } from "eslint-snapshot-rule-tester";
import rule from "../../../src/rules/emphasis-delimiters-style.js";
import { loadTestCases } from "../../utils/utils.js";

const tester = new SnapshotRuleTester();

tester.run(
  "emphasis-delimiters-style",
  rule as any,
  await loadTestCases("emphasis-delimiters-style"),
);
