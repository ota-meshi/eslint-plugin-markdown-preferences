import { SnapshotRuleTester } from "eslint-snapshot-rule-tester";
import rule from "../../../src/rules/no-trailing-spaces.js";
import { loadTestCases } from "../../utils/utils.js";

const tester = new SnapshotRuleTester();

tester.run(
  "no-trailing-spaces",
  rule as any,
  await loadTestCases("no-trailing-spaces"),
);
