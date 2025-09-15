import { createRule } from "../utils/index.ts";
import { parseSetextHeading } from "../utils/setext-heading.ts";
import type { Heading } from "mdast";
import type { ParsedSetextHeading } from "../utils/setext-heading.ts";
import { getTextWidth } from "../utils/text-width.ts";
import { getHeadingKind } from "../utils/ast.ts";

export default createRule<
  [
    {
      mode?: "exact" | "minimum" | "consistent" | "consistent-line-length";
      align?: "any" | "exact" | "minimum" | "length";
      length?: number;
    }?,
  ]
>("setext-heading-underline-length", {
  meta: {
    type: "layout",
    docs: {
      description: "enforce setext heading underline length",
      categories: ["standard"],
      listCategory: "Decorative",
    },
    fixable: "code",
    schema: [
      {
        type: "object",
        properties: {
          mode: {
            type: "string",
            enum: ["exact", "minimum", "consistent", "consistent-line-length"],
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

      consistentLineLengthAny:
        "Setext heading underline should be consistent in line length with other underlines in the document.",
      consistentLineLengthExact:
        "Setext heading underline should be exactly the same line length as the longest heading line in the document.",
      consistentLineLengthMinimum:
        "Setext heading underline should be at least as long as the longest heading line in the document.",
      consistentLineLengthLength:
        "Setext heading underline should be {{expectedLength}} characters long for line length consistency.",
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
      | "consistentLength"
      | "consistentLineLengthAny"
      | "consistentLineLengthExact"
      | "consistentLineLengthMinimum"
      | "consistentLineLengthLength";

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
          const expectedLength = getMaxHeaderTextWidth(parsed);
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
                getMaxHeaderTextWidth(parsed),
              );
            }
          } else if (align === "minimum") {
            let maxTextWidth = 0;
            for (const node of setextHeadings) {
              const parsed = getParsedSetextHeading(node);
              if (!parsed) continue;
              maxTextWidth = Math.max(
                maxTextWidth,
                getMaxHeaderTextWidth(parsed),
              );
              expectedLength = Math.max(
                expectedLength,
                parsed.underline.text.length,
              );
            }
            if (expectedLength < maxTextWidth) {
              expectedLength = maxTextWidth;
            } else {
              for (const node of setextHeadings) {
                const parsed = getParsedSetextHeading(node);
                if (!parsed) continue;
                if (maxTextWidth <= parsed.underline.text.length)
                  expectedLength = Math.min(
                    expectedLength,
                    parsed.underline.text.length,
                  );
              }
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

    if (mode === "consistent-line-length") {
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

          let minimumRequiredLineLength = 1;
          // Calculate the minimum required length
          for (const node of setextHeadings) {
            const parsed = getParsedSetextHeading(node);
            if (!parsed) continue;
            minimumRequiredLineLength = Math.max(
              minimumRequiredLineLength,
              parsed.underline.raws.prefix.length +
                parsed.underline.raws.spaceBefore.length +
                1,
            );
          }

          let expectedLineLength = minimumRequiredLineLength;

          // Calculate the expected value for each option
          if (align === "any") {
            if (setextHeadings.length < 2) return;
            for (const node of setextHeadings) {
              const parsed = getParsedSetextHeading(node);
              if (!parsed) continue;
              expectedLineLength = Math.max(
                parsed.underline.loc.end.column - 1,
                minimumRequiredLineLength,
              );
              break;
            }
          } else if (align === "exact") {
            for (const node of setextHeadings) {
              const parsed = getParsedSetextHeading(node);
              if (!parsed) continue;
              expectedLineLength = Math.max(
                expectedLineLength,
                getMaxHeaderLineWidth(parsed),
              );
            }
          } else if (align === "minimum") {
            let maxLineWidth = 0;
            for (const node of setextHeadings) {
              const parsed = getParsedSetextHeading(node);
              if (!parsed) continue;
              maxLineWidth = Math.max(
                maxLineWidth,
                getMaxHeaderLineWidth(parsed),
              );
              expectedLineLength = Math.max(
                expectedLineLength,
                parsed.underline.loc.end.column - 1,
              );
            }
            if (expectedLineLength < maxLineWidth) {
              expectedLineLength = maxLineWidth;
            } else {
              for (const node of setextHeadings) {
                const parsed = getParsedSetextHeading(node);
                if (!parsed) continue;
                if (maxLineWidth <= parsed.underline.loc.end.column - 1)
                  expectedLineLength = Math.min(
                    expectedLineLength,
                    parsed.underline.loc.end.column - 1,
                  );
              }
            }
          } else if (align === "length") {
            expectedLineLength = Math.max(
              fixedLength,
              minimumRequiredLineLength,
            );
          } else {
            return;
          }
          if (!expectedLineLength || expectedLineLength < 1) return;

          for (const node of setextHeadings) {
            const parsed = getParsedSetextHeading(node);
            if (!parsed) continue;
            const expectedLength =
              expectedLineLength -
              parsed.underline.raws.prefix.length -
              parsed.underline.raws.spaceBefore.length;
            if (parsed.underline.text.length === expectedLength) continue;
            if (align === "any") {
              reportError(node, "consistentLineLengthAny", expectedLength);
            } else if (align === "exact") {
              reportError(node, "consistentLineLengthExact", expectedLength);
            } else if (align === "minimum") {
              reportError(node, "consistentLineLengthMinimum", expectedLength);
            } else if (align === "length") {
              reportError(node, "consistentLineLengthLength", expectedLength);
            }
          }
        },
      };
    }
    return {};

    /**
     * Get the maximum width of header lines.
     */
    function getMaxHeaderTextWidth(parsed: ParsedSetextHeading) {
      let maxWidth = 0;
      for (const contentLine of parsed.contentLines) {
        const lineWidth = getTextWidth(
          contentLine.raws.prefix +
            contentLine.raws.spaceBefore +
            contentLine.text,
        );
        const prefixWidth = getTextWidth(
          contentLine.raws.prefix + contentLine.raws.spaceBefore,
        );
        maxWidth = Math.max(maxWidth, lineWidth - prefixWidth);
      }
      return maxWidth;
    }

    /**
     * Get the maximum width of header lines.
     */
    function getMaxHeaderLineWidth(parsed: ParsedSetextHeading) {
      let maxLineWidth = 0;
      for (const contentLine of parsed.contentLines) {
        const lineWidth = getTextWidth(
          contentLine.raws.prefix +
            contentLine.raws.spaceBefore +
            contentLine.text,
        );
        maxLineWidth = Math.max(maxLineWidth, lineWidth);
      }
      return maxLineWidth;
    }
  },
});
