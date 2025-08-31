import { SnapshotRuleTester } from "eslint-snapshot-rule-tester";
import rule from "../../../src/rules/thematic-break-length.js";
import { loadTestCases } from "../../utils/utils.js";

const tester = new SnapshotRuleTester();

tester.run(
  "thematic-break-length",
  rule as any,
  await loadTestCases("thematic-break-length"),
);
