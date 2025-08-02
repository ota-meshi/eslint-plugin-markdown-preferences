import { SnapshotRuleTester } from "eslint-snapshot-rule-tester";
import rule from "../../../src/rules/hard-linebreak-style.js";
import { loadTestCases } from "../../utils/utils.js";

const tester = new SnapshotRuleTester();

tester.run(
  "hard-linebreak-style",
  rule as any,
  await loadTestCases("hard-linebreak-style"),
);
