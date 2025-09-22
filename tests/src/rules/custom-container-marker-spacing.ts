import { SnapshotRuleTester } from "eslint-snapshot-rule-tester";
import rule from "../../../src/rules/custom-container-marker-spacing.ts";
import { loadTestCases } from "../../utils/utils.ts";

const tester = new SnapshotRuleTester();

tester.run(
  "custom-container-marker-spacing",
  rule as any,
  await loadTestCases("custom-container-marker-spacing"),
);
