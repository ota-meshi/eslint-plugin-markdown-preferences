import type { Heading } from "mdast";
import { createRule } from "../utils/index.ts";
import {
  parseATXHeading,
  parseATXHeadingClosingSequenceFromText,
} from "../utils/atx-heading.ts";

type OptionObject = {
  closingSequence?: "always" | "never";
};
type Option = OptionObject;

export default createRule<[Option?]>("atx-heading-closing-sequence", {
  meta: {
    type: "layout",
    docs: {
      description:
        "enforce consistent use of closing sequence in ATX headings.",
      categories: ["standard"],
      listCategory: "Stylistic",
    },
    fixable: "code",
    hasSuggestions: false,
    schema: [
      {
        type: "object",
        properties: {
          closingSequence: {
            enum: ["always", "never"],
          },
        },
        additionalProperties: false,
      },
    ],
    messages: {
      requireClosing:
        "ATX heading should have a closing sequence (e.g. '### heading ###').",
      forbidClosing: "ATX heading should not have a closing sequence.",
    },
  },
  create(context) {
    const sourceCode = context.sourceCode;

    // オプションパース: { closingSequence: ... } 形式のみ許容
    let closingSequence: "always" | "never" = "never";
    const opt = context.options[0];
    if (
      opt &&
      typeof opt === "object" &&
      typeof opt.closingSequence === "string"
    ) {
      if (opt.closingSequence === "always" || opt.closingSequence === "never") {
        closingSequence = opt.closingSequence;
      }
    }

    return {
      heading(node: Heading) {
        const parsed = parseATXHeading(sourceCode, node);
        if (!parsed) return;

        if (closingSequence === "always") {
          if (parsed.closingSequence) return;
          context.report({
            node,
            messageId: "requireClosing",
            fix(fixer) {
              const insert = ` ${"#".repeat(node.depth)} `;
              return fixer.insertTextAfter(node, insert);
            },
          });
        } else if (closingSequence === "never") {
          if (parsed.closingSequence == null) return;
          context.report({
            node,
            loc: {
              start: parsed.closingSequence.raws.spaceBefore.loc.start,
              end: parsed.closingSequence.loc.end,
            },
            messageId: "forbidClosing",
            *fix(fixer) {
              const removeRange = [
                parsed.closingSequence.raws.spaceBefore.range[0],
                parsed.closingSequence.range[1],
              ] as [number, number];
              const newHeadingText = sourceCode.text.slice(
                sourceCode.getRange(node)[0],
                removeRange[0],
              );
              const newHeadingParsed =
                parseATXHeadingClosingSequenceFromText(newHeadingText);
              if (newHeadingParsed) {
                const escapeIndex =
                  removeRange[0] - newHeadingParsed.rawAfter.length - 1;
                yield fixer.insertTextBeforeRange(
                  [escapeIndex, escapeIndex],
                  "\\",
                );
              }

              yield fixer.removeRange(removeRange);
            },
          });
        }
      },
    };
  },
});
