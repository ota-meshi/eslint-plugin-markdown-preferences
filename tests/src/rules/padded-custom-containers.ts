import { SnapshotRuleTester } from "eslint-snapshot-rule-tester";
import rule from "../../../src/rules/padded-custom-containers.ts";
import { loadTestCases } from "../../utils/utils.ts";

const tester = new SnapshotRuleTester();

tester.run(
  "padded-custom-containers",
  rule as any,
  await loadTestCases("padded-custom-containers"),
);
