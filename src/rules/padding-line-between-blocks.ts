import type {
  Blockquote,
  CustomContainer,
  FootnoteDefinition,
  Html,
  ListItem,
  Root,
} from "../language/ast-types.ts";
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
import type { ExtendedMarkdownSourceCode } from "../language/extended-markdown-language.ts";
import type { JSONSchema4 } from "json-schema";

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
  | "custom-container"
  | "math"
  | "import-code-snippet";
type BlockTypeOption = BlockType | "*";

type ObjectSelector = {
  type: BlockTypeOption | BlockTypeOption[];
  in?: "list" | "blockquote" | "footnote-definition";
};
type Selector = BlockTypeOption | ObjectSelector;

interface PaddingRule {
  prev: Selector | Selector[];
  next: Selector | Selector[];
  blankLine: "any" | "never" | "always";
}

type Options = PaddingRule[];

type MDBlockContainer =
  | Root
  | Blockquote
  | ListItem
  | FootnoteDefinition
  | CustomContainer;

export type MarkdownBlockNode = MDBlock | MDDefinition | MDFrontmatter | Html;

/**
 * Determines whether a blank line must be preserved between two nodes
 * due to Markdown syntax constraints (e.g., setext headings).
 */
export function requiresBlankLineBetween(
  prev: MDNode,
  next: MDNode,
  sourceCode: ExtendedMarkdownSourceCode,
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

const BLOCK_TYPES: BlockTypeOption[] = [
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
  "custom-container",
  "math",
  "import-code-snippet",
  "*",
];

const BLOCK_TYPE_SCHEMAS: JSONSchema4[] = [
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
];

const SELECTOR_SCHEMA: JSONSchema4 = {
  oneOf: [
    ...BLOCK_TYPE_SCHEMAS,
    {
      type: "object",
      properties: {
        type: {
          oneOf: BLOCK_TYPE_SCHEMAS,
        },
        in: {
          enum: ["list", "blockquote", "footnote-definition"],
        },
      },
      required: ["type"],
      additionalProperties: false,
    },
  ],
};

// For MDBlock types - use explicit mapping
const BLOCK_TYPE_MAP0: {
  [K in MarkdownBlockNode["type"]]: BlockType;
} = {
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
  customContainer: "custom-container",
  math: "math",
  importCodeSnippet: "import-code-snippet",
};
const BLOCK_TYPE_MAP: {
  [K in MDNode["type"]]?: BlockType;
} = BLOCK_TYPE_MAP0 as typeof BLOCK_TYPE_MAP;

/**
 * Get the block type of a node
 */
function getBlockType(node: MDNode): BlockType | null {
  const nodeType = node.type;

  const blockType = BLOCK_TYPE_MAP[nodeType];
  if (blockType) {
    return blockType;
  }

  return null;
}

export default createRule<Options>("padding-line-between-blocks", {
  meta: {
    type: "layout",
    docs: {
      description: "require or disallow padding lines between blocks",
      categories: ["standard"],
      listCategory: "Whitespace",
    },
    fixable: "whitespace",
    hasSuggestions: false,
    schema: {
      type: "array",
      items: {
        type: "object",
        properties: {
          prev: SELECTOR_SCHEMA,
          next: SELECTOR_SCHEMA,
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
    const originalOptions: Options = context.options?.length
      ? context.options
      : [
          { prev: "*", next: "*", blankLine: "always" },
          {
            prev: "link-definition",
            next: "link-definition",
            blankLine: "never",
          },
          {
            prev: "footnote-definition",
            next: "footnote-definition",
            blankLine: "never",
          },
          {
            prev: "paragraph",
            next: { type: "list", in: "list" },
            blankLine: "never",
          },
        ];
    const options: Options = [...originalOptions].reverse();

    const containerStack: MDBlockContainer[] = [];

    /**
     * Check if the actual type matches the expected type pattern
     */
    function matchesType(
      actualType: BlockType,
      block: MDNode,
      expected: Selector | Selector[],
    ): BlockType | null {
      if (Array.isArray(expected)) {
        for (const e of expected) {
          const matched = matchesType(actualType, block, e);
          if (matched) return matched;
        }
        return null;
      }
      if (typeof expected === "string") {
        return expected === actualType || expected === "*" ? actualType : null;
      }
      let matched: BlockType | null = null;
      if (Array.isArray(expected.type)) {
        for (const e of expected.type) {
          matched = matchesType(actualType, block, e);
          if (matched) break;
        }
      } else {
        matched = matchesType(actualType, block, expected.type);
      }
      if (!matched) return null;

      if (expected.in === "list") {
        if (containerStack[0]?.type !== "listItem") return null;
      } else if (expected.in === "blockquote") {
        if (containerStack[0]?.type !== "blockquote") return null;
      } else if (expected.in === "footnote-definition") {
        if (containerStack[0]?.type !== "footnoteDefinition") return null;
      }
      return matched;
    }

    /**
     * Get the expected padding between two blocks
     */
    function getExpectedPadding(
      prevBlock: MDNode,
      nextBlock: MDNode,
    ): {
      prev: BlockType;
      next: BlockType;
      blankLine: PaddingRule["blankLine"];
    } | null {
      const prevType = getBlockType(prevBlock);
      const nextType = getBlockType(nextBlock);
      if (!prevType || !nextType) return null;

      for (const rule of options) {
        const prev = matchesType(prevType, prevBlock, rule.prev);
        if (!prev) continue;
        const next = matchesType(nextType, nextBlock, rule.next);
        if (!next) continue;
        return {
          prev,
          next,
          blankLine: rule.blankLine,
        };
      }
      return null; // No rule matched
    }

    /**
     * Check padding between blocks in a container node
     */
    function checkBlockPadding(containerNode: MDBlockContainer) {
      // Check padding between consecutive blocks
      for (let i = 0; i < containerNode.children.length - 1; i++) {
        const prevBlock = containerNode.children[i];
        const nextBlock = containerNode.children[i + 1];

        const expected = getExpectedPadding(prevBlock, nextBlock);
        if (expected === null) continue;

        const prevLoc = sourceCode.getLoc(prevBlock);
        const nextLoc = sourceCode.getLoc(nextBlock);

        const actualBlankLine = nextLoc.start.line - prevLoc.end.line - 1;
        const hasBlankLine = actualBlankLine > 0;

        let messageId: "expectedBlankLine" | "unexpectedBlankLine" =
          "expectedBlankLine";
        if (expected.blankLine === "always") {
          if (hasBlankLine) continue;
          let list: ListItem | null = null;
          const stack = [...containerStack];
          let target: MDBlockContainer | undefined;
          while ((target = stack.shift())) {
            if (target.type === "listItem") {
              list = target;
              break;
            }
          }
          if (list && !list.spread) continue;
          messageId = "expectedBlankLine";
        } else if (expected.blankLine === "never") {
          if (!hasBlankLine) continue;
          if (requiresBlankLineBetween(prevBlock, nextBlock, sourceCode))
            continue;
          messageId = "unexpectedBlankLine";
        } else {
          // "any" case: no reporting needed
          continue;
        }

        const lineLength = sourceCode.lines[nextLoc.start.line - 1].length;

        let blockquote: Blockquote | null = null;
        const stack = [...containerStack];
        let target: MDBlockContainer | undefined;
        while ((target = stack.shift())) {
          if (target.type === "blockquote") {
            blockquote = target;
            break;
          }
        }

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
            prevType: expected.prev,
            nextType: expected.next,
          },
          fix(fixer) {
            if (expected.blankLine === "always") {
              let text = "\n";
              if (blockquote) {
                const blockquoteLoc = sourceCode.getLoc(blockquote);
                text += getBlockquoteLevelFromLine(
                  sourceCode,
                  blockquoteLoc.start.line,
                ).prefix.trimEnd();
              }
              const nextRange = sourceCode.getRange(nextBlock);
              const startNext = nextRange[0] - nextLoc.start.column;
              return fixer.insertTextBeforeRange([startNext, startNext], text);
            }
            // if (expected.blankLine === "never")

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
      "root, blockquote, listItem, footnoteDefinition, customContainer"(
        node: MDBlockContainer,
      ) {
        containerStack.unshift(node);
      },
      "root, blockquote, listItem, footnoteDefinition, customContainer:exit"(
        node: MDBlockContainer,
      ) {
        checkBlockPadding(node);
        containerStack.shift();
      },
    };
  },
});
