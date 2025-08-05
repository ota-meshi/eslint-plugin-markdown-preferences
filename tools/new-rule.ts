import path from "path";
import fs from "fs";
import cp from "child_process";
import { fileURLToPath } from "url";

const dirname = path.dirname(fileURLToPath(import.meta.url));

const logger = console;

// main
((ruleId) => {
  if (ruleId == null) {
    logger.error("Usage: npm run new <RuleID>");
    process.exitCode = 1;
    return;
  }
  if (!/^[\w-]+$/u.test(ruleId)) {
    logger.error("Invalid RuleID '%s'.", ruleId);
    process.exitCode = 1;
    return;
  }

  const ruleFile = path.resolve(dirname, `../src/rules/${ruleId}.ts`);
  const testFile = path.resolve(dirname, `../tests/src/rules/${ruleId}.ts`);
  const fixturesRoot = path.resolve(
    dirname,
    `../tests/fixtures/rules/${ruleId}/`,
  );
  const docFile = path.resolve(dirname, `../docs/rules/${ruleId}.md`);
  const changesetFile = path.resolve(dirname, `../.changeset/${ruleId}.md`);

  fs.mkdirSync(path.dirname(ruleFile), { recursive: true });
  fs.mkdirSync(path.dirname(testFile), { recursive: true });
  fs.mkdirSync(path.dirname(docFile), { recursive: true });
  fs.mkdirSync(fixturesRoot, { recursive: true });
  fs.mkdirSync(path.resolve(fixturesRoot, "valid"), { recursive: true });
  fs.mkdirSync(path.resolve(fixturesRoot, "invalid"), { recursive: true });

  fs.writeFileSync(
    ruleFile,
    `import { createRule } from "../utils/index.ts"

export default createRule("${ruleId}", {
    meta: {
        type: "",
        docs: {
            description: "...",
            categories: ["..."],
        },
        fixable: null,
        hasSuggestions: null,
        schema: [],
        messages: {},
    },
    create(context) {
      const sourceCode = context.sourceCode

        return {
          // ...
        }
    },
})
`,
  );
  fs.writeFileSync(
    testFile,
    `import { SnapshotRuleTester } from "eslint-snapshot-rule-tester";
import rule from "../../../src/rules/${ruleId}.js"
import { loadTestCases } from "../../utils/utils.js"

const tester = new SnapshotRuleTester()

tester.run("${ruleId}", rule as any, await loadTestCases("${ruleId}"))
`,
  );
  fs.writeFileSync(
    docFile,
    `#  (markdown-preferences/${ruleId})

> description

## 📖 Rule Details

This rule reports ???.

<!-- eslint-skip -->

\`\`\`md
<!-- eslint markdown-preferences/${ruleId}: 'error' -->

<!-- ✓ GOOD -->


<!-- ✗ BAD -->

\`\`\`

## 🔧 Options

Nothing.

<!-- or -->

\`\`\`json
{
  "markdown-preferences/${ruleId}": [
    "error",
    {}
  ]
}
\`\`\`

- 

## 📚 Further reading

- 

## 👫 Related rules

- [xxx]

[xxx]: https://xxx

`,
  );
  fs.writeFileSync(
    changesetFile,
    `---
"eslint-plugin-markdown-preferences": minor
---

feat: add \`markdown-preferences/${ruleId}\` rule
`,
  );

  cp.execSync(`code "${ruleFile}"`);
  cp.execSync(`code "${testFile}"`);
  cp.execSync(`code "${docFile}"`);
})(process.argv[2]);
