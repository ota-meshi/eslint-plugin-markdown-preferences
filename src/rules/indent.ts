import type {
  Blockquote,
  Break,
  Code,
  CustomContainer,
  Definition,
  Delete,
  Emphasis,
  FootnoteDefinition,
  FootnoteReference,
  Heading,
  Html,
  Image,
  ImageReference,
  ImportCodeSnippet,
  InlineCode,
  InlineMath,
  Link,
  LinkReference,
  List,
  ListItem,
  Math,
  Root,
  Strong,
  Table,
  Text,
  ThematicBreak,
} from "../language/ast-types.ts";
import { createRule } from "../utils/index.ts";
import type { ParsedLine } from "../utils/lines.ts";
import { getParsedLines } from "../utils/lines.ts";
import {
  getCodeBlockKind,
  getLinkKind,
  getSourceLocationFromRange,
} from "../utils/ast.ts";
import type {
  Position,
  RuleTextEdit,
  RuleTextEditor,
  SourceLocation,
} from "@eslint/core";
import { isSpaceOrTab, isWhitespace } from "../utils/unicode.ts";
import { parseLinkDefinition } from "../utils/link-definition.ts";
import { atWidth, getWidth, sliceWidth } from "../utils/width.ts";
import { parseInlineLink } from "../utils/link.ts";
import { parseLinkReference } from "../utils/link-reference.ts";
import { parseImage } from "../utils/image.ts";
import { parseImageReference } from "../utils/image-reference.ts";
import type { ParsedListItem } from "../utils/list-item.ts";
import { parseListItem } from "../utils/list-item.ts";
import { parseMathBlock } from "../utils/math-block.ts";

type Options = {
  listItems?: {
    first?: number | "ignore";
    other?: number | "first" | "minimum";
    relativeTo: "markerStart" | "markerEnd" | "taskListMarkerEnd";
  };
};

/**
 * Parse options.
 */
function parseOptions(options: Options | undefined) {
  const listItems = options?.listItems;
  return {
    listItems: {
      first: listItems?.first ?? 1,
      other: listItems?.other ?? "first",
      relativeTo: listItems?.relativeTo ?? "taskListMarkerEnd",
    },
  };
}

export default createRule<[Options?]>("indent", {
  meta: {
    type: "layout",
    docs: {
      description: "enforce consistent indentation in Markdown files",
      categories: ["standard"],
      listCategory: "Whitespace",
    },
    fixable: "whitespace",
    hasSuggestions: false,
    schema: [
      {
        type: "object",
        properties: {
          listItems: {
            type: "object",
            properties: {
              first: {
                anyOf: [
                  {
                    const: "ignore",
                  },
                  {
                    type: "number",
                    minimum: 1,
                  },
                ],
              },
              other: {
                anyOf: [
                  {
                    enum: ["first", "minimum"],
                  },
                  {
                    type: "number",
                    minimum: 1,
                  },
                ],
              },
              relativeTo: {
                enum: [
                  "markerStart",
                  "markerEnd",
                  "taskListMarkerStart",
                  "taskListMarkerEnd",
                ],
              },
            },
            additionalProperties: false,
          },
        },
        additionalProperties: false,
      },
    ],
    messages: {
      wrongIndentation:
        "Expected indentation of {{expected}} but found {{actual}}.",
      wrongIndentationFromBlockquoteMarker:
        "Expected indentation of {{expected}} from the blockquote marker but found {{actual}}.",
      wrongIndentationFromListMarker:
        "Expected indentation of {{expected}} from the list marker but found {{actual}}.",
      wrongIndentationWithTab:
        "Expected indentation of {{expected}} but found {{actual}} (tab width is 4).",
      wrongIndentationFromBlockquoteMarkerWithTab:
        "Expected indentation of {{expected}} from the blockquote marker but found {{actual}} (tab width is 4).",
      wrongIndentationFromListMarkerWithTab:
        "Expected indentation of {{expected}} from the list marker but found {{actual}} (tab width is 4).",
    },
  },
  create(context) {
    const sourceCode = context.sourceCode;
    const options = parseOptions(context.options[0]);

    type Violation = {
      loc: SourceLocation;
      messageId:
        | "wrongIndentation"
        | "wrongIndentationFromBlockquoteMarker"
        | "wrongIndentationFromListMarker"
        | "wrongIndentationWithTab"
        | "wrongIndentationFromBlockquoteMarkerWithTab"
        | "wrongIndentationFromListMarkerWithTab";
      data: {
        expected: number;
        actual: number;
      };
      fix: (fixer: RuleTextEditor) => Iterable<RuleTextEdit>;
    };

    type GetExpectedIndentContext = {
      lineNumber: number;
      block: boolean;
    };

    abstract class AbsBlockStack {
      public abstract upper: BlockStack | null;

      public readonly violations: Violation[] = [];

      public abstract type:
        | "root"
        | "blockquote"
        | "listItem"
        | "footnoteDefinition"
        | "link";

      public getCurrentBlockquote(): BlockquoteStack | null {
        let block = this as unknown as BlockStack | null;
        while (block) {
          if (block.type === "blockquote") {
            return block;
          }
          block = block.upper;
        }
        return null;
      }

      public getCurrentListItemAtLine(
        lineNumber: number,
      ): ListItemStack | null {
        let block = this as unknown as BlockStack | null;
        while (block) {
          if (block.type === "blockquote") {
            return null;
          }
          if (block.type === "listItem") {
            const loc = sourceCode.getLoc(block.node);
            if (loc.start.line === lineNumber) {
              return block;
            }
          }
          block = block.upper;
        }
        return null;
      }

      public abstract getExpectedIndent(
        ctx: GetExpectedIndentContext,
      ): number | "ignore";
    }

    class RootStack extends AbsBlockStack {
      public readonly type = "root";

      public readonly node: Root;

      public readonly upper = null;

      public constructor(node: Root) {
        super();
        this.node = node;
      }

      public getExpectedIndent(): number {
        return 0;
      }
    }

    class BlockquoteStack extends AbsBlockStack {
      public readonly type = "blockquote";

      public readonly node: Blockquote;

      public readonly upper: BlockStack;

      private _expectedIndent?: number;

      private _markerIndent?: number;

      public constructor(node: Blockquote) {
        super();
        this.node = node;
        // eslint-disable-next-line @typescript-eslint/no-use-before-define -- OK
        this.upper = blockStack;
      }

      public getExpectedIndent(): number {
        if (this._expectedIndent == null) {
          const baseIndent = this.getMarkerIndent() + 1;
          this._expectedIndent = baseIndent + 1;
        }
        return this._expectedIndent;
      }

      public getMarkerIndent(): number {
        if (this._markerIndent == null) {
          const loc = sourceCode.getLoc(this.node);
          this._markerIndent = getWidth(
            sourceCode.lines[loc.start.line - 1].slice(0, loc.start.column - 1),
          );
        }
        return this._markerIndent;
      }
    }
    class ListItemStack extends AbsBlockStack {
      public readonly type = "listItem";

      public readonly node: ListItem;

      public readonly upper: BlockStack;

      private _expectedIndentForFirstLine?: number;

      private _expectedIndentForOtherLines?: number | "ignore";

      private _parsed?: ParsedListItem;

      private readonly nodeLoc: SourceLocation;

      public constructor(node: ListItem) {
        super();
        this.node = node;
        // eslint-disable-next-line @typescript-eslint/no-use-before-define -- OK
        this.upper = blockStack;
        this.nodeLoc = sourceCode.getLoc(this.node);
      }

      public getParsedListItem(): ParsedListItem {
        return (this._parsed ??= parseListItem(sourceCode, this.node));
      }

      public getExpectedIndent({
        lineNumber,
        block,
      }: {
        lineNumber: number;
        block: boolean;
      }): number | "ignore" {
        const loc = this.nodeLoc;
        if (lineNumber === loc.start.line) {
          return this.getExpectedIndentForFirstLine();
        }
        // Other lines
        const expected = this.getExpectedIndentAfterFirstLine();
        if (expected === "ignore") return "ignore";
        if (!block) return expected;
        const actualFirstLineIndent = this.getActualFirstLineIndent({
          withoutTaskListMarker: true,
        });
        if (actualFirstLineIndent != null)
          return Math.min(expected, actualFirstLineIndent + 3);
        return expected;
      }

      private getExpectedIndentForFirstLine() {
        if (options.listItems.first === "ignore") {
          return "ignore";
        }
        if (this._expectedIndentForFirstLine != null)
          return this._expectedIndentForFirstLine;
        const loc = this.nodeLoc;
        const parsed = this.getParsedListItem();
        const lineText = sourceCode.lines[loc.start.line - 1];
        if (options.listItems.relativeTo === "markerStart") {
          const baseIndent = getWidth(lineText.slice(0, loc.start.column - 1));
          return (this._expectedIndentForFirstLine = Math.max(
            baseIndent + options.listItems.first,
            baseIndent + parsed.marker.text.length + 1, // At least one space after the marker,
          ));
        }
        if (
          options.listItems.relativeTo === "taskListMarkerEnd" &&
          parsed.taskListItemMarker
        ) {
          const baseIndent = getWidth(
            lineText.slice(0, parsed.taskListItemMarker.loc.end.column - 1),
          );
          return (this._expectedIndentForFirstLine =
            baseIndent + options.listItems.first);
        }
        // relative to markerEnd, or taskListMarkerEnd without task list marker
        const baseIndent = getWidth(
          lineText.slice(0, parsed.marker.loc.end.column - 1),
        );
        return (this._expectedIndentForFirstLine =
          baseIndent + options.listItems.first);
      }

      private getExpectedIndentAfterFirstLine() {
        if (this._expectedIndentForOtherLines != null)
          return this._expectedIndentForOtherLines;
        const loc = this.nodeLoc;
        if (options.listItems.other === "first") {
          const firstLineIndent = this.getExpectedIndentForFirstLine();
          if (firstLineIndent === "ignore") {
            const actualFirstLineIndent = this.getActualFirstLineIndent();
            if (actualFirstLineIndent != null) {
              return (this._expectedIndentForOtherLines =
                actualFirstLineIndent);
            }
            for (const child of this.node.children) {
              const childLoc = sourceCode.getLoc(child);
              if (loc.start.line < childLoc.start.line) {
                return (this._expectedIndentForOtherLines = getWidth(
                  sourceCode.lines[childLoc.start.line - 1].slice(
                    0,
                    childLoc.start.column - 1,
                  ),
                ));
              }
            }
          }
          return (this._expectedIndentForOtherLines = firstLineIndent);
        }
        if (options.listItems.other === "minimum") {
          return (this._expectedIndentForOtherLines =
            this.getMinimumLineIndent());
        }
        const lineText = sourceCode.lines[loc.start.line - 1];
        if (options.listItems.relativeTo === "markerStart") {
          const baseIndent = getWidth(lineText.slice(0, loc.start.column - 1));
          const minimumLineIndent = this.getMinimumLineIndent();
          return (this._expectedIndentForOtherLines = Math.max(
            baseIndent + options.listItems.other,
            minimumLineIndent,
          ));
        }
        const parsed = this.getParsedListItem();
        if (
          options.listItems.relativeTo === "taskListMarkerEnd" &&
          parsed.taskListItemMarker
        ) {
          const baseIndent = getWidth(
            lineText.slice(0, parsed.taskListItemMarker.loc.end.column - 1),
          );
          return (this._expectedIndentForOtherLines =
            baseIndent + options.listItems.other);
        }
        // relative to markerEnd, or taskListMarkerEnd without task list marker
        const baseIndent = getWidth(
          lineText.slice(0, parsed.marker.loc.end.column - 1),
        );
        return (this._expectedIndentForOtherLines =
          baseIndent + options.listItems.other);
      }

      private getMinimumLineIndent() {
        const actualFirstLineIndent = this.getActualFirstLineIndent({
          withoutTaskListMarker: true,
        });
        if (actualFirstLineIndent != null) {
          return (this._expectedIndentForOtherLines = actualFirstLineIndent);
        }
        const parsed = this.getParsedListItem();
        const lineText = sourceCode.lines[parsed.marker.loc.end.line - 1];
        return (
          getWidth(lineText.slice(0, parsed.marker.loc.end.column - 1)) + 1
        );
      }

      private getActualFirstLineIndent({ withoutTaskListMarker = false } = {}) {
        const parsed = this.getParsedListItem();
        const markerEndPos = withoutTaskListMarker
          ? parsed.marker.loc.end
          : (parsed.taskListItemMarker?.loc.end ?? parsed.marker.loc.end);
        const lineText = sourceCode.lines[markerEndPos.line - 1];
        const afterMarkerText = lineText.slice(markerEndPos.column - 1);
        const trimmedAfterMarkerText = afterMarkerText.trimStart();
        if (trimmedAfterMarkerText) {
          const afterMarkerSpacesLength =
            afterMarkerText.length - trimmedAfterMarkerText.length;
          return getWidth(
            lineText.slice(
              0,
              markerEndPos.column - 1 + afterMarkerSpacesLength,
            ),
          );
        }
        return null;
      }
    }
    class FootnoteDefinitionStack extends AbsBlockStack {
      public readonly type = "footnoteDefinition";

      public readonly node: FootnoteDefinition;

      public readonly upper: BlockStack;

      private _expectedIndent?: number;

      public constructor(node: FootnoteDefinition) {
        super();
        this.node = node;
        // eslint-disable-next-line @typescript-eslint/no-use-before-define -- OK
        this.upper = blockStack;
      }

      public getExpectedIndent(): number {
        if (this._expectedIndent == null) {
          const loc = sourceCode.getLoc(this.node);
          const baseIndent = getWidth(
            sourceCode.lines[loc.start.line - 1].slice(0, loc.start.column - 1),
          );
          this._expectedIndent = baseIndent + 4;
        }
        return this._expectedIndent;
      }
    }
    class LinkStack extends AbsBlockStack {
      public readonly type = "link";

      public readonly node: Link | LinkReference;

      public readonly upper: BlockStack;

      private readonly nodeLoc: SourceLocation;

      public constructor(node: Link | LinkReference) {
        super();
        this.node = node;
        // eslint-disable-next-line @typescript-eslint/no-use-before-define -- OK
        this.upper = blockStack;
        this.nodeLoc = sourceCode.getLoc(this.node);
      }

      public getExpectedIndent(
        ctx: GetExpectedIndentContext,
      ): number | "ignore" {
        const loc = this.nodeLoc;

        if (ctx.lineNumber === loc.start.line) {
          // First line
          return this.upper.getExpectedIndent(ctx);
        }
        // Other lines (in Text spans)
        const base = this.upper.getExpectedIndent({
          lineNumber: loc.start.line,
          block: ctx.block,
        });
        if (base === "ignore") {
          return "ignore";
        }
        return base + 2;
      }
    }
    type BlockStack =
      | RootStack
      | BlockquoteStack
      | ListItemStack
      | FootnoteDefinitionStack
      | LinkStack;
    let blockStack: BlockStack = new RootStack(sourceCode.ast);
    const reportedLocations: Record<number, Set<number> | undefined> =
      Object.create(null);

    /**
     * Reported locations (line and column) to avoid duplicate reports.
     */
    function reportIncorrectIndent(violation: Violation) {
      const reportedColumns = (reportedLocations[violation.loc.start.line] ??=
        new Set());
      if (reportedColumns.has(violation.loc.start.column)) {
        return;
      }
      reportedColumns.add(violation.loc.start.column);
      blockStack.violations.push(violation);
    }

    /**
     * Flush violations to the context.
     */
    function flushViolations({ violations }: BlockStack) {
      for (const violation of violations) {
        context.report({
          loc: violation.loc,
          messageId: violation.messageId,
          data: {
            expected: String(violation.data.expected),
            actual: String(violation.data.actual),
          },
          fix(fixer) {
            const result: RuleTextEdit[] = [];
            for (const { fix } of violations) {
              result.push(...fix(fixer));
            }
            return result;
          },
        });
      }
    }

    return {
      thematicBreak: verifyThematicBreak,
      heading: verifyHeading,
      code: verifyCodeBlock,
      html: verifyHtml,
      definition: verifyLinkDefinition,
      table: verifyTable,
      list: verifyList,
      customContainer: verifyCustomContainer,
      math: verifyMathBlock,
      importCodeSnippet: verifyImportCodeSnippet,
      inlineCode: verifyInlineCodeOrInlineMath,
      emphasis: verifyEmphasisOrStrongOrDelete,
      strong: verifyEmphasisOrStrongOrDelete,
      delete: verifyEmphasisOrStrongOrDelete,
      image: verifyImage,
      imageReference: verifyImageReference,
      footnoteReference: verifyInline,
      break: verifyInline,
      text: verifyText,
      inlineMath: verifyInlineCodeOrInlineMath,
      blockquote(node) {
        verifyBlockquote(node);
        blockStack = new BlockquoteStack(node);
      },
      listItem(node) {
        blockStack = new ListItemStack(node);
      },
      footnoteDefinition(node) {
        verifyFootnoteDefinition(node);
        blockStack = new FootnoteDefinitionStack(node);
      },
      link(node) {
        verifyLink(node);
        blockStack = new LinkStack(node);
      },
      linkReference(node) {
        verifyLinkReference(node);
        blockStack = new LinkStack(node);
      },
      "blockquote, listItem, footnoteDefinition, link, linkReference:exit"() {
        flushViolations(blockStack);
        blockStack = blockStack.upper!;
      },
      "root:exit"() {
        flushViolations(blockStack);
      },
    };

    /**
     * Verify a thematic break node.
     */
    function verifyThematicBreak(node: ThematicBreak) {
      const loc = sourceCode.getLoc(node);
      verifyLinesIndent(
        lineNumbersFromRange(loc.start.line, loc.end.line),
        (lineNumber) =>
          blockStack.getExpectedIndent({ lineNumber, block: true }),
      );
    }

    /**
     * Verify a heading node.
     */
    function verifyHeading(node: Heading) {
      const loc = sourceCode.getLoc(node);
      verifyLinesIndent(
        lineNumbersFromRange(loc.start.line, loc.end.line),
        (lineNumber) =>
          blockStack.getExpectedIndent({ lineNumber, block: true }),
      );
    }

    /**
     * Verify a code block node.
     */
    function verifyCodeBlock(node: Code) {
      const kind = getCodeBlockKind(sourceCode, node);
      if (kind === "indented") {
        // Ignore indented code blocks
        return;
      }
      const loc = sourceCode.getLoc(node);
      verifyLinesIndent(
        [loc.start.line, loc.end.line],
        (lineNumber) =>
          blockStack.getExpectedIndent({ lineNumber, block: true }),
        (fixer, info) => {
          return additionalFixesForCodeBlock(
            node,
            fixer,
            info,
            loc.start.line + 1,
            loc.end.line - 1,
          );
        },
      );
    }

    /**
     * Verify an HTML node.
     */
    function verifyHtml(node: Html) {
      const loc = sourceCode.getLoc(node);
      if (!inlineToBeChecked(loc.start)) {
        return;
      }
      verifyLinesIndent([loc.start.line], (lineNumber) =>
        blockStack.getExpectedIndent({ lineNumber, block: true }),
      );
    }

    /**
     * Verify a link definition node.
     */
    function verifyLinkDefinition(node: Definition) {
      const parsed = parseLinkDefinition(sourceCode, node);
      if (!parsed) {
        // Ignore invalid link definitions
        return;
      }
      const loc = sourceCode.getLoc(node);

      verifyLinesIndent(
        lineNumbersFromRange(loc.start.line, loc.end.line),
        (lineNumber, column) => {
          const baseIndent = blockStack.getExpectedIndent({
            lineNumber,
            block: true,
          });
          if (baseIndent === "ignore") {
            return "ignore";
          }
          if (lineNumber <= loc.start.line) {
            return baseIndent;
          }
          if (lineNumber < parsed.label.loc.end.line) {
            return baseIndent + 2;
          }
          if (lineNumber === parsed.label.loc.end.line) {
            const line = getParsedLines(sourceCode).get(lineNumber);
            if (!line) return baseIndent; // Unexpected, but just in case
            const between = line.text.slice(
              column - 1,
              parsed.label.loc.end.column - 2,
            );
            return !between || isWhitespace(between)
              ? // e.g. [
                //   label
                // ]: ...
                baseIndent
              : // e.g. [
                //   label]: ...
                baseIndent + 2;
          }
          if (lineNumber <= parsed.destination.loc.end.line) {
            return baseIndent + 4;
          }
          if (!parsed.title) return baseIndent; // Unexpected, but just in case
          if (lineNumber <= parsed.title.loc.start.line) {
            return baseIndent + 4;
          }
          if (lineNumber < parsed.title.loc.end.line) {
            return baseIndent + 6;
          }
          if (lineNumber === parsed.title.loc.end.line) {
            const line = getParsedLines(sourceCode).get(lineNumber);
            if (!line) return baseIndent; // Unexpected, but just in case
            const between = line.text.slice(
              column - 1,
              parsed.title.loc.end.column - 2,
            );
            return !between || isWhitespace(between)
              ? // e.g.
                // [label]: #x "
                //   title
                // "
                baseIndent + 4
              : // e.g.
                // [label]: #x "
                //   title"
                baseIndent + 6;
          }
          return baseIndent; // Unexpected, but just in case
        },
      );
    }

    /**
     * Verify a blockquote node.
     */
    function verifyBlockquote(node: Blockquote) {
      const loc = sourceCode.getLoc(node);
      verifyLinesIndent(
        lineNumbersFromRange(loc.start.line, loc.end.line),
        (lineNumber) =>
          blockStack.getExpectedIndent({ lineNumber, block: true }),
      );
    }

    /**
     * Verify a table node.
     */
    function verifyTable(node: Table) {
      const loc = sourceCode.getLoc(node);
      verifyLinesIndent(
        lineNumbersFromRange(loc.start.line, loc.end.line),
        (lineNumber) =>
          blockStack.getExpectedIndent({ lineNumber, block: true }),
      );
    }

    /**
     * Verify a list node.
     */
    function verifyList(node: List) {
      const loc = sourceCode.getLoc(node);
      verifyLinesIndent(
        [loc.start.line],
        (lineNumber) =>
          blockStack.getExpectedIndent({ lineNumber, block: true }),
        additionalFixes,
      );

      /**
       * Additional fixes for list item lines.
       */
      function* additionalFixes(
        fixer: RuleTextEditor,
        info: {
          loc: SourceLocation;
          expectedIndentWidth: number;
          actualIndentWidth: number;
        },
      ) {
        const [firstItem, ...otherItems] = node.children;
        yield* fixAfterFirstLine(firstItem, info.actualIndentWidth);
        for (const listItem of otherItems) {
          const listItemLoc = sourceCode.getLoc(listItem);
          const listItemIndentWidth = getWidth(
            sourceCode.lines[listItemLoc.start.line - 1].slice(
              0,
              listItemLoc.start.column - 1,
            ),
          );
          if (listItemIndentWidth === info.expectedIndentWidth) continue;
          yield getFixForLine(listItemLoc.start.line, listItemIndentWidth);
          yield* fixAfterFirstLine(listItem, listItemIndentWidth);
        }

        /**
         * Get fixes for lines after the first line of the list item.
         */
        function* fixAfterFirstLine(item: ListItem, actualIndentWidth: number) {
          const itemLoc = sourceCode.getLoc(item);
          for (
            let lineNumber = itemLoc.start.line + 1;
            lineNumber <= itemLoc.end.line;
            lineNumber++
          ) {
            yield getFixForLine(lineNumber, actualIndentWidth);
          }
        }

        /**
         * Get a fix for a line.
         */
        function getFixForLine(lineNumber: number, actualIndentWidth: number) {
          const line = getParsedLines(sourceCode).get(lineNumber);
          if (info.expectedIndentWidth > actualIndentWidth) {
            // Add indentation
            const before = sliceWidth(line.text, 0, actualIndentWidth);
            const diffWidth = info.expectedIndentWidth - actualIndentWidth;
            return fixer.insertTextAfterRange(
              [line.range[0], line.range[0] + before.length],
              " ".repeat(diffWidth),
            );
          }
          // Remove indentation
          let before = sliceWidth(line.text, 0, info.expectedIndentWidth);
          let between = sliceWidth(
            line.text,
            info.expectedIndentWidth,
            actualIndentWidth,
          );
          while (between && !isSpaceOrTab(between)) {
            before += between[0];
            between = between.slice(1);
          }
          return fixer.replaceTextRange(
            [line.range[0], line.range[0] + before.length + between.length],
            before,
          );
        }
      }
    }

    /**
     * Verify a custom container node.
     */
    function verifyCustomContainer(node: CustomContainer) {
      const loc = sourceCode.getLoc(node);
      verifyLinesIndent([loc.start.line, loc.end.line], (lineNumber) =>
        blockStack.getExpectedIndent({ lineNumber, block: true }),
      );
    }

    /**
     * Verify a math node.
     */
    function verifyMathBlock(node: Math) {
      const parsed = parseMathBlock(sourceCode, node);
      if (!parsed) return;
      const loc = sourceCode.getLoc(node);
      const endLineToBeChecked =
        parsed.closingSequence &&
        inlineToBeChecked(parsed.closingSequence.loc.start);
      verifyLinesIndent(
        endLineToBeChecked ? [loc.start.line, loc.end.line] : [loc.start.line],
        (lineNumber) =>
          blockStack.getExpectedIndent({ lineNumber, block: true }),
        (fixer, info) => {
          return additionalFixesForCodeBlock(
            node,
            fixer,
            info,
            loc.start.line + 1,
            endLineToBeChecked ? loc.end.line - 1 : loc.end.line,
          );
        },
      );
    }

    /**
     * Verify an import code snippet node.
     */
    function verifyImportCodeSnippet(node: ImportCodeSnippet) {
      const loc = sourceCode.getLoc(node);
      verifyLinesIndent(
        lineNumbersFromRange(loc.start.line, loc.end.line),
        (lineNumber) =>
          blockStack.getExpectedIndent({ lineNumber, block: true }),
      );
    }

    /**
     * Verify a footnote definition node.
     */
    function verifyFootnoteDefinition(node: FootnoteDefinition) {
      const loc = sourceCode.getLoc(node);
      verifyLinesIndent([loc.start.line], (lineNumber) =>
        blockStack.getExpectedIndent({ lineNumber, block: true }),
      );
    }

    /**
     * Verify an inline code/math node.
     */
    function verifyInlineCodeOrInlineMath(node: InlineCode | InlineMath) {
      const loc = sourceCode.getLoc(node);
      if (!inlineToBeChecked(loc.start)) {
        return;
      }
      verifyLinesIndent([loc.start.line], (lineNumber) =>
        blockStack.getExpectedIndent({ lineNumber, block: false }),
      );
    }

    /**
     * Verify an emphasis, strong, or delete node.
     */
    function verifyEmphasisOrStrongOrDelete(node: Emphasis | Strong | Delete) {
      const loc = sourceCode.getLoc(node);
      if (!inlineToBeChecked(loc.start)) {
        return;
      }
      verifyLinesIndent([loc.start.line], (lineNumber) =>
        blockStack.getExpectedIndent({ lineNumber, block: false }),
      );
    }

    /**
     * Verify a link node.
     */
    function verifyLink(node: Link) {
      const loc = sourceCode.getLoc(node);
      let lines = lineNumbersFromRange(loc.start.line, loc.end.line);
      if (!inlineToBeChecked(loc.start)) {
        lines = lines.slice(1);
      }

      const kind = getLinkKind(sourceCode, node);
      if (kind === "autolink" || kind === "gfm-autolink") {
        verifyLinesIndent(lines, (lineNumber) =>
          blockStack.getExpectedIndent({ lineNumber, block: false }),
        );
      } else if (kind === "inline") {
        const parsed = parseInlineLink(sourceCode, node);
        if (!parsed) return;
        const lastChild = node.children.at(-1);
        if (
          lastChild &&
          parsed.text.loc.start.line < parsed.text.loc.end.line
        ) {
          const lastChildLoc = sourceCode.getLoc(lastChild);
          const lastChildEndLine =
            lastChild.type === "text" && lastChild.value.endsWith("\n")
              ? lastChildLoc.end.line - 1
              : lastChildLoc.end.line;
          lines = lines.filter(
            (lineNumber) =>
              lineNumber <= parsed.text.loc.start.line ||
              lastChildEndLine < lineNumber,
          );
        }
        verifyLinesIndent(lines, (lineNumber, column) => {
          const baseIndent = blockStack.getExpectedIndent({
            lineNumber,
            block: false,
          });
          if (baseIndent === "ignore") {
            return "ignore";
          }
          if (lineNumber <= loc.start.line) {
            return baseIndent;
          }
          if (lineNumber < parsed.text.loc.end.line) {
            return baseIndent + 2;
          }
          if (lineNumber <= parsed.openingParen.loc.end.line) {
            return baseIndent;
          }
          if (lineNumber <= parsed.destination.loc.end.line) {
            return baseIndent + 2;
          }
          if (!parsed.title) return baseIndent; // Closing parenthesis
          if (lineNumber <= parsed.title.loc.start.line) {
            return baseIndent + 2;
          }
          if (lineNumber < parsed.title.loc.end.line) {
            return baseIndent + 4;
          }
          if (lineNumber === parsed.title.loc.end.line) {
            const line = getParsedLines(sourceCode).get(lineNumber);
            if (!line) return baseIndent; // Unexpected, but just in case
            const between = line.text.slice(
              column - 1,
              parsed.title.loc.end.column - 2,
            );
            return !between || isWhitespace(between)
              ? // e.g.
                // [label](#x
                //   "
                //     title
                //   ") <-- title ends here
                baseIndent + 2
              : // e.g.
                // [label]:(#x
                //   "
                //     title") <-- title ends here
                baseIndent + 4;
          }
          return baseIndent; // Closing parenthesis
        });
      }
    }

    /**
     * Verify a link reference node.
     */
    function verifyLinkReference(node: LinkReference) {
      const loc = sourceCode.getLoc(node);
      const parsed = parseLinkReference(sourceCode, node);
      if (!parsed) return;
      let lines = lineNumbersFromRange(loc.start.line, loc.end.line);
      if (!inlineToBeChecked(loc.start)) {
        lines = lines.slice(1);
      }
      const lastChild = node.children.at(-1);
      if (lastChild && parsed.text.loc.start.line < parsed.text.loc.end.line) {
        const lastChildLoc = sourceCode.getLoc(lastChild);
        const lastChildEndLine =
          lastChild.type === "text" && lastChild.value.endsWith("\n")
            ? lastChildLoc.end.line - 1
            : lastChildLoc.end.line;
        lines = lines.filter(
          (lineNumber) =>
            lineNumber <= parsed.text.loc.start.line ||
            lastChildEndLine < lineNumber,
        );
      }

      verifyLinesIndent(lines, (lineNumber, column) => {
        const baseIndent = blockStack.getExpectedIndent({
          lineNumber,
          block: false,
        });
        if (baseIndent === "ignore") {
          return "ignore";
        }
        if (lineNumber <= loc.start.line) {
          return baseIndent;
        }
        if (lineNumber < parsed.text.loc.end.line) {
          return baseIndent + 2;
        }
        if (!parsed.label) return baseIndent; // Closing bracket
        if (lineNumber <= parsed.label.loc.start.line) {
          return baseIndent;
        }
        if (lineNumber < parsed.label.loc.end.line) {
          return baseIndent + 2;
        }
        if (lineNumber === parsed.label.loc.end.line) {
          const line = getParsedLines(sourceCode).get(lineNumber);
          if (!line) return baseIndent; // Unexpected, but just in case
          const between = line.text.slice(
            column - 1,
            parsed.label.loc.end.column - 2,
          );
          return !between || isWhitespace(between)
            ? // e.g.
              // [text][
              //   label
              // ] <-- label ends here
              baseIndent
            : // e.g.
              // [text][
              //   label] <-- label ends here
              baseIndent + 2;
        }
        return baseIndent; // Closing bracket
      });
    }

    /**
     * Verify an image node.
     */
    function verifyImage(node: Image) {
      const loc = sourceCode.getLoc(node);
      let lines = lineNumbersFromRange(loc.start.line, loc.end.line);
      if (!inlineToBeChecked(loc.start)) {
        lines = lines.slice(1);
      }

      const parsed = parseImage(sourceCode, node);
      if (!parsed) return;
      verifyLinesIndent(lines, (lineNumber, column) => {
        const baseIndent = blockStack.getExpectedIndent({
          lineNumber,
          block: false,
        });
        if (baseIndent === "ignore") {
          return "ignore";
        }
        if (lineNumber <= loc.start.line) {
          return baseIndent;
        }
        if (lineNumber < parsed.text.loc.end.line) {
          return baseIndent + 2;
        }
        if (lineNumber === parsed.text.loc.end.line) {
          const line = getParsedLines(sourceCode).get(lineNumber);
          if (!line) return baseIndent; // Unexpected, but just in case
          const between = line.text.slice(
            column - 1,
            parsed.text.loc.end.column - 2,
          );
          return !between || isWhitespace(between)
            ? // e.g. ![
              //   alt
              // ]: ...
              baseIndent
            : // e.g. ![
              //   alt]: ...
              baseIndent + 2;
        }
        if (lineNumber <= parsed.openingParen.loc.end.line) {
          return baseIndent;
        }
        if (lineNumber <= parsed.destination.loc.end.line) {
          return baseIndent + 2;
        }
        if (!parsed.title) return baseIndent; // Closing parenthesis
        if (lineNumber <= parsed.title.loc.start.line) {
          return baseIndent + 2;
        }
        if (lineNumber < parsed.title.loc.end.line) {
          return baseIndent + 4;
        }
        if (lineNumber === parsed.title.loc.end.line) {
          const line = getParsedLines(sourceCode).get(lineNumber);
          if (!line) return baseIndent; // Unexpected, but just in case
          const between = line.text.slice(
            column - 1,
            parsed.title.loc.end.column - 2,
          );
          return !between || isWhitespace(between)
            ? // e.g.
              // ![alt]:(/image.png
              //   "
              //     title
              //   ") <-- title ends here
              baseIndent + 2
            : // e.g.
              // ![alt]:(/image.png
              //   "
              //     title") <-- title ends here
              baseIndent + 4;
        }
        return baseIndent; // Closing parenthesis
      });
    }

    /**
     * Verify an image reference node.
     */
    function verifyImageReference(node: ImageReference) {
      const loc = sourceCode.getLoc(node);
      const parsed = parseImageReference(sourceCode, node);
      if (!parsed) return;
      let lines = lineNumbersFromRange(loc.start.line, loc.end.line);
      if (!inlineToBeChecked(loc.start)) {
        lines = lines.slice(1);
      }
      verifyLinesIndent(lines, (lineNumber, column) => {
        const baseIndent = blockStack.getExpectedIndent({
          lineNumber,
          block: false,
        });
        if (baseIndent === "ignore") {
          return "ignore";
        }
        if (lineNumber <= loc.start.line) {
          return baseIndent;
        }
        if (lineNumber < parsed.text.loc.end.line) {
          return baseIndent + 2;
        }
        if (lineNumber === parsed.text.loc.end.line) {
          const line = getParsedLines(sourceCode).get(lineNumber);
          if (!line) return baseIndent; // Unexpected, but just in case
          const between = line.text.slice(
            column - 1,
            parsed.text.loc.end.column - 2,
          );
          return !between || isWhitespace(between)
            ? // e.g. ![
              //   alt
              // ][]
              baseIndent
            : // e.g. ![
              //   alt][]
              baseIndent + 2;
        }
        if (!parsed.label) return baseIndent; // Closing bracket
        if (lineNumber <= parsed.label.loc.start.line) {
          return baseIndent;
        }
        if (lineNumber < parsed.label.loc.end.line) {
          return baseIndent + 2;
        }
        if (lineNumber === parsed.label.loc.end.line) {
          const line = getParsedLines(sourceCode).get(lineNumber);
          if (!line) return baseIndent; // Unexpected, but just in case
          const between = line.text.slice(
            column - 1,
            parsed.label.loc.end.column - 2,
          );
          return !between || isWhitespace(between)
            ? // e.g.
              // ![alt][
              //   label
              // ] <-- label ends here
              baseIndent
            : // e.g.
              // ![alt][
              //   label] <-- label ends here
              baseIndent + 2;
        }
        return baseIndent; // Closing bracket
      });
    }

    /**
     * Verify a text node.
     */
    function verifyText(node: Text) {
      const loc = sourceCode.getLoc(node);
      let lines = lineNumbersFromRange(loc.start.line, loc.end.line);
      if (!inlineToBeChecked(loc.start)) {
        lines = lines.slice(1);
      }
      if (node.value.endsWith("\n")) {
        lines = lines.slice(0, -1);
      }
      verifyLinesIndent(lines, (lineNumber) =>
        blockStack.getExpectedIndent({ lineNumber, block: false }),
      );
    }

    /**
     * Verify an inline node.
     */
    function verifyInline(node: Break | FootnoteReference) {
      const loc = sourceCode.getLoc(node);
      let lines = lineNumbersFromRange(loc.start.line, loc.end.line);
      if (!inlineToBeChecked(loc.start)) {
        lines = lines.slice(1);
      }
      verifyLinesIndent(lines, (lineNumber) =>
        blockStack.getExpectedIndent({ lineNumber, block: false }),
      );
    }

    /**
     * Check whether the inline node should be checked.
     */
    function inlineToBeChecked(position: Position): boolean {
      const blockquote = blockStack.getCurrentBlockquote();
      const listItem = blockStack.getCurrentListItemAtLine(position.line);
      const lineText = sourceCode.lines[position.line - 1];
      if (listItem) {
        const parsed = listItem.getParsedListItem();
        const indentText = lineText.slice(
          (parsed.taskListItemMarker?.loc ?? parsed.marker.loc).end.column - 1,
          position.column - 1,
        );
        if (indentText && !isSpaceOrTab(indentText)) {
          // Ignore if the node is not indented from the list item marker
          return false;
        }
      } else if (blockquote) {
        if (atWidth(lineText, blockquote.getMarkerIndent()) !== ">") {
          // Ignore if the line does not have the blockquote marker that same location
          return false;
        }
        const indentText = sliceWidth(
          lineText.slice(0, position.column - 1),
          blockquote.getMarkerIndent() + 1,
        );

        if (indentText && !isSpaceOrTab(indentText)) {
          // Ignore if the HTML node is not indented from the blockquote marker
          return false;
        }
      } else {
        const indentText = lineText.slice(0, position.column - 1);
        if (indentText && !isSpaceOrTab(indentText)) {
          // Ignore if the HTML node is not indented from the line start
          return false;
        }
      }
      return true;
    }

    /**
     * Get line numbers from the range.
     */
    function lineNumbersFromRange(
      lineNumberFrom: number,
      lineNumberTo: number,
    ) {
      const lines: number[] = [];
      for (
        let lineNumber = lineNumberFrom;
        lineNumber <= lineNumberTo;
        lineNumber++
      ) {
        lines.push(lineNumber);
      }
      return lines;
    }

    /**
     * Verify the indentation of the lines.
     */
    function verifyLinesIndent(
      lineNumbers: number[],
      expectedIndentWidthProvider: (
        lineNumber: number,
        column: number,
      ) => number | "ignore",
      additionalFixes?: (
        fixer: RuleTextEditor,
        info: {
          loc: SourceLocation;
          expectedIndentWidth: number;
          actualIndentWidth: number;
        },
      ) => Iterable<RuleTextEdit> | null,
    ) {
      const blockquote = blockStack.getCurrentBlockquote();
      if (!blockquote) {
        verifyLinesIndentFromRoot(
          lineNumbers,
          expectedIndentWidthProvider,
          additionalFixes,
        );
        return;
      }
      verifyLinesIndentFromBlockquoteMarker(
        lineNumbers,
        blockquote,
        expectedIndentWidthProvider,
        additionalFixes,
      );
    }

    /**
     * Verify the indentation of the lines from the root.
     */
    function verifyLinesIndentFromRoot(
      lineNumbers: number[],
      expectedIndentWidthProvider: (
        lineNumber: number,
        column: number,
      ) => number | "ignore",
      additionalFixes?: (
        fixer: RuleTextEditor,
        info: {
          loc: SourceLocation;
          expectedIndentWidth: number;
          actualIndentWidth: number;
        },
      ) => Iterable<RuleTextEdit> | null,
    ) {
      const reports: {
        loc: SourceLocation;
        messageId:
          | "wrongIndentation"
          | "wrongIndentationWithTab"
          | "wrongIndentationFromListMarker"
          | "wrongIndentationFromListMarkerWithTab";
        data: { expected: number; actual: number };
        fix: (fixer: RuleTextEditor) => RuleTextEdit;
        expectedIndentWidth: number;
        actualIndentWidth: number;
      }[] = [];
      for (const lineNumber of lineNumbers) {
        const line = getParsedLines(sourceCode).get(lineNumber);
        if (!line) return;
        const listItem = blockStack.getCurrentListItemAtLine(lineNumber);
        if (!listItem) {
          const indentText = /^\s*/u.exec(line.text)![0];
          const actualIndentWidth = getWidth(indentText);
          const expectedIndentWidth = expectedIndentWidthProvider(
            lineNumber,
            1,
          );
          if (expectedIndentWidth === "ignore") continue;
          if (actualIndentWidth === expectedIndentWidth) continue;
          reports.push({
            loc: {
              start: { line: line.line, column: 1 },
              end: { line: line.line, column: indentText.length + 1 },
            },
            messageId: indentText.includes("\t")
              ? "wrongIndentationWithTab"
              : "wrongIndentation",
            data: { expected: expectedIndentWidth, actual: actualIndentWidth },
            fix(fixer) {
              return fixer.replaceTextRange(
                [line.range[0], line.range[0] + indentText.length],
                " ".repeat(expectedIndentWidth),
              );
            },
            expectedIndentWidth,
            actualIndentWidth,
          });
          continue;
        }
        const report = verifyLineIndentFromListItemMarker(
          line,
          listItem,
          expectedIndentWidthProvider,
        );
        if (!report) continue;
        reports.push(report);
      }

      if (!reports.length) return;

      for (const report of reports) {
        reportIncorrectIndent({
          loc: report.loc,
          messageId: report.messageId,
          data: report.data,
          *fix(fixer) {
            yield report.fix(fixer);
            if (additionalFixes) {
              yield* additionalFixes(fixer, report) ?? [];
            }
          },
        });
      }
    }

    /**
     * Verify the indentation of the lines from the blockquote marker.
     */
    function verifyLinesIndentFromBlockquoteMarker(
      lineNumbers: number[],
      blockquote: BlockquoteStack,
      expectedIndentWidthProvider: (
        lineNumber: number,
        column: number,
      ) => number | "ignore",
      additionalFixes?: (
        fixer: RuleTextEditor,
        info: {
          loc: SourceLocation;
          expectedIndentWidth: number;
          actualIndentWidth: number;
        },
      ) => Iterable<RuleTextEdit> | null,
    ) {
      const blockquoteLoc = sourceCode.getLoc(blockquote.node);
      const reports: {
        loc: SourceLocation;
        messageId:
          | "wrongIndentationFromBlockquoteMarker"
          | "wrongIndentationFromBlockquoteMarkerWithTab"
          | "wrongIndentationFromListMarker"
          | "wrongIndentationFromListMarkerWithTab";
        data: { expected: number; actual: number };
        fix: (fixer: RuleTextEditor) => RuleTextEdit;
        expectedIndentWidth: number;
        actualIndentWidth: number;
      }[] = [];
      let cannotFix = false;
      for (const lineNumber of lineNumbers) {
        const line = getParsedLines(sourceCode).get(lineNumber);
        if (!line) return;
        if (atWidth(line.text, blockquote.getMarkerIndent()) !== ">") {
          // Ignore if the line does not have the blockquote marker that same location
          cannotFix = true;
          continue;
        }
        const listItem = blockStack.getCurrentListItemAtLine(lineNumber);
        if (!listItem) {
          const before = line.text.slice(0, blockquoteLoc.start.column);
          const after = line.text.slice(blockquoteLoc.start.column);
          const indentText = /^\s*/u.exec(after)![0];
          const actualIndentWidth = getWidth(before + indentText);
          const expectedIndentWidth = expectedIndentWidthProvider(
            lineNumber,
            blockquoteLoc.start.column + 1,
          );
          if (expectedIndentWidth === "ignore") continue;
          if (actualIndentWidth === expectedIndentWidth) continue;
          const linePrefixWidth = getWidth(before);

          reports.push({
            loc: {
              start: {
                line: line.line,
                column: blockquoteLoc.start.column + 1,
              },
              end: {
                line: line.line,
                column: blockquoteLoc.start.column + 1 + indentText.length,
              },
            },
            messageId: indentText.includes("\t")
              ? "wrongIndentationFromBlockquoteMarkerWithTab"
              : "wrongIndentationFromBlockquoteMarker",
            data: {
              expected: expectedIndentWidth - linePrefixWidth,
              actual: actualIndentWidth - linePrefixWidth,
            },
            fix(fixer) {
              return fixer.replaceTextRange(
                [
                  line.range[0] + blockquoteLoc.start.column,
                  line.range[0] +
                    blockquoteLoc.start.column +
                    indentText.length,
                ],
                " ".repeat(expectedIndentWidth - linePrefixWidth),
              );
            },
            expectedIndentWidth,
            actualIndentWidth,
          });
          continue;
        }
        const report = verifyLineIndentFromListItemMarker(
          line,
          listItem,
          expectedIndentWidthProvider,
        );
        if (!report) continue;
        reports.push(report);
      }

      if (!reports.length) return;

      for (const report of reports) {
        reportIncorrectIndent({
          loc: report.loc,
          messageId: report.messageId,
          data: report.data,
          *fix(fixer) {
            if (cannotFix) return;
            yield report.fix(fixer);
            if (additionalFixes) {
              yield* additionalFixes(fixer, report) ?? [];
            }
          },
        });
      }
    }

    /**
     * Verify the indentation of the line from the list item marker.
     */
    function verifyLineIndentFromListItemMarker(
      line: ParsedLine,
      listItem: ListItemStack,
      expectedIndentWidthProvider: (
        lineNumber: number,
        column: number,
      ) => number | "ignore",
    ): {
      loc: SourceLocation;
      messageId:
        | "wrongIndentationFromListMarker"
        | "wrongIndentationFromListMarkerWithTab";
      data: { expected: number; actual: number };
      fix: (fixer: RuleTextEditor) => RuleTextEdit;
      expectedIndentWidth: number;
      actualIndentWidth: number;
    } | null {
      const parsed = listItem.getParsedListItem();
      const markerAfterColumn = (
        parsed.taskListItemMarker?.loc ?? parsed.marker.loc
      ).end.column;
      const before = line.text.slice(0, markerAfterColumn - 1);
      const after = line.text.slice(markerAfterColumn - 1);
      const indentText = /^\s*/u.exec(after)![0];
      const actualIndentWidth = getWidth(before + indentText);
      const expectedIndentWidth = expectedIndentWidthProvider(
        line.line,
        markerAfterColumn,
      );
      if (expectedIndentWidth === "ignore") return null;
      if (actualIndentWidth === expectedIndentWidth) return null;

      const linePrefixWidth = getWidth(before);
      const range: [number, number] = [
        line.range[0] + before.length,
        line.range[0] + before.length + indentText.length,
      ];

      return {
        loc: getSourceLocationFromRange(sourceCode, listItem.node, range),
        messageId: indentText.includes("\t")
          ? "wrongIndentationFromListMarkerWithTab"
          : "wrongIndentationFromListMarker",
        data: {
          expected: expectedIndentWidth - linePrefixWidth,
          actual: actualIndentWidth - linePrefixWidth,
        },
        fix(fixer) {
          return fixer.replaceTextRange(
            range,
            " ".repeat(expectedIndentWidth - linePrefixWidth),
          );
        },
        expectedIndentWidth,
        actualIndentWidth,
      };
    }

    /**
     * Additional fixes for code/math block content lines.
     */
    function* additionalFixesForCodeBlock(
      node: Code | Math,
      fixer: RuleTextEditor,
      info: {
        loc: SourceLocation;
        expectedIndentWidth: number;
        actualIndentWidth: number;
      },
      fixStartLine: number,
      fixEndLine: number,
    ) {
      const loc = sourceCode.getLoc(node);
      if (info.loc.start.line !== loc.start.line) return;
      for (
        let lineNumber = fixStartLine;
        lineNumber <= fixEndLine;
        lineNumber++
      ) {
        const line = getParsedLines(sourceCode).get(lineNumber);
        if (!line) continue;
        if (info.expectedIndentWidth > info.actualIndentWidth) {
          // Add indentation
          const before = sliceWidth(line.text, 0, info.actualIndentWidth);
          const after = sliceWidth(line.text, info.actualIndentWidth);
          const diffWidth = info.expectedIndentWidth - info.actualIndentWidth;
          yield fixer.replaceTextRange(
            [line.range[0], line.range[0] + line.text.length],
            before + " ".repeat(diffWidth) + after,
          );
        } else {
          // Remove indentation
          let before = sliceWidth(line.text, 0, info.expectedIndentWidth);
          let between = sliceWidth(
            line.text,
            info.expectedIndentWidth,
            info.actualIndentWidth,
          );
          const after = sliceWidth(line.text, info.actualIndentWidth);
          while (between && !isSpaceOrTab(between)) {
            before += between[0];
            between = between.slice(1);
          }
          yield fixer.replaceTextRange(
            [line.range[0], line.range[0] + line.text.length],
            before + after,
          );
        }
      }
    }
  },
});
