import { SnapshotRuleTester } from "eslint-snapshot-rule-tester";
import rule from "../../../src/rules/atx-heading-closing-sequence.js";
import { loadTestCases } from "../../utils/utils.js";

const tester = new SnapshotRuleTester();

tester.run(
  "atx-heading-closing-sequence",
  rule as any,
  await loadTestCases("atx-heading-closing-sequence"),
);
