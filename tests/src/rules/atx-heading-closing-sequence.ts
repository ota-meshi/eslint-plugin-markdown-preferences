import { SnapshotRuleTester } from "eslint-snapshot-rule-tester";
import rule from "../../../src/rules/atx-heading-closing-sequence.ts";
import { loadTestCases } from "../../utils/utils.ts";

const tester = new SnapshotRuleTester();

tester.run(
  "atx-heading-closing-sequence",
  rule as any,
  await loadTestCases("atx-heading-closing-sequence"),
);
