import { SnapshotRuleTester } from "eslint-snapshot-rule-tester";
import rule from "../../../src/rules/code-fence-spacing.ts";
import { loadTestCases } from "../../utils/utils.ts";

const tester = new SnapshotRuleTester();

tester.run(
  "code-fence-spacing",
  rule as any,
  await loadTestCases("code-fence-spacing"),
);
