import { SnapshotRuleTester } from "eslint-snapshot-rule-tester";
import rule from "../../../src/rules/link-bracket-newline.ts";
import { loadTestCases } from "../../utils/utils.ts";

const tester = new SnapshotRuleTester();

tester.run(
  "link-bracket-newline",
  rule as any,
  await loadTestCases("link-bracket-newline"),
);
