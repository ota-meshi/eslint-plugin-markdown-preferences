import type { LinkReference } from "mdast";
import { createRule } from "../utils/index.js";
import { iterateSearchWords } from "../utils/search-words.js";

type Words = string[];

export default createRule<[{ words?: Words }?]>("prefer-inline-code-words", {
  meta: {
    type: "suggestion",
    docs: {
      description: "enforce the use of inline code for specific words.",
      categories: [],
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
        },
        required: ["words"],
      },
    ],
    messages: {
      requireInlineCode: 'The word "{{name}}" should be in inline code.',
    },
  },
  create(context) {
    const sourceCode = context.sourceCode;

    const words = context.options[0]?.words || [];

    type IgnoreNode = LinkReference;
    let shortcutLinkReference: LinkReference | null = null;
    return {
      linkReference(node: IgnoreNode) {
        if (node.referenceType !== "shortcut") return;
        if (shortcutLinkReference) return;
        shortcutLinkReference = node;
      },
      "linkReference:exit"(node: IgnoreNode) {
        if (shortcutLinkReference === node) shortcutLinkReference = null;
      },
      text(node) {
        for (const { word, loc, range } of iterateSearchWords(
          sourceCode,
          node,
          words,
        )) {
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
});
