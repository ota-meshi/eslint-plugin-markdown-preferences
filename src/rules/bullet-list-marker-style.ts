import type { Blockquote, FootnoteDefinition, ListItem, Root } from "mdast";
import { createRule } from "../utils/index.ts";
import type { List } from "mdast";
import { getListItemMarker } from "../utils/ast.ts";

type Marker = "-" | "*" | "+";
type Options = {
  primary?: Marker;
  secondary?: Marker | "any";
  overrides?: {
    level?: number;
    parentMarker?: Marker | "any" | "ordered";
    primary: Marker;
    secondary: Marker | "any";
  }[];
};

type ParsedOptions = {
  get(
    level: number,
    parentMarker: Marker | "ordered" | "top",
  ): {
    primary: Marker;
    secondary: Marker | "any";
  };
};
type MDBlockContainer = Root | Blockquote | ListItem | FootnoteDefinition;

const MARKERS: Marker[] = ["-", "*", "+"];

/**
 * Parse rule options.
 */
function parseOptions(options: Options): ParsedOptions {
  const primary = options.primary || "-";
  const secondary =
    options.secondary || MARKERS.find((mark) => primary !== mark)!;

  if (primary === secondary) {
    throw new Error(
      `\`primary\` and \`secondary\` cannot be the same (primary: "${primary}", secondary: "${secondary}").`,
    );
  }
  const overrides = (options.overrides ?? [])
    .map((override, index) => {
      const primaryForOverride = override.primary || "-";
      const secondaryForOverride =
        override.secondary || MARKERS.find((mark) => primary !== mark)!;

      if (primaryForOverride === secondaryForOverride) {
        throw new Error(
          `overrides[${index}]: \`primary\` and \`secondary\` cannot be the same (primary: "${primaryForOverride}", secondary: "${secondaryForOverride}").`,
        );
      }
      return {
        level: override.level,
        parentMarker: override.parentMarker ?? "any",
        primary: primaryForOverride,
        secondary: secondaryForOverride,
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
          return { primary: o.primary, secondary: o.secondary };
        }
      }
      return { primary, secondary };
    },
  };
}

export default createRule<[Options?]>("bullet-list-marker-style", {
  meta: {
    type: "layout",
    docs: {
      description:
        "enforce consistent bullet list (unordered list) marker style",
      categories: [],
      listCategory: "Stylistic",
    },
    fixable: "code",
    hasSuggestions: false,
    schema: [
      {
        type: "object",
        properties: {
          primary: {
            enum: MARKERS,
          },
          secondary: {
            enum: [...MARKERS, "any"],
          },
          overrides: {
            type: "array",
            items: {
              type: "object",
              properties: {
                level: { type: "integer", minimum: 1 },
                parentMarker: { enum: [...MARKERS, "any", "ordered"] },
                primary: { enum: MARKERS },
                secondary: { enum: [...MARKERS, "any"] },
              },
              additionalProperties: false,
            },
          },
        },
        additionalProperties: false,
      },
    ],
    messages: {
      unexpected: "Bullet list marker should be '{{marker}}'.",
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
     * Check bullet list marker style
     */
    function checkBulletList(node: List) {
      let parentMarker: Marker | "ordered" | "top";
      if (containerStack.node.type === "listItem") {
        const parentMarkerKind = getListItemMarker(
          sourceCode,
          containerStack.node,
        ).kind;
        parentMarker =
          parentMarkerKind === "." || parentMarkerKind === ")"
            ? "ordered"
            : parentMarkerKind;
      } else {
        parentMarker = "top";
      }
      const { primary, secondary } = options.get(
        containerStack.level,
        parentMarker,
      );
      const nodeIndex = containerStack.node.children.indexOf(node);
      if (nodeIndex === -1) return;
      const prevNode =
        nodeIndex > 0 ? containerStack.node.children[nodeIndex - 1] : null;

      const prevList =
        prevNode &&
        (prevNode.type === "list" && !prevNode.ordered ? prevNode : null);
      const prevListMarker =
        prevList && getListItemMarker(sourceCode, prevList).kind;

      const expectedMarker = prevListMarker !== primary ? primary : secondary;
      if (expectedMarker === "any") return;

      const marker = getListItemMarker(sourceCode, node);
      if (marker.kind === expectedMarker) return;

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
        data: { marker: expectedMarker },
      });
    }

    return {
      list(node) {
        if (node.ordered) return;
        checkBulletList(node);
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
