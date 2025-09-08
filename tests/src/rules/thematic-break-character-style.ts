import { SnapshotRuleTester } from "eslint-snapshot-rule-tester";
import rule from "../../../src/rules/thematic-break-character-style.ts";
import { loadTestCases } from "../../utils/utils.ts";

const tester = new SnapshotRuleTester();

tester.run(
  "thematic-break-character-style",
  rule as any,
  await loadTestCases("thematic-break-character-style"),
);
