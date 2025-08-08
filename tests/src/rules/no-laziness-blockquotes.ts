import { SnapshotRuleTester } from "eslint-snapshot-rule-tester";
import rule from "../../../src/rules/no-laziness-blockquotes.js";
import { loadTestCases } from "../../utils/utils.js";

const tester = new SnapshotRuleTester();

tester.run(
  "no-laziness-blockquotes",
  rule as any,
  await loadTestCases("no-laziness-blockquotes"),
);
