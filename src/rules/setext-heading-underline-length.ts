import { createRule } from "../utils/index.ts";
import { parseSetextHeading } from "../utils/setext-heading.ts";
import type { Heading } from "mdast";
import type { ParsedSetextHeading } from "../utils/setext-heading.ts";
import { getTextWidth } from "../utils/get-text-width.ts";
import { getHeadingKind } from "../utils/ast.ts";

export default createRule<
  [
    {
      mode?: "exact" | "minimum" | "consistent";
      align?: "any" | "exact" | "minimum" | "length";
      length?: number;
    }?,
  ]
>("setext-heading-underline-length", {
  meta: {
    type: "layout",
    docs: {
      description: "enforce setext heading underline length",
      categories: [],
      listCategory: "Stylistic",
    },
    fixable: "whitespace",
    schema: [
      {
        type: "object",
        properties: {
          mode: {
            type: "string",
            enum: ["exact", "minimum", "consistent"],
          },
          align: {
            type: "string",
            enum: ["any", "exact", "minimum", "length"],
          },
          length: {
            type: "integer",
            minimum: 1,
          },
        },
        additionalProperties: false,
      },
    ],
    messages: {
      exactLength:
        "Setext heading underline should be exactly the same length as the heading text.",
      minimumLength:
        "Setext heading underline should be at least as long as the heading text.",
      consistentAny:
        "Setext heading underline should be consistent with other underlines in the document.",
      consistentExact:
        "Setext heading underline should be exactly the same length as the longest heading text in the document.",
      consistentMinimum:
        "Setext heading underline should be at least as long as the longest heading text in the document.",
      consistentLength:
        "Setext heading underline should be {{expectedLength}} characters long for consistency.",
    },
  },
  create(context) {
    const sourceCode = context.sourceCode;
    const options = context.options[0] || {};
    const mode = options.mode || "exact";

    const parsedSetextHeadings = new Map<Heading, ParsedSetextHeading>();

    /**
     * Get the parsed setext heading for a specific heading.
     */
    function getParsedSetextHeading(
      heading: Heading,
    ): ParsedSetextHeading | null {
      const cached = parsedSetextHeadings.get(heading);
      if (cached) return cached;
      const underline = parseSetextHeading(sourceCode, heading);
      if (!underline) return null;
      parsedSetextHeadings.set(heading, underline);
      return underline;
    }

    type MessageId =
      | "exactLength"
      | "minimumLength"
      | "consistentAny"
      | "consistentExact"
      | "consistentMinimum"
      | "consistentLength";

    /**
     * Helper function to report errors for both regular and blockquote headings
     */
    function reportError(
      node: Heading,
      messageId: MessageId,
      expectedLength: number,
    ) {
      const parsed = getParsedSetextHeading(node);
      if (!parsed) return;
      context.report({
        node,
        messageId,
        loc: parsed.underline.loc,
        data: {
          expectedLength: String(expectedLength),
        },
        fix(fixer) {
          const newUnderline = parsed.underline.marker.repeat(expectedLength);
          return fixer.replaceTextRange(parsed.underline.range, newUnderline);
        },
      });
    }

    if (mode === "exact" || mode === "minimum") {
      return {
        heading(node) {
          const parsed = getParsedSetextHeading(node);
          if (!parsed) return;
          const expectedLength = getHeaderTextWidth(parsed);
          if (expectedLength < 1) return;
          if (mode === "exact") {
            if (parsed.underline.text.length !== expectedLength) {
              reportError(node, "exactLength", expectedLength);
            }
          } else if (mode === "minimum") {
            if (parsed.underline.text.length < expectedLength) {
              reportError(node, "minimumLength", expectedLength);
            }
          }
        },
      };
    }

    if (mode === "consistent") {
      const align = options.align || "exact";
      const fixedLength = options.length || 0;

      const setextHeadings: Heading[] = [];
      return {
        heading(node) {
          if (getHeadingKind(sourceCode, node) !== "setext") return;
          setextHeadings.push(node);
        },
        "root:exit"() {
          if (setextHeadings.length === 0) return;
          let expectedLength = 0;
          if (align === "any") {
            if (setextHeadings.length < 2) return;
            for (const node of setextHeadings) {
              const parsed = getParsedSetextHeading(node);
              if (!parsed) continue;
              expectedLength = parsed.underline.text.length;
              break;
            }
          } else if (align === "exact") {
            for (const node of setextHeadings) {
              const parsed = getParsedSetextHeading(node);
              if (!parsed) continue;
              expectedLength = Math.max(
                expectedLength,
                getHeaderTextWidth(parsed),
              );
            }
          } else if (align === "minimum") {
            for (const node of setextHeadings) {
              const parsed = getParsedSetextHeading(node);
              if (!parsed) continue;
              expectedLength = Math.max(
                expectedLength,
                getHeaderTextWidth(parsed),
                parsed.underline.text.length,
              );
            }
          } else if (align === "length") {
            expectedLength = fixedLength;
          } else {
            return;
          }
          if (!expectedLength || expectedLength < 1) return;

          for (const node of setextHeadings) {
            const parsed = getParsedSetextHeading(node);
            if (!parsed) continue;
            if (parsed.underline.text.length === expectedLength) continue;
            if (align === "any") {
              reportError(node, "consistentAny", expectedLength);
            } else if (align === "exact") {
              reportError(node, "consistentExact", expectedLength);
            } else if (align === "minimum") {
              reportError(node, "consistentMinimum", expectedLength);
            } else if (align === "length") {
              reportError(node, "consistentLength", expectedLength);
            }
          }
        },
      };
    }
    return {};

    /**
     * Get the width of a text string.
     */
    function getHeaderTextWidth(parsed: ParsedSetextHeading) {
      let maxLineWidth = 0;
      for (const contentLine of parsed.contentLines) {
        const lineWidth = getTextWidth(
          contentLine.raws.prefix +
            contentLine.raws.spaceBefore +
            contentLine.text,
        );
        const prefixWidth = getTextWidth(
          contentLine.raws.prefix + contentLine.raws.spaceBefore,
        );
        maxLineWidth = Math.max(maxLineWidth, lineWidth - prefixWidth);
      }
      return maxLineWidth;
    }
  },
});
