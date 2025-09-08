import { SnapshotRuleTester } from "eslint-snapshot-rule-tester";
import rule from "../../../src/rules/blockquote-marker-alignment.ts";
import { loadTestCases } from "../../utils/utils.ts";

const tester = new SnapshotRuleTester();

tester.run(
  "blockquote-marker-alignment",
  rule as any,
  await loadTestCases("blockquote-marker-alignment"),
);
