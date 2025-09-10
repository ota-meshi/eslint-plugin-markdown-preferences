import { SnapshotRuleTester } from "eslint-snapshot-rule-tester";
import rule from "../../../src/rules/link-paren-spacing.ts";
import { loadTestCases } from "../../utils/utils.ts";

const tester = new SnapshotRuleTester();

tester.run(
  "link-paren-spacing",
  rule as any,
  await loadTestCases("link-paren-spacing"),
);
