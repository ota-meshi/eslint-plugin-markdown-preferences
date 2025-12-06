import type { RuleTextEditor, SuggestedEdit } from "@eslint/core";
import type { OrderedListMarker, OrderedListMarkerKind } from "../utils/ast.ts";
import { getListItemMarker } from "../utils/ast.ts";
import { createRule } from "../utils/index.ts";
import type {
  Blockquote,
  CustomContainer,
  FootnoteDefinition,
  List,
  ListItem,
  Root,
} from "../language/ast-types.ts";

type IncrementMode = "always" | "never";
type Options = {
  increment?: IncrementMode;
};

export default createRule("ordered-list-marker-sequence", {
  meta: {
    type: "layout",
    docs: {
      description: "enforce that ordered list markers use sequential numbers",
      categories: ["standard"],
      listCategory: "Decorative",
    },
    fixable: "code",
    hasSuggestions: true,
    schema: [
      {
        type: "object",
        properties: {
          increment: {
            enum: ["always", "never"],
          },
        },
        additionalProperties: false,
      },
    ],
    messages: {
      inconsistent:
        "Ordered list marker should be '{{expected}}' but found '{{actual}}'.",
      inconsistentStart:
        "Ordered list start should be {{expected}} but found '{{actual}}'.",
      suggestStartFromN: "Change list marker to start from '{{expected}}'.",
    },
  },
  create(context) {
    const sourceCode = context.sourceCode;
    const options: Options = context.options[0] || {};
    const incrementMode: IncrementMode = options.increment ?? "always";

    type Scope = {
      node: Root | Blockquote | ListItem | FootnoteDefinition | CustomContainer;
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
    function verifyStartSequence(
      node: List,
      marker: OrderedListMarker,
    ): boolean {
      if (incrementMode === "never") {
        // In "never" mode, all lists should start with 1
        if (node.start == null || node.start <= 1) return true;

        const suggest: SuggestedEdit[] = [
          {
            messageId: "suggestStartFromN",
            data: { expected: "1" },
            fix(fixer: RuleTextEditor) {
              const expectedMarker = `1${marker.kind}`;
              const range = sourceCode.getRange(node);
              return fixer.replaceTextRange(
                [range[0], range[0] + marker.raw.length],
                expectedMarker,
              );
            },
          },
        ];

        context.report({
          node: node.children[0] || node,
          messageId: "inconsistentStart",
          data: {
            expected: "'1'",
            actual: marker.sequence.raw,
          },
          fix(fixer) {
            const expectedMarker = `1${marker.kind}`;
            const range = sourceCode.getRange(node);
            return fixer.replaceTextRange(
              [range[0], range[0] + marker.raw.length],
              expectedMarker,
            );
          },
          suggest,
        });
        return false;
      }

      // Original "always" mode logic
      if (node.start == null || node.start <= 1) return true;
      if (
        scope.last != null &&
        scope.last.sequence + 1 === node.start &&
        marker.kind === scope.last.kind
      )
        return true;
      const expected = [0, 1];
      if (scope.last != null && marker.kind === scope.last.kind) {
        expected.push(scope.last.sequence + 1);
      }

      const suggest: SuggestedEdit[] = [];
      for (const n of [...expected].sort(
        (a, b) => Math.abs(node.start! - a) - Math.abs(node.start! - b),
      )) {
        suggest.push({
          messageId: "suggestStartFromN",
          data: { expected: String(n) },
          fix(fixer: RuleTextEditor) {
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
        messageId: "inconsistentStart",
        data: {
          expected: new Intl.ListFormat("en-US", {
            type: "disjunction",
          }).format(expected.map((n) => `'${n}'`)),
          actual: marker.sequence.raw,
        },
        fix:
          scope.last == null
            ? (fixer) => {
                const expectedMarker = `1${marker.kind}`;
                const range = sourceCode.getRange(node);
                return fixer.replaceTextRange(
                  [range[0], range[0] + marker.raw.length],
                  expectedMarker,
                );
              }
            : null,
        suggest,
      });
      return false;
    }

    /**
     * Verify the list item markers.
     */
    function verifyListItems(node: List) {
      if (node.start == null) return;

      if (incrementMode === "never") {
        // In "never" mode, all items should use "1"
        for (const item of node.children) {
          const marker = getListItemMarker(sourceCode, item);
          if (marker.kind !== "." && marker.kind !== ")") {
            continue;
          }
          if (marker.sequence.value !== 1) {
            const expectedMarker = `1${marker.kind}`;
            context.report({
              node: item,
              messageId: "inconsistent",
              data: {
                expected: expectedMarker,
                actual: marker.raw,
              },
              fix(fixer) {
                const range = sourceCode.getRange(item);
                return fixer.replaceTextRange(
                  [range[0], range[0] + marker.raw.length],
                  expectedMarker,
                );
              },
            });
          }
        }
        return;
      }

      // Original "always" mode logic
      for (let i = 0; i < node.children.length; i++) {
        const item = node.children[i];
        const marker = getListItemMarker(sourceCode, item);
        if (marker.kind !== "." && marker.kind !== ")") {
          continue;
        }
        const expectedSequence = node.start + i;
        if (marker.sequence.value !== expectedSequence) {
          const expectedMarker = `${expectedSequence}${marker.kind}`;
          context.report({
            node: item,
            messageId: "inconsistent",
            data: {
              expected: expectedMarker,
              actual: marker.raw,
            },
            fix(fixer) {
              const range = sourceCode.getRange(item);
              return fixer.replaceTextRange(
                [range[0], range[0] + marker.raw.length],
                expectedMarker,
              );
            },
          });
        }
      }
    }

    return {
      "blockquote, listItem, footnoteDefinition, customContainer"(
        node: Blockquote | ListItem | FootnoteDefinition | CustomContainer,
      ) {
        scope = {
          node,
          upper: scope,
          last: null,
        };
      },
      "blockquote, listItem, footnoteDefinition, customContainer:exit"(
        node: Blockquote | ListItem | FootnoteDefinition | CustomContainer,
      ) {
        if (scope.node === node) scope = scope.upper!;
      },
      heading() {
        scope.last = null;
      },
      list(node) {
        if (!node.ordered || node.start == null) {
          return;
        }
        const marker = getListItemMarker(sourceCode, node);
        if (marker.kind !== "." && marker.kind !== ")") {
          return;
        }

        verifyStartSequence(node, marker);
        verifyListItems(node);

        if (incrementMode === "never") {
          // In "never" mode, we don't track sequences
          scope.last = null;
        } else {
          // In "always" mode, track the last sequence
          scope.last = {
            kind: marker.kind,
            sequence: node.start + node.children.length - 1,
          };
        }
      },
    };
  },
});
