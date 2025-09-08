import { SnapshotRuleTester } from "eslint-snapshot-rule-tester";
import rule from "../../../src/rules/no-trailing-spaces.ts";
import { loadTestCases } from "../../utils/utils.ts";

const tester = new SnapshotRuleTester();

tester.run(
  "no-trailing-spaces",
  rule as any,
  await loadTestCases("no-trailing-spaces"),
);
