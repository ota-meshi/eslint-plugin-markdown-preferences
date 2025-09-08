import { SnapshotRuleTester } from "eslint-snapshot-rule-tester";
import rule from "../../../src/rules/emphasis-delimiters-style.ts";
import { loadTestCases } from "../../utils/utils.ts";

const tester = new SnapshotRuleTester();

tester.run(
  "emphasis-delimiters-style",
  rule as any,
  await loadTestCases("emphasis-delimiters-style"),
);
