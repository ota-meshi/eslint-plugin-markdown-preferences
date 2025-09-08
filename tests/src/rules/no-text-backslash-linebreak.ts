import { SnapshotRuleTester } from "eslint-snapshot-rule-tester";
import rule from "../../../src/rules/no-text-backslash-linebreak.ts";
import { loadTestCases } from "../../utils/utils.ts";

const tester = new SnapshotRuleTester();

tester.run(
  "no-text-backslash-linebreak",
  rule as any,
  await loadTestCases("no-text-backslash-linebreak"),
);
