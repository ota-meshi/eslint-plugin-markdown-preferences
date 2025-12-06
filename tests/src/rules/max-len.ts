import { SnapshotRuleTester } from "eslint-snapshot-rule-tester";
import rule from "../../../src/rules/max-len.ts"
import { loadTestCases } from "../../utils/utils.ts"

const tester = new SnapshotRuleTester()

tester.run("max-len", rule as any, await loadTestCases("max-len"))
