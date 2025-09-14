import { SnapshotRuleTester } from "eslint-snapshot-rule-tester";
import rule from "../../../src/rules/table-pipe-alignment.ts";
import { loadTestCases } from "../../utils/utils.ts";

const tester = new SnapshotRuleTester();

tester.run(
  "table-pipe-alignment",
  rule as any,
  await loadTestCases("table-pipe-alignment"),
);
