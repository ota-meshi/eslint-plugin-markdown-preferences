import { SnapshotRuleTester } from "eslint-snapshot-rule-tester";
import rule from "../../../src/rules/canonical-code-block-language.ts";
import { loadTestCases } from "../../utils/utils.ts";

const tester = new SnapshotRuleTester();

tester.run(
  "canonical-code-block-language",
  rule as any,
  await loadTestCases("canonical-code-block-language"),
);
