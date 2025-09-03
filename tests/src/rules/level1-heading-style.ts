import { SnapshotRuleTester } from "eslint-snapshot-rule-tester";
import rule from "../../../src/rules/level1-heading-style.js";
import { loadTestCases } from "../../utils/utils.js";

const tester = new SnapshotRuleTester();

tester.run(
  "level1-heading-style",
  rule as any,
  await loadTestCases("level1-heading-style"),
);
