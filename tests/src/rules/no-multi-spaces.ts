import { SnapshotRuleTester } from "eslint-snapshot-rule-tester";
import rule from "../../../src/rules/no-multi-spaces.js";
import { loadTestCases } from "../../utils/utils.js";

const tester = new SnapshotRuleTester();

tester.run(
  "no-multi-spaces",
  rule as any,
  await loadTestCases("no-multi-spaces"),
);
