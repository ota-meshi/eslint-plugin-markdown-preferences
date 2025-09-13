import type { List, ListItem } from "mdast";
import { createRule } from "../utils/index.ts";
import { getParsedLines } from "../utils/lines.ts";
import { getListItemMarker } from "../utils/ast.ts";
import { getWidth } from "../utils/width.ts";
import { isWhitespace } from "../utils/unicode.ts";

const ALIGN_TO_POSITION_NAME = {
  left: "start",
  right: "end",
} as const;

export default createRule<[{ align?: "left" | "right" }?]>(
  "list-marker-alignment",
  {
    meta: {
      type: "layout",
      docs: {
        description: "enforce consistent alignment of list markers",
        categories: ["recommended", "standard"],
        listCategory: "Stylistic",
      },
      fixable: "whitespace",
      hasSuggestions: false,
      schema: [
        {
          type: "object",
          properties: {
            align: { enum: ["left", "right"] },
          },
          additionalProperties: false,
        },
      ],
      messages: {
        incorrectAlignment:
          "List marker alignment is inconsistent. Expected {{expected}} characters of indentation, but got {{actual}}.",
      },
    },
    create(context) {
      const sourceCode = context.sourceCode;
      const alignPositionName =
        ALIGN_TO_POSITION_NAME[context.options[0]?.align ?? "left"];

      type MarkerLocation = {
        line: number;
        start: number;
        end: number;
      };

      /**
       * Get the marker location of a list item
       */
      function getMarkerLocation(node: ListItem): MarkerLocation {
        const start = sourceCode.getLoc(node).start;
        const startColumnIndex = start.column - 1;
        const marker = getListItemMarker(sourceCode, node);
        return {
          line: start.line,
          start: startColumnIndex,
          end: startColumnIndex + marker.raw.length,
        };
      }

      /**
       * Check if list items have consistent alignment
       */
      function checkListAlignment(listNode: List) {
        const items = listNode.children;
        if (items.length <= 1) return;

        // Get the marker location of the first item as the reference
        const referenceMarkerLocation = getMarkerLocation(items[0]);
        const expectedWidth = getWidth(
          sourceCode.lines[referenceMarkerLocation.line - 1].slice(
            0,
            referenceMarkerLocation[alignPositionName],
          ),
        );

        for (const item of items.slice(1)) {
          const markerLocation = getMarkerLocation(item);
          const actualWidth = getWidth(
            sourceCode.lines[markerLocation.line - 1].slice(
              0,
              markerLocation[alignPositionName],
            ),
          );
          const diff = actualWidth - expectedWidth;
          if (diff === 0) {
            continue;
          }

          const messageData =
            alignPositionName === "start"
              ? {
                  expected: String(expectedWidth),
                  actual: String(actualWidth),
                }
              : (() => {
                  const start = getWidth(
                    sourceCode.lines[markerLocation.line - 1].slice(
                      0,
                      markerLocation.start,
                    ),
                  );

                  return {
                    expected: String(start - diff),
                    actual: String(start),
                  };
                })();
          context.report({
            node: item,
            loc: {
              start: {
                line: markerLocation.line,
                column: markerLocation.start + 1,
              },
              end: {
                line: markerLocation.line,
                column: markerLocation.end + 1,
              },
            },
            messageId: "incorrectAlignment",
            data: messageData,
            fix(fixer) {
              const lines = getParsedLines(sourceCode);
              const line = lines.get(markerLocation.line);

              if (diff < 0) {
                const addSpaces = " ".repeat(-diff);
                return fixer.insertTextBeforeRange(
                  [
                    line.range[0] + markerLocation.start,
                    line.range[0] + markerLocation.start,
                  ],
                  addSpaces,
                );
              }

              const beforeItemMarker = line.text.slice(0, markerLocation.start);
              const currentWidth = getWidth(beforeItemMarker);
              const newWidth = currentWidth - diff;

              let newBeforeItemMarker = beforeItemMarker;
              while (getWidth(newBeforeItemMarker) > newWidth) {
                const last = newBeforeItemMarker.at(-1);
                if (last && isWhitespace(last)) {
                  newBeforeItemMarker = newBeforeItemMarker.slice(0, -1);
                } else {
                  return null; // Cannot fix if there's no whitespace to remove
                }
              }
              if (getWidth(newBeforeItemMarker) < newWidth) {
                newBeforeItemMarker += " ".repeat(
                  newWidth - getWidth(newBeforeItemMarker),
                );
              }
              const referenceBeforeItemMarker = lines
                .get(referenceMarkerLocation.line)
                .text.slice(0, referenceMarkerLocation.start);
              if (
                !referenceBeforeItemMarker.includes(">") ||
                referenceBeforeItemMarker === newBeforeItemMarker
              ) {
                return fixer.replaceTextRange(
                  [line.range[0], line.range[0] + markerLocation.start],
                  newBeforeItemMarker,
                );
              }

              // Maybe includes a mismatched blockquote
              return null;
            },
          });
        }
      }

      return {
        list: checkListAlignment,
      };
    },
  },
);
