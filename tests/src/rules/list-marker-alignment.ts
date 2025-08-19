import { SnapshotRuleTester } from "eslint-snapshot-rule-tester";
import rule from "../../../src/rules/list-marker-alignment.js";
import { loadTestCases } from "../../utils/utils.js";

const tester = new SnapshotRuleTester();

tester.run(
  "list-marker-alignment",
  rule as any,
  await loadTestCases("list-marker-alignment"),
);
