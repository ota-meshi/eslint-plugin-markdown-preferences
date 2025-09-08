import { SnapshotRuleTester } from "eslint-snapshot-rule-tester";
import rule from "../../../src/rules/link-bracket-spacing.ts";
import { loadTestCases } from "../../utils/utils.ts";

const tester = new SnapshotRuleTester();

tester.run(
  "link-bracket-spacing",
  rule as any,
  await loadTestCases("link-bracket-spacing"),
);
