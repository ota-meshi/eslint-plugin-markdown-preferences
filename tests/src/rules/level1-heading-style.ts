import { SnapshotRuleTester } from "eslint-snapshot-rule-tester";
import rule from "../../../src/rules/level1-heading-style.ts";
import { loadTestCases } from "../../utils/utils.ts";

const tester = new SnapshotRuleTester();

tester.run(
  "level1-heading-style",
  rule as any,
  await loadTestCases("level1-heading-style"),
);
