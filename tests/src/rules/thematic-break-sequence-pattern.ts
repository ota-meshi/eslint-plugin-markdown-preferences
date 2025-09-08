import { SnapshotRuleTester } from "eslint-snapshot-rule-tester";
import rule from "../../../src/rules/thematic-break-sequence-pattern.ts";
import { loadTestCases } from "../../utils/utils.ts";

const tester = new SnapshotRuleTester();

tester.run(
  "thematic-break-sequence-pattern",
  rule as any,
  await loadTestCases("thematic-break-sequence-pattern"),
);
