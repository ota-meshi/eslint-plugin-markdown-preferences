import type { Code } from "mdast";
import { createRule } from "../utils/index.ts";
import { parseFencedCodeBlock } from "../utils/fenced-code-block.ts";

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

          const parsed = parseFencedCodeBlock(sourceCode, node);
          if (!parsed || !parsed.language) {
            return;
          }

          context.report({
            node,
            loc: parsed.language.loc,
            messageId: "useCanonical",
            data: {
              canonical,
              current,
            },
            fix(fixer) {
              return fixer.replaceTextRange(parsed.language!.range, canonical);
            },
          });
        },
      };
    },
  },
);
