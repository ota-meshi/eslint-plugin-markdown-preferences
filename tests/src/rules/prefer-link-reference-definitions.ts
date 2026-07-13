import { SnapshotRuleTester } from "eslint-snapshot-rule-tester";
import rule from "../../../src/rules/prefer-link-reference-definitions.ts";
import { loadTestCases } from "../../utils/utils.ts";

const tester = new SnapshotRuleTester();

tester.run(
  "prefer-link-reference-definitions",
  rule as any,
  await loadTestCases("prefer-link-reference-definitions"),
);
