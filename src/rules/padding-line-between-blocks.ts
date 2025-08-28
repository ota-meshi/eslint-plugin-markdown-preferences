import type {
  Blockquote,
  FootnoteDefinition,
  Html,
  ListItem,
  Root,
} from "mdast";
import {
  getHeadingKind,
  getThematicBreakMarker,
  type MDBlock,
  type MDDefinition,
  type MDFrontmatter,
  type MDNode,
} from "../utils/ast.ts";
import { createRule } from "../utils/index.ts";
import type { ParsedLine } from "../utils/lines.ts";
import { getParsedLines } from "../utils/lines.ts";
import { getBlockquoteLevelFromLine } from "../utils/blockquotes.ts";
import type { MarkdownSourceCode } from "@eslint/markdown";

type BlockType =
  | "blockquote"
  | "code"
  | "heading"
  | "html"
  | "list"
  | "paragraph"
  | "thematic-break"
  | "table"
  | "link-definition"
  | "footnote-definition"
  | "frontmatter"
  | "*";

interface PaddingRule {
  prev: BlockType | BlockType[];
  next: BlockType | BlockType[];
  blankLine: "any" | "never" | "always";
}

type Options = PaddingRule[];

export type MarkdownBlockNode = MDBlock | MDDefinition | MDFrontmatter | Html;

/**
 * Determines whether a blank line must be preserved between two nodes
 * due to Markdown syntax constraints (e.g., setext headings).
 */
export function requiresBlankLineBetween(
  prev: MarkdownBlockNode,
  next: MarkdownBlockNode,
  sourceCode: MarkdownSourceCode,
): boolean {
  if (prev.type === "paragraph") {
    if (next.type === "paragraph" || next.type === "definition") {
      return true;
    } else if (next.type === "heading") {
      return getHeadingKind(sourceCode, next) === "setext";
    } else if (next.type === "thematicBreak") {
      const marker = getThematicBreakMarker(sourceCode, next);
      return marker.kind === "-" && !marker.hasSpaces;
    }
  } else if (prev.type === "list") {
    if (
      next.type === "paragraph" ||
      next.type === "table" ||
      next.type === "definition"
    ) {
      return true;
    } else if (next.type === "heading") {
      return getHeadingKind(sourceCode, next) === "setext";
    }
  } else if (prev.type === "blockquote") {
    if (
      next.type === "paragraph" ||
      next.type === "blockquote" ||
      next.type === "table" ||
      next.type === "definition"
    ) {
      return true;
    } else if (next.type === "heading") {
      return getHeadingKind(sourceCode, next) === "setext";
    }
  } else if (prev.type === "table") {
    if (
      next.type === "paragraph" ||
      next.type === "table" ||
      next.type === "definition"
    ) {
      return true;
    } else if (next.type === "heading") {
      return getHeadingKind(sourceCode, next) === "setext";
    }
  } else if (prev.type === "footnoteDefinition") {
    if (
      next.type === "paragraph" ||
      next.type === "table" ||
      next.type === "definition"
    ) {
      return true;
    } else if (next.type === "heading") {
      return getHeadingKind(sourceCode, next) === "setext";
    }
  } else if (prev.type === "html") {
    return true;
  }

  return false;
}

const BLOCK_TYPES: BlockType[] = [
  "blockquote",
  "code",
  "heading",
  "html",
  "list",
  "paragraph",
  "thematic-break",
  "table",
  "link-definition",
  "footnote-definition",
  "frontmatter",
  "*",
];

// For MDBlock types - use explicit mapping
const BLOCK_TYPE_MAP: Record<MarkdownBlockNode["type"], BlockType> = {
  heading: "heading",
  paragraph: "paragraph",
  list: "list",
  blockquote: "blockquote",
  code: "code",
  html: "html",
  table: "table",
  thematicBreak: "thematic-break",
  definition: "link-definition",
  footnoteDefinition: "footnote-definition",
  json: "frontmatter",
  toml: "frontmatter",
  yaml: "frontmatter",
};

/**
 * Get the block type of a node
 */
function getBlockType(node: MarkdownBlockNode): BlockType {
  const nodeType = node.type;

  const blockType = BLOCK_TYPE_MAP[nodeType];
  if (blockType) {
    return blockType;
  }

  // Fallback - should not happen with proper type guards
  return "paragraph";
}

/**
 * Check if a node is a block-level node
 */
function isBlockNode(node: MDNode): node is MarkdownBlockNode {
  return Boolean(BLOCK_TYPE_MAP[node.type as MarkdownBlockNode["type"]]);
}

export default createRule("padding-line-between-blocks", {
  meta: {
    type: "layout",
    docs: {
      description: "require or disallow padding lines between blocks",
      categories: ["recommended"],
      listCategory: "Stylistic",
    },
    fixable: "whitespace",
    hasSuggestions: false,
    schema: {
      type: "array",
      items: {
        type: "object",
        properties: {
          prev: {
            oneOf: [
              {
                type: "string",
                enum: BLOCK_TYPES,
              },
              {
                type: "array",
                items: {
                  type: "string",
                  enum: BLOCK_TYPES,
                },
                minItems: 1,
              },
            ],
          },
          next: {
            oneOf: [
              {
                type: "string",
                enum: BLOCK_TYPES,
              },
              {
                type: "array",
                items: {
                  type: "string",
                  enum: BLOCK_TYPES,
                },
                minItems: 1,
              },
            ],
          },
          blankLine: {
            type: "string",
            enum: ["any", "never", "always"],
          },
        },
        required: ["prev", "next", "blankLine"],
        additionalProperties: false,
      },
    },
    messages: {
      expectedBlankLine:
        "Expected a blank line between {{prevType}} and {{nextType}}.",
      unexpectedBlankLine:
        "Unexpected blank line between {{prevType}} and {{nextType}}.",
    },
  },
  create(context) {
    const sourceCode = context.sourceCode;
    const options: Options = context.options || [];

    type BlockquoteStack = {
      node: Blockquote | Root;
      upper: BlockquoteStack;
    };
    let blockquoteStack: BlockquoteStack = {
      node: sourceCode.ast,
      upper: null!,
    };

    /**
     * Check if the actual type matches the expected type pattern
     */
    function matchesType(
      actualType: BlockType,
      expectedType: BlockType | BlockType[],
    ): boolean {
      if (Array.isArray(expectedType)) {
        return expectedType.includes(actualType) || expectedType.includes("*");
      }
      return expectedType === "*" || expectedType === actualType;
    }

    /**
     * Get the expected number of blank lines between two block types
     */
    function getExpectedblankLine(
      prevType: BlockType,
      nextType: BlockType,
    ): "any" | "never" | "always" | null {
      for (const rule of options) {
        if (
          matchesType(prevType, rule.prev) &&
          matchesType(nextType, rule.next)
        ) {
          return rule.blankLine;
        }
      }
      return null; // No rule matched
    }

    /**
     * Check padding between blocks in a container node
     */
    function checkBlockPadding(
      containerNode: Root | Blockquote | ListItem | FootnoteDefinition,
    ) {
      const blocks: MarkdownBlockNode[] = [];

      // Collect all block-level nodes
      for (const child of containerNode.children) {
        if (isBlockNode(child)) {
          blocks.push(child);
        }
      }

      // Check padding between consecutive blocks
      for (let i = 0; i < blocks.length - 1; i++) {
        const prevBlock = blocks[i];
        const nextBlock = blocks[i + 1];

        const prevType = getBlockType(prevBlock);
        const nextType = getBlockType(nextBlock);

        const expectedblankLine = getExpectedblankLine(prevType, nextType);
        if (expectedblankLine === null) continue;

        const prevLoc = sourceCode.getLoc(prevBlock);
        const nextLoc = sourceCode.getLoc(nextBlock);

        const actualblankLine = nextLoc.start.line - prevLoc.end.line - 1;
        const hasBlankLine = actualblankLine > 0;

        let messageId: "expectedBlankLine" | "unexpectedBlankLine" =
          "expectedBlankLine";
        if (expectedblankLine === "always") {
          if (hasBlankLine) continue;
          messageId = "expectedBlankLine";
        } else if (expectedblankLine === "never") {
          if (!hasBlankLine) continue;
          if (requiresBlankLineBetween(prevBlock, nextBlock, sourceCode))
            continue;
          messageId = "unexpectedBlankLine";
        } else {
          // "any" case: no reporting needed
          continue;
        }

        const lineLength = sourceCode.lines[nextLoc.start.line - 1].length;

        const blockquoteOrRoot = blockquoteStack.node;

        context.report({
          node: nextBlock,
          loc: {
            start: nextLoc.start,
            end: {
              line: nextLoc.start.line,
              column: lineLength + 1,
            },
          },
          messageId,
          data: {
            prevType,
            nextType,
          },
          fix(fixer) {
            if (expectedblankLine === "always") {
              let text = "\n";
              if (blockquoteOrRoot.type === "blockquote") {
                const blockquoteLoc = sourceCode.getLoc(blockquoteOrRoot);
                text += getBlockquoteLevelFromLine(
                  sourceCode,
                  blockquoteLoc.start.line,
                ).prefix.trimEnd();
              }
              const nextRange = sourceCode.getRange(nextBlock);
              const startNext = nextRange[0] - nextLoc.start.column;
              return fixer.insertTextBeforeRange([startNext, startNext], text);
            }
            // if (expectedblankLine === "never")

            const lines = getParsedLines(sourceCode);
            const linesToRemove: ParsedLine[] = [];
            for (
              let line = prevLoc.end.line + 1;
              line < nextLoc.start.line;
              line++
            ) {
              linesToRemove.push(lines.get(line));
            }
            return linesToRemove.map((line) => fixer.removeRange(line.range));
          },
        });
      }
    }

    return {
      blockquote(node: Blockquote) {
        blockquoteStack = {
          node,
          upper: blockquoteStack,
        };
      },
      "root:exit"(node) {
        checkBlockPadding(node);
      },
      "blockquote:exit"(node) {
        checkBlockPadding(node);
        blockquoteStack = blockquoteStack.upper;
      },
      "listItem:exit"(node) {
        checkBlockPadding(node);
      },
      "footnoteDefinition:exit"(node) {
        checkBlockPadding(node);
      },
    };
  },
});
