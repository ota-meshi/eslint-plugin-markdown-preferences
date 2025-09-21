import { SnapshotRuleTester } from "eslint-snapshot-rule-tester";
import rule from "../../../src/rules/no-implicit-block-closing.ts";
import { loadTestCases } from "../../utils/utils.ts";

const tester = new SnapshotRuleTester();

tester.run(
  "no-implicit-block-closing",
  rule as any,
  await loadTestCases("no-implicit-block-closing"),
);
