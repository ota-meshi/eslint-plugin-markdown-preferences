import { SnapshotRuleTester } from "eslint-snapshot-rule-tester";
import rule from "../../../src/rules/table-leading-trailing-pipes.ts";
import { loadTestCases } from "../../utils/utils.ts";

const tester = new SnapshotRuleTester();

tester.run(
  "table-leading-trailing-pipes",
  rule as any,
  await loadTestCases("table-leading-trailing-pipes"),
);
