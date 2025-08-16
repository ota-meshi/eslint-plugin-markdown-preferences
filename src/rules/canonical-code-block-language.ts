import type { Code } from "mdast";
import { createRule } from "../utils/index.ts";
import { getSourceLocationFromRange } from "../utils/ast.ts";

type LanguageMapping = Record<string, string>;

const DEFAULT_LANGUAGES: LanguageMapping = {
  javascript: "js",
  jsx: "js",
  mjs: "js",
  cjs: "js",
  typescript: "ts",
  tsx: "ts",
  mts: "ts",
  cts: "ts",
  python: "py",
  bash: "sh",
  shell: "sh",
  zsh: "sh",
  yml: "yaml",
  markdown: "md",
  rust: "rs",
  golang: "go",
  cplusplus: "cpp",
  "c++": "cpp",
  postgresql: "sql",
  mysql: "sql",
  sqlite: "sql",
};

export default createRule<[{ languages?: LanguageMapping }?]>(
  "canonical-code-block-language",
  {
    meta: {
      type: "suggestion",
      docs: {
        description: "enforce canonical language names in code blocks",
        categories: [],
        listCategory: "Preference",
      },
      fixable: "code",
      hasSuggestions: false,
      schema: [
        {
          type: "object",
          properties: {
            languages: {
              type: "object",
              patternProperties: {
                "^[\\s\\S]+$": {
                  type: "string",
                },
              },
              additionalProperties: false,
            },
          },
          additionalProperties: false,
        },
      ],
      messages: {
        useCanonical:
          'Use canonical language name "{{canonical}}" instead of "{{current}}".',
      },
    },
    create(context) {
      const sourceCode = context.sourceCode;
      const languages: LanguageMapping =
        context.options[0]?.languages || DEFAULT_LANGUAGES;

      return {
        code(node: Code) {
          if (!node.lang || !languages[node.lang]) {
            return;
          }

          const canonical = languages[node.lang];
          const current = node.lang;

          if (current === canonical) {
            return;
          }

          // Get the position of the language info in the opening fence
          const nodeRange = sourceCode.getRange(node);
          const nodeText = sourceCode.text.slice(nodeRange[0], nodeRange[1]);

          // Find the opening fence and language using exec
          // This regex captures the fence and language, allowing for meta info after the language
          // Supports 3 or more backticks/tildes for extended fences
          const fenceRegex = /^(`{3,}|~{3,})(\w*)(?:\s.*)?$/mu;
          const fenceMatch = fenceRegex.exec(nodeText.split("\n")[0]);
          if (!fenceMatch) {
            return;
          }

          const [, fence, langInfo] = fenceMatch;
          const range: [number, number] = [
            nodeRange[0] + fence.length,
            nodeRange[0] + fence.length + langInfo.length,
          ];
          context.report({
            node,
            loc: getSourceLocationFromRange(sourceCode, node, range),
            messageId: "useCanonical",
            data: {
              canonical,
              current,
            },
            fix(fixer) {
              return fixer.replaceTextRange(range, canonical);
            },
          });
        },
      };
    },
  },
);
