import type {
  Blockquote,
  FootnoteDefinition,
  List,
  ListItem,
  Root,
} from "mdast";
import { createRule } from "../utils/index.ts";
import type { BulletListMarker, OrderedListMarker } from "../utils/ast.ts";
import { getListItemMarker } from "../utils/ast.ts";

type MarkerKind = "." | ")";
type Marker = `n${MarkerKind}`;
type Options = {
  prefer?: Marker;
  overrides?: {
    level?: number;
    parentMarker?: Marker | "any" | "bullet";
    prefer?: Marker;
  }[];
};

type ParsedOptions = {
  get(
    level: number,
    parentMarker: MarkerKind | "bullet" | "top",
  ): {
    prefer: MarkerKind;
  };
};
type MDBlockContainer = Root | Blockquote | ListItem | FootnoteDefinition;

const MARKER_KINDS: MarkerKind[] = [".", ")"];
const MARKERS: Marker[] = MARKER_KINDS.map((kind): Marker => `n${kind}`);

/**
 * Get the other marker kind.
 */
function getOtherMarkerKind(unavailableMarker: MarkerKind) {
  return MARKER_KINDS.find((mark) => unavailableMarker !== mark)!;
}

/**
 * Get the marker kind from a marker.
 */
function markerToKind(marker: Marker): MarkerKind;
function markerToKind<O>(marker: Marker | O): MarkerKind | O;
function markerToKind<O>(marker: Marker | O): MarkerKind | O {
  if (marker === "n.") return ".";
  if (marker === "n)") return ")";
  return marker;
}

/**
 * Parse rule options.
 */
function parseOptions(options: Options): ParsedOptions {
  const prefer = markerToKind(options.prefer) || ".";
  const overrides = (options.overrides ?? [])
    .map((override) => {
      const preferForOverride = markerToKind(override.prefer) || ".";
      return {
        level: override.level,
        parentMarker: markerToKind(override.parentMarker) ?? "any",
        prefer: preferForOverride,
      };
    })
    .reverse();

  return {
    get(level, parentMarker) {
      for (const o of overrides) {
        if (
          (o.level == null || o.level === level) &&
          (o.parentMarker === "any" || o.parentMarker === parentMarker)
        ) {
          return { prefer: o.prefer };
        }
      }
      return { prefer };
    },
  };
}

/**
 * Check if a item marker is an ordered list marker.
 */
function isOrderedListItemMarker(
  itemMarker: BulletListMarker | OrderedListMarker,
): itemMarker is OrderedListMarker {
  return itemMarker.kind === "." || itemMarker.kind === ")";
}

export default createRule("ordered-list-marker-style", {
  meta: {
    type: "layout",
    docs: {
      description: "enforce consistent ordered list marker style",
      categories: ["standard"],
      listCategory: "Stylistic",
    },
    fixable: "code",
    hasSuggestions: false,
    schema: [
      {
        type: "object",
        properties: {
          prefer: {
            enum: MARKERS,
          },
          overrides: {
            type: "array",
            items: {
              type: "object",
              properties: {
                level: { type: "integer", minimum: 1 },
                parentMarker: { enum: [...MARKERS, "any", "bullet"] },
                prefer: { enum: MARKERS },
              },
              additionalProperties: false,
            },
          },
        },
        additionalProperties: false,
      },
    ],
    messages: {
      unexpected: "Ordered list marker should be '{{sequence}}{{markerKind}}'.",
    },
  },
  create(context) {
    const sourceCode = context.sourceCode;
    const options = parseOptions(context.options[0] || {});

    type ContainerStack = {
      node: MDBlockContainer;
      level: number;
      upper: ContainerStack | null;
    };
    let containerStack: ContainerStack = {
      node: sourceCode.ast,
      level: 1,
      upper: null,
    };

    /**
     * Check ordered list marker style
     */
    function checkOrderedList(node: List) {
      let parentMarker: MarkerKind | "bullet" | "top";
      if (containerStack.node.type === "listItem") {
        const parentMarkerKind = getListItemMarker(
          sourceCode,
          containerStack.node,
        ).kind;
        parentMarker =
          parentMarkerKind === "-" ||
          parentMarkerKind === "*" ||
          parentMarkerKind === "+"
            ? "bullet"
            : parentMarkerKind;
      } else {
        parentMarker = "top";
      }
      const { prefer } = options.get(containerStack.level, parentMarker);
      const nodeIndex = containerStack.node.children.indexOf(node);
      if (nodeIndex === -1) return;
      const prevNode =
        nodeIndex > 0 ? containerStack.node.children[nodeIndex - 1] : null;

      const prevBulletList =
        prevNode && (prevNode.type === "list" ? prevNode : null);
      const prevBulletListMarker =
        prevBulletList && getListItemMarker(sourceCode, prevBulletList);

      const expectedMarker =
        prevBulletListMarker?.kind !== prefer
          ? prefer
          : getOtherMarkerKind(prefer);

      const marker = getListItemMarker(sourceCode, node);
      if (marker.kind === expectedMarker || !isOrderedListItemMarker(marker))
        return;

      const loc = sourceCode.getLoc(node);

      context.report({
        node,
        loc: {
          start: loc.start,
          end: {
            line: loc.start.line,
            column: loc.start.column + marker.raw.length,
          },
        },
        messageId: "unexpected",
        data: { sequence: marker.sequence.raw, markerKind: expectedMarker },
        *fix(fixer) {
          if (
            prevNode?.type === "list" &&
            prevBulletListMarker &&
            isOrderedListItemMarker(prevBulletListMarker)
          ) {
            yield* fixMarker(prevNode.children[0], prevBulletListMarker.kind); // Avoid conflicts with the auto
          }
          yield* fixMarkers(node, expectedMarker);
          let prevMarker = expectedMarker;
          for (
            let index = nodeIndex + 1;
            index < containerStack.node.children.length;
            index++
          ) {
            const nextNode = containerStack.node.children[index];
            if (nextNode.type !== "list") break;
            const nextMarker = getListItemMarker(sourceCode, nextNode);
            if (nextMarker.kind !== prevMarker) break;
            const expectedNextMarker =
              prevMarker === prefer ? getOtherMarkerKind(prefer) : prefer;

            yield* fixMarkers(nextNode, expectedNextMarker);
            prevMarker = expectedNextMarker;
          }

          /**
           * Fix ordered list markers
           */
          function* fixMarkers(list: List, replacementMarker: MarkerKind) {
            for (const item of list.children) {
              yield* fixMarker(item, replacementMarker);
            }
          }

          /**
           * Fix ordered list item marker
           */
          function* fixMarker(item: ListItem, replacementMarker: MarkerKind) {
            const range = sourceCode.getRange(item);
            const itemMarker = getListItemMarker(sourceCode, item);
            if (!isOrderedListItemMarker(itemMarker)) return;
            yield fixer.replaceTextRange(
              [
                range[0] + itemMarker.raw.length - 1,
                range[0] + itemMarker.raw.length,
              ],
              replacementMarker,
            );
          }
        },
      });
    }

    return {
      list(node) {
        if (!node.ordered) return;
        checkOrderedList(node);
      },
      "root, blockquote, listItem, footnoteDefinition"(node: MDBlockContainer) {
        containerStack = {
          node,
          level: node.type === "listItem" ? containerStack.level + 1 : 1,
          upper: containerStack,
        };
      },
      "root, blockquote, listItem, footnoteDefinition:exit"() {
        containerStack = containerStack.upper!;
      },
    };
  },
});
