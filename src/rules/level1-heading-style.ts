import type { Heading } from "mdast";
import { createRule } from "../utils/index.ts";
import { getHeadingKind } from "../utils/ast.ts";
import { parseSetextHeading } from "../utils/setext-heading.ts";
import { getParsedLines } from "../utils/lines.ts";
import { parseATXHeading } from "../utils/atx-heading.ts";
import { getTextWidth } from "../utils/get-text-width.ts";

type OptionObject = {
  style?: "atx" | "setext";
  allowMultilineSetext?: boolean;
};
type Option = OptionObject;

export default createRule<[Option?]>("level1-heading-style", {
  meta: {
    type: "layout",
    docs: {
      description: "enforce consistent style for level 1 headings",
      categories: ["standard"],
      listCategory: "Notation",
    },
    fixable: "code",
    hasSuggestions: false,
    schema: [
      {
        type: "object",
        properties: {
          style: {
            enum: ["atx", "setext"],
          },
          allowMultilineSetext: {
            type: "boolean",
          },
        },
        additionalProperties: false,
      },
    ],
    messages: {
      expectedAtx: "Expected ATX style heading (# Heading).",
      expectedSetext: "Expected Setext style heading (Heading\\n======).",
      multilineSetextNotAllowed: "Multiline Setext headings are not allowed.",
    },
  },
  create(context) {
    const sourceCode = context.sourceCode;

    const opt = context.options[0] || {};
    const style: "atx" | "setext" = opt.style ?? "atx";
    const allowMultilineSetext = opt.allowMultilineSetext;

    return {
      heading(node: Heading) {
        // Only check level 1 headings
        if (node.depth !== 1) return;

        const headingKind = getHeadingKind(sourceCode, node);

        if (style === "atx") {
          if (headingKind !== "setext") return;
          const parsed = parseSetextHeading(sourceCode, node);
          if (!parsed) return;

          // Check for multiline Setext headings
          const isMultiline = parsed.contentLines.length > 1;

          if (isMultiline) {
            if (allowMultilineSetext) return;
            context.report({
              node,
              messageId: "multilineSetextNotAllowed",
            });
            return;
          }

          context.report({
            node,
            messageId: "expectedAtx",
            *fix(fixer) {
              // Only fix single-line Setext headings
              const heading = parsed.contentLines[0];
              yield fixer.insertTextBeforeRange(heading.range, "# ");
              const lines = getParsedLines(sourceCode);
              yield fixer.removeRange(
                lines.get(parsed.underline.loc.start.line).range,
              );
            },
          });
        } else if (style === "setext") {
          if (
            headingKind !== "atx" ||
            // Empty ATX headings are allowed
            node.children.length === 0
          )
            return;
          context.report({
            node,
            messageId: "expectedSetext",
            *fix(fixer) {
              const parsed = parseATXHeading(sourceCode, node);
              if (!parsed) return;

              yield fixer.removeRange([
                parsed.openingSequence.range[0],
                parsed.content.range[0],
              ]);
              if (parsed.closingSequence) {
                yield fixer.removeRange([
                  parsed.content.range[1],
                  parsed.after?.range[1] ?? parsed.closingSequence.range[1],
                ]);
              }
              const lines = getParsedLines(sourceCode);

              const underline = "=".repeat(
                Math.max(getTextWidth(parsed.content.text), 3),
              );
              const prefix = lines
                .get(parsed.openingSequence.loc.start.line)
                .text.slice(0, parsed.openingSequence.loc.start.column - 1);
              const appendingText = `\n${prefix}${underline}`;

              yield fixer.insertTextAfter(node, appendingText);
            },
          });
        }
      },
    };
  },
});
