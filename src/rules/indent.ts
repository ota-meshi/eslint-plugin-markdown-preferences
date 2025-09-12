import type {
  Blockquote,
  Code,
  FootnoteDefinition,
  Heading,
  ListItem,
  Root,
  ThematicBreak,
} from "mdast";
import { createRule } from "../utils/index.ts";
import type { ParsedLine } from "../utils/lines.ts";
import { getParsedLines } from "../utils/lines.ts";
import {
  getCodeBlockKind,
  getListItemMarker,
  getSourceLocationFromRange,
} from "../utils/ast.ts";
import type {
  RuleTextEdit,
  RuleTextEditor,
  SourceLocation,
} from "@eslint/core";
import { isSpaceOrTab } from "../utils/unicode.ts";

export default createRule("indent", {
  meta: {
    type: "layout",
    docs: {
      description: "enforce consistent indentation in Markdown files",
      categories: ["standard"],
      listCategory: "Stylistic",
    },
    fixable: "whitespace",
    hasSuggestions: false,
    schema: [],
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

    abstract class AbsBlockStack {
      public abstract upper: BlockStack | null;

      public abstract type:
        | "root"
        | "blockquote"
        | "listItem"
        | "footnoteDefinition";

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

      public getListItemFromLine(lineNumber: number): ListItem | null {
        let block = this as unknown as BlockStack | null;
        while (block) {
          if (block.type === "listItem") {
            const loc = sourceCode.getLoc(block.node);
            if (loc.start.line === lineNumber) {
              return block.node;
            }
          }
          block = block.upper;
        }
        return null;
      }

      public abstract getExpectedIndent(): number;
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

      public constructor(node: Blockquote) {
        super();
        this.node = node;
        // eslint-disable-next-line @typescript-eslint/no-use-before-define -- OK
        this.upper = blockStack;
      }

      public getExpectedIndent(): number {
        if (this._expectedIndent == null) {
          const loc = sourceCode.getLoc(this.node);
          const baseIndent = getIndentWidth(
            sourceCode.lines[loc.start.line - 1].slice(0, loc.start.column),
          );
          this._expectedIndent = baseIndent + 1;
        }
        return this._expectedIndent;
      }
    }
    class ListItemStack extends AbsBlockStack {
      public readonly type = "listItem";

      public readonly node: ListItem;

      public readonly upper: BlockStack;

      private _expectedIndent?: number;

      public constructor(node: ListItem) {
        super();
        this.node = node;
        // eslint-disable-next-line @typescript-eslint/no-use-before-define -- OK
        this.upper = blockStack;
      }

      public getExpectedIndent(): number {
        if (this._expectedIndent == null) {
          const loc = sourceCode.getLoc(this.node);
          const baseIndent = getIndentWidth(
            sourceCode.lines[loc.start.line - 1].slice(0, loc.start.column - 1),
          );
          this._expectedIndent =
            baseIndent +
            getListItemMarker(sourceCode, this.node).raw.length +
            1;
        }
        return this._expectedIndent;
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
          const baseIndent = getIndentWidth(
            sourceCode.lines[loc.start.line - 1].slice(0, loc.start.column - 1),
          );
          this._expectedIndent = baseIndent + 4;
        }
        return this._expectedIndent;
      }
    }
    type BlockStack =
      | RootStack
      | BlockquoteStack
      | ListItemStack
      | FootnoteDefinitionStack;
    let blockStack: BlockStack = new RootStack(sourceCode.ast);

    return {
      thematicBreak: verifyThematicBreak,
      heading: verifyHeading,
      code: verifyCodeBlock,
      blockquote(node) {
        blockStack = new BlockquoteStack(node);
      },
      listItem(node) {
        blockStack = new ListItemStack(node);
      },
      footnoteDefinition(node) {
        blockStack = new FootnoteDefinitionStack(node);
      },
      "blockquote, listItem, footnoteDefinition:exit"() {
        blockStack = blockStack.upper!;
      },
    };

    /**
     * Verify a thematic break node.
     */
    function verifyThematicBreak(node: ThematicBreak) {
      const blockquote = blockStack.getCurrentBlockquote();
      const loc = sourceCode.getLoc(node);
      if (!blockquote) {
        verifyLinesIndentFromRoot(
          lineNumbersFromRange(loc.start.line, loc.end.line),
          blockStack.getExpectedIndent(),
        );
        return;
      }
      verifyLinesIndentFromBlockquoteMarker(
        lineNumbersFromRange(loc.start.line, loc.end.line),
        blockquote.node,
        blockStack.getExpectedIndent(),
      );
    }

    /**
     * Verify a heading node.
     */
    function verifyHeading(node: Heading) {
      const blockquote = blockStack.getCurrentBlockquote();
      const loc = sourceCode.getLoc(node);
      if (!blockquote) {
        verifyLinesIndentFromRoot(
          lineNumbersFromRange(loc.start.line, loc.end.line),
          blockStack.getExpectedIndent(),
        );
        return;
      }
      verifyLinesIndentFromBlockquoteMarker(
        lineNumbersFromRange(loc.start.line, loc.end.line),
        blockquote.node,
        blockStack.getExpectedIndent(),
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
      const blockquote = blockStack.getCurrentBlockquote();
      const loc = sourceCode.getLoc(node);
      if (!blockquote) {
        verifyLinesIndentFromRoot(
          [loc.start.line, loc.end.line],
          blockStack.getExpectedIndent(),
          additionalFixes,
        );
        return;
      }
      verifyLinesIndentFromBlockquoteMarker(
        [loc.start.line, loc.end.line],
        blockquote.node,
        blockStack.getExpectedIndent(),
        additionalFixes,
      );

      /**
       * Additional fixes for code block content lines.
       */
      function* additionalFixes(
        fixer: RuleTextEditor,
        info: {
          loc: SourceLocation;
          expectedIndentWidth: number;
          actualIndentWidth: number;
        },
      ) {
        if (info.loc.start.line !== loc.start.line) return;
        for (
          let lineNumber = loc.start.line + 1;
          lineNumber < loc.end.line;
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
     * Verify the indentation of the lines from the root.
     */
    function verifyLinesIndentFromRoot(
      lineNumbers: number[],
      expectedIndentWidth: number,
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
        const listItem = blockStack.getListItemFromLine(lineNumber);
        if (!listItem) {
          const indentText = /^\s*/u.exec(line.text)![0];
          const actualIndentWidth = getIndentWidth(indentText);
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
          expectedIndentWidth,
        );
        if (!report) continue;
        reports.push(report);
      }

      if (!reports.length) return;

      for (const report of reports) {
        context.report({
          loc: report.loc,
          messageId: report.messageId,
          data: {
            expected: String(report.data.expected),
            actual: String(report.data.actual),
          },
          *fix(fixer) {
            for (const { fix, ...info } of reports) {
              yield fix(fixer);
              if (additionalFixes) {
                yield* additionalFixes(fixer, info) ?? [];
              }
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
      blockquote: Blockquote,
      expectedIndentWidth: number,
      additionalFixes?: (
        fixer: RuleTextEditor,
        info: {
          loc: SourceLocation;
          expectedIndentWidth: number;
          actualIndentWidth: number;
        },
      ) => Iterable<RuleTextEdit> | null,
    ) {
      const blockquoteLoc = sourceCode.getLoc(blockquote);
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
        if (line.text[blockquoteLoc.start.column - 1] !== ">") {
          // Ignore if the line does not have the blockquote marker that same location
          cannotFix = true;
          continue;
        }
        const listItem = blockStack.getListItemFromLine(lineNumber);
        if (!listItem) {
          const before = line.text.slice(0, blockquoteLoc.start.column);
          const after = line.text.slice(blockquoteLoc.start.column);
          const indentText = /^\s*/u.exec(after)![0];
          const actualIndentWidth = getIndentWidth(before + indentText);
          if (actualIndentWidth === expectedIndentWidth) continue;
          const linePrefix = before;
          const linePrefixWidth = getIndentWidth(linePrefix);

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
          expectedIndentWidth,
        );
        if (!report) continue;
        reports.push(report);
      }

      if (!reports.length) return;

      for (const report of reports) {
        context.report({
          loc: report.loc,
          messageId: report.messageId,
          data: {
            expected: String(report.data.expected),
            actual: String(report.data.actual),
          },
          fix: cannotFix
            ? null
            : function* (fixer) {
                for (const { fix, ...info } of reports) {
                  yield fix(fixer);
                  if (additionalFixes) {
                    yield* additionalFixes(fixer, info) ?? [];
                  }
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
      listItem: ListItem,
      expectedIndentWidth: number,
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
      const listMarker = getListItemMarker(sourceCode, listItem);
      const listItemLoc = sourceCode.getLoc(listItem);
      const before = line.text.slice(0, listItemLoc.start.column - 1);
      const after = line.text.slice(
        listItemLoc.start.column - 1 + listMarker.raw.length,
      );
      const indentText = /^\s*/u.exec(after)![0];
      const actualIndentWidth = getIndentWidth(
        before + listMarker.raw + indentText,
      );
      if (actualIndentWidth === expectedIndentWidth) return null;

      const linePrefix = before + listMarker.raw;
      const linePrefixWidth = getIndentWidth(linePrefix);
      const range: [number, number] = [
        line.range[0] + linePrefix.length,
        line.range[0] + linePrefix.length + indentText.length,
      ];

      return {
        loc: getSourceLocationFromRange(sourceCode, listItem, range),
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
  },
});

/**
 * Get the visual width of the indentation.
 */
function getIndentWidth(str: string): number {
  let width = 0;
  for (const c of str) {
    if (c === "\t") {
      width += 4 - (width % 4);
    } else {
      width++;
    }
  }
  return width;
}

/**
 * Get a slice of the string by visual width.
 */
function sliceWidth(str: string, start: number, end?: number): string {
  const buffer = [...str];
  let width = 0;
  let c;
  while ((c = buffer.shift())) {
    if (start <= width) {
      buffer.unshift(c);
      break;
    }
    if (c === "\t") {
      width += 4 - (width % 4);
    } else {
      width++;
    }
  }
  if (end == null) {
    return buffer.join("");
  }
  let result = " ".repeat(width - start);
  while ((c = buffer.shift())) {
    let newWidth;
    if (c === "\t") {
      newWidth = width + 4 - (width % 4);
    } else {
      newWidth = width + 1;
    }
    if (end < newWidth) {
      break;
    }
    result += c;
    width = newWidth;
  }
  result += " ".repeat(end - width);

  return result;
}
