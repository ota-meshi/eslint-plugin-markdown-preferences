import { SnapshotRuleTester } from "eslint-snapshot-rule-tester";
import rule from "../../../src/rules/blockquote-marker-alignment.js";
import { loadTestCases } from "../../utils/utils.js";

const tester = new SnapshotRuleTester();

tester.run(
  "blockquote-marker-alignment",
  rule as any,
  await loadTestCases("blockquote-marker-alignment"),
);
