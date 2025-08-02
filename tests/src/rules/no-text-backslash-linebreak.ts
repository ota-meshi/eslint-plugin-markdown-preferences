import { SnapshotRuleTester } from "eslint-snapshot-rule-tester";
import rule from "../../../src/rules/no-text-backslash-linebreak.js";
import { loadTestCases } from "../../utils/utils.js";

const tester = new SnapshotRuleTester();

tester.run(
  "no-text-backslash-linebreak",
  rule as any,
  await loadTestCases("no-text-backslash-linebreak"),
);
