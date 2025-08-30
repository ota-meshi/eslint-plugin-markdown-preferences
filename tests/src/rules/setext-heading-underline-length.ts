import { SnapshotRuleTester } from "eslint-snapshot-rule-tester";
import rule from "../../../src/rules/setext-heading-underline-length.js";
import { loadTestCases } from "../../utils/utils.js";

const tester = new SnapshotRuleTester();

tester.run(
  "setext-heading-underline-length",
  rule as any,
  await loadTestCases("setext-heading-underline-length"),
);
