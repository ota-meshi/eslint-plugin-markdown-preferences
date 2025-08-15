import { SnapshotRuleTester } from "eslint-snapshot-rule-tester";
import rule from "../../../src/rules/atx-headings-closing-sequence.js";
import { loadTestCases } from "../../utils/utils.js";

const tester = new SnapshotRuleTester();

tester.run(
  "atx-headings-closing-sequence",
  rule as any,
  await loadTestCases("atx-headings-closing-sequence"),
);
