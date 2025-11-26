import { SnapshotRuleTester } from "eslint-snapshot-rule-tester";
import rule from "../../../src/rules/no-heading-trailing-punctuation.ts";
import { loadTestCases } from "../../utils/utils.ts";

const tester = new SnapshotRuleTester();

tester.run(
  "no-heading-trailing-punctuation",
  rule as any,
  await loadTestCases("no-heading-trailing-punctuation"),
);
