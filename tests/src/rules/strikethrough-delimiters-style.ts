import { SnapshotRuleTester } from "eslint-snapshot-rule-tester";
import rule from "../../../src/rules/strikethrough-delimiters-style.js";
import { loadTestCases } from "../../utils/utils.js";

const tester = new SnapshotRuleTester();

tester.run(
  "strikethrough-delimiters-style",
  rule as any,
  await loadTestCases("strikethrough-delimiters-style"),
);
