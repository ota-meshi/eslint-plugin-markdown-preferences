import type { LinkReference } from "../language/ast-types.ts";
import { createRule } from "../utils/index.ts";
import type { Ignores } from "../utils/search-words.ts";
import {
  createSearchWordsIgnoreContext,
  IGNORES_SCHEMA,
  iterateSearchWords,
} from "../utils/search-words.ts";

type Words = string[];

export default createRule<[{ words?: Words; ignores?: Ignores }?]>(
  "prefer-inline-code-words",
  {
    meta: {
      type: "suggestion",
      docs: {
        description: "enforce the use of inline code for specific words.",
        categories: [],
        listCategory: "Preference",
      },
      fixable: "code",
      hasSuggestions: false,
      schema: [
        {
          type: "object",
          properties: {
            words: {
              type: "array",
              items: {
                type: "string",
              },
            },
            ignores: IGNORES_SCHEMA,
          },
          required: ["words"],
          additionalProperties: false,
        },
      ],
      messages: {
        requireInlineCode: 'The word "{{name}}" should be in inline code.',
      },
    },
    create(context) {
      const sourceCode = context.sourceCode;

      const words = context.options[0]?.words || [];
      const ignores = createSearchWordsIgnoreContext(
        context.options[0]?.ignores,
      );

      type IgnoreNode = LinkReference;
      let shortcutLinkReference: LinkReference | null = null;
      return {
        "*"(node) {
          ignores.enter(node);
        },
        "*:exit"(node) {
          ignores.exit(node);
        },
        linkReference(node: IgnoreNode) {
          if (node.referenceType !== "shortcut") return;
          if (shortcutLinkReference) return;
          shortcutLinkReference = node;
        },
        "linkReference:exit"(node: IgnoreNode) {
          if (shortcutLinkReference === node) shortcutLinkReference = null;
        },
        text(node) {
          for (const { word, loc, range } of iterateSearchWords({
            sourceCode,
            node,
            words,
            ignores,
          })) {
            const shortcutLinkReferenceToReport = shortcutLinkReference;
            context.report({
              node,
              loc,
              messageId: "requireInlineCode",
              data: {
                name: word,
              },
              *fix(fixer) {
                yield fixer.insertTextBeforeRange(range, "`");
                yield fixer.insertTextAfterRange(range, "`");
                if (shortcutLinkReferenceToReport) {
                  yield fixer.insertTextAfter(
                    shortcutLinkReferenceToReport,
                    `[${shortcutLinkReferenceToReport.label}]`,
                  );
                }
              },
            });
          }
        },
      };
    },
  },
);
