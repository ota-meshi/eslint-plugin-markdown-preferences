import { SnapshotRuleTester } from "eslint-snapshot-rule-tester";
import rule from "../../../src/rules/ordered-list-marker-style.ts";
import { loadTestCases } from "../../utils/utils.ts";

const tester = new SnapshotRuleTester();

tester.run(
  "ordered-list-marker-style",
  rule as any,
  await loadTestCases("ordered-list-marker-style"),
);
