import { SnapshotRuleTester } from "eslint-snapshot-rule-tester";
import type { MarkdownBlockNode } from "../../../src/rules/padding-line-between-blocks.ts";
import rule, {
  requiresBlankLineBetween,
} from "../../../src/rules/padding-line-between-blocks.ts";
import { loadTestCases } from "../../utils/utils.ts";
import { parseMarkdown } from "../../utils/markdown-parser/parser.ts";
import assert from "node:assert";
import plugin from "../../../src/index.ts";

const syntaxMap: Record<
  Exclude<MarkdownBlockNode["type"], "json" | "toml">,
  {
    code: string[];
  }
> = {
  heading: {
    code: ["# heading", "heading\n---"],
  },
  paragraph: { code: ["paragraph"] },
  list: { code: ["- list", "* list", "+ list", "1. list", "1) list"] },
  blockquote: { code: ["> blockquote"] },
  code: { code: ["```\ncode\n```", "````\ncode\n````"] },
  html: { code: ["<div>html</div>"] },
  table: { code: ["|table|\n|-|\n|data|"] },
  thematicBreak: { code: ["---", "***", "- - -", "* * *", "-----", "*****"] },
  definition: { code: ["[link]: #link-definition"] },
  footnoteDefinition: { code: ["[^footnote]: footnote-definition"] },
  yaml: { code: ["---\ntitle: Frontmatter\n---"] },
  customContainer: { code: ["::: warning\ncustom container\n:::"] },
  math: { code: ["$$\nE=mc^2\n$$"] },
  importCodeSnippet: { code: ["<<< ./example.js"] },
};

const syntaxEntries = Object.entries(syntaxMap).flatMap(([type, def]) =>
  def.code.map((code) => ({
    type,
    code,
  })),
);

const testCases: {
  prevBlockType: string;
  nextBlockType: string;
  withBlankLine: string;
  withoutBlankLine: string;
  requiresPadding: boolean;
}[] = [];
for (const entry1 of syntaxEntries) {
  for (const entry2 of syntaxEntries) {
    if (entry2.type === "yaml") continue;
    if (
      entry1.type === "list" &&
      entry2.type === "list" &&
      entry1.code === entry2.code
    )
      continue;
    const codeWithPadding =
      entry1.type !== "thematicBreak"
        ? `${entry1.code}\n\n${entry2.code}`
        : `\n\n${entry1.code}\n\n${entry2.code}`;
    const codeWithoutPadding =
      entry1.type !== "thematicBreak"
        ? `${entry1.code}\n${entry2.code}`
        : `\n\n${entry1.code}\n${entry2.code}`;
    const sourceCodeForCodeWithPadding = parseMarkdown(codeWithPadding, {
      frontmatter: "yaml",
    });
    const sourceCodeForCodeWithoutPadding = parseMarkdown(codeWithoutPadding, {
      frontmatter: "yaml",
    });
    assert.ok(
      sourceCodeForCodeWithPadding,
      `Failed to parse:\n${codeWithPadding}`,
    );
    assert.ok(
      sourceCodeForCodeWithoutPadding,
      `Failed to parse:\n${codeWithoutPadding}`,
    );
    assert.deepStrictEqual(
      sourceCodeForCodeWithPadding.ast.children.map((n) => n.type),
      [entry1.type, entry2.type],
      `Unexpected AST:\n${codeWithoutPadding}`,
    );
    testCases.push({
      prevBlockType: entry1.type,
      nextBlockType: entry2.type,
      withBlankLine: codeWithPadding,
      withoutBlankLine: codeWithoutPadding,
      requiresPadding: requiresBlankLineBetween(
        sourceCodeForCodeWithPadding.ast.children[0],
        sourceCodeForCodeWithPadding.ast.children[1],
        sourceCodeForCodeWithPadding,
      ),
    });
  }
}

describe("requiresBlankLineBetween", () => {
  for (const {
    prevBlockType,
    nextBlockType,
    withoutBlankLine,
    requiresPadding,
  } of testCases) {
    it(`${prevBlockType} with ${nextBlockType}`, () => {
      const sourceCodeForCodeWithoutPadding = parseMarkdown(withoutBlankLine, {
        frontmatter: "yaml",
      })!;
      if (requiresPadding) {
        assert.notDeepStrictEqual(
          sourceCodeForCodeWithoutPadding.ast.children.map((n) => n.type),
          [prevBlockType, nextBlockType],
          `Unexpected AST:\n${withoutBlankLine}`,
        );
      } else {
        assert.deepStrictEqual(
          sourceCodeForCodeWithoutPadding.ast.children.map((n) => n.type),
          [prevBlockType, nextBlockType],
          `Unexpected AST:\n${withoutBlankLine}`,
        );
      }
    });
  }
});

const tester = new SnapshotRuleTester({
  plugins: {
    "markdown-preferences": plugin,
  },
  language: "markdown-preferences/extended-syntax",
  languageOptions: {
    frontmatter: "yaml",
  },
});

tester.run(
  "padding-line-between-blocks",
  rule as any,
  await loadTestCases(
    "padding-line-between-blocks",
    {},
    {
      valid: [
        ...testCases.map(({ withBlankLine }) => ({
          code: withBlankLine,
          options: [{ prev: "*", next: "*", blankLine: "always" }],
        })),
        ...testCases
          .filter(({ requiresPadding }) => !requiresPadding)
          .map(({ withoutBlankLine }) => ({
            code: withoutBlankLine,
            options: [{ prev: "*", next: "*", blankLine: "never" }],
          })),
        ...testCases
          .filter(({ requiresPadding }) => requiresPadding)
          .map(({ withBlankLine }) => ({
            code: withBlankLine,
            options: [{ prev: "*", next: "*", blankLine: "never" }],
          })),
      ],
      invalid: [
        ...testCases
          .filter(({ requiresPadding }) => !requiresPadding)
          .map(({ withoutBlankLine }) => ({
            code: withoutBlankLine,
            options: [{ prev: "*", next: "*", blankLine: "always" }],
          })),
        ...testCases
          .filter(({ requiresPadding }) => !requiresPadding)
          .map(({ withBlankLine }) => ({
            code: withBlankLine,
            options: [{ prev: "*", next: "*", blankLine: "never" }],
          })),
      ],
    },
  ),
);
