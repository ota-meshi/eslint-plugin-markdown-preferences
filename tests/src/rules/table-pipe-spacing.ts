import { SnapshotRuleTester } from "eslint-snapshot-rule-tester";
import rule from "../../../src/rules/table-pipe-spacing.ts";
import { loadTestCases } from "../../utils/utils.ts";

const tester = new SnapshotRuleTester();

tester.run(
  "table-pipe-spacing",
  rule as any,
  await loadTestCases("table-pipe-spacing"),
);
