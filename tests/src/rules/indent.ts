import { SnapshotRuleTester } from "eslint-snapshot-rule-tester";
import rule from "../../../src/rules/indent.ts";
import { loadTestCases } from "../../utils/utils.ts";

const tester = new SnapshotRuleTester();

tester.run("indent", rule as any, await loadTestCases("indent"));
