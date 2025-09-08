import { SnapshotRuleTester } from "eslint-snapshot-rule-tester";
import rule from "../../../src/rules/prefer-fenced-code-blocks.ts";
import { loadTestCases } from "../../utils/utils.ts";

const tester = new SnapshotRuleTester();

tester.run(
  "prefer-fenced-code-blocks",
  rule as any,
  await loadTestCases("prefer-fenced-code-blocks"),
);
