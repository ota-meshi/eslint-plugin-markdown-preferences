import { createRule } from "../utils/index.ts";
import type { OrderedListMarker, OrderedListMarkerKind } from "../utils/ast.ts";
import { getListItemMarker } from "../utils/ast.ts";
import type {
  Blockquote,
  FootnoteDefinition,
  List,
  ListItem,
  Root,
} from "mdast";
import type { SuggestedEdit } from "@eslint/core";

type Option = {
  start?: 0 | 1;
};

export default createRule<[Option?]>("ordered-list-marker-start", {
  meta: {
    type: "layout",
    docs: {
      description: "enforce that ordered list markers start with 1 or 0",
      categories: ["standard"],
      listCategory: "Preference",
    },
    fixable: "code",
    hasSuggestions: true,
    schema: [
      {
        type: "object",
        properties: {
          start: { enum: [1, 0] },
        },
        additionalProperties: false,
      },
    ],
    messages: {
      wrongStart:
        "Ordered list should start with {{expected}} but found '{{actual}}'.",
      suggestStartFromN: "Change list marker to start from '{{expected}}'.",
    },
  },
  create(context) {
    const sourceCode = context.sourceCode;
    const option = context.options[0] || {};
    const expectedStart = option.start ?? 1;

    type Scope = {
      node: Root | Blockquote | ListItem | FootnoteDefinition;
      upper: Scope | null;
      last: { kind: OrderedListMarkerKind; sequence: number } | null;
    };
    let scope: Scope = {
      node: sourceCode.ast,
      upper: null,
      last: null,
    };

    /**
     * Verify the list start sequence.
     */
    function verifyStartSequence(node: List, marker: OrderedListMarker): void {
      if (node.start == null || node.start === expectedStart) return;
      if (
        scope.last != null &&
        scope.last.sequence + 1 === node.start &&
        marker.kind === scope.last.kind
      )
        return;
      const expected: number[] = [expectedStart];
      if (scope.last != null && marker.kind === scope.last.kind) {
        expected.push(scope.last.sequence + 1);
      }

      if (expected.includes(node.start)) return;
      const suggest: SuggestedEdit[] = [];
      for (const n of [...expected].sort(
        (a, b) => Math.abs(node.start! - a) - Math.abs(node.start! - b),
      )) {
        suggest.push({
          messageId: "suggestStartFromN",
          data: { expected: String(n) },
          fix(fixer) {
            const expectedMarker = `${n}${marker.kind}`;
            const range = sourceCode.getRange(node);
            return fixer.replaceTextRange(
              [range[0], range[0] + marker.raw.length],
              expectedMarker,
            );
          },
        });
      }

      context.report({
        node: node.children[0] || node,
        messageId: "wrongStart",
        data: {
          expected: new Intl.ListFormat("en-US", {
            type: "disjunction",
          }).format(expected.map((n) => `'${n}'`)),
          actual: String(node.start),
        },
        fix: suggest.length === 1 ? suggest[0].fix : undefined,
        suggest: suggest.length === 1 ? [] : suggest,
      });
    }

    return {
      "blockquote, listItem, footnoteDefinition"(
        node: Blockquote | ListItem | FootnoteDefinition,
      ) {
        scope = {
          node,
          upper: scope,
          last: null,
        };
      },
      "blockquote, listItem, footnoteDefinition:exit"(
        node: Blockquote | ListItem | FootnoteDefinition,
      ) {
        if (scope.node === node) scope = scope.upper!;
      },
      heading() {
        scope.last = null;
      },
      list(node) {
        if (!node.ordered || node.start == null) return;
        const marker = getListItemMarker(sourceCode, node);
        if (marker.kind !== "." && marker.kind !== ")") return;

        verifyStartSequence(node, marker);
        scope.last = {
          kind: marker.kind,
          sequence: node.start + node.children.length - 1,
        };
      },
    };
  },
});
