import { SnapshotRuleTester } from "eslint-snapshot-rule-tester";
import rule from "../../../src/rules/level2-heading-style.js";
import { loadTestCases } from "../../utils/utils.js";

const tester = new SnapshotRuleTester();

tester.run(
  "level2-heading-style",
  rule as any,
  await loadTestCases("level2-heading-style"),
);
