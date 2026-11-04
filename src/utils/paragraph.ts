import type { SourceLocation, SourceRange } from "@eslint/core";
import type { Paragraph } from "../language/ast-types.ts";
import type { ExtendedMarkdownSourceCode } from "../language/extended-markdown-language.ts";
import type { MDNode } from "./ast.ts";
import { getParent } from "./ast.ts";
import { parseListItem } from "./list-item.ts";
import { getWidth } from "./width.ts";

type Segment = {
  loc: SourceLocation;
  range: SourceRange;
  text: string;
  canFix: boolean;
};
type Container =
  | "blockquote"
  | { width: number; firstLine: number; firstContentColumn: number };

/**
 * Collect soft-wrapped paragraph segments, preserving explicit breaks and literals.
 */
export function getSoftWrappedSegments(
  sourceCode: ExtendedMarkdownSourceCode,
  paragraph: Paragraph,
): Segment[] {
  const loc = sourceCode.getLoc(paragraph);
  if (loc.start.line === loc.end.line) return [];

  const ancestors: MDNode[] = [];
  let parent: MDNode | null = getParent(sourceCode, paragraph);
  while (parent) {
    ancestors.unshift(parent);
    parent = getParent(sourceCode, parent);
  }
  const containers: Container[] = [];
  let hasPartialTab = false;
  for (const ancestor of ancestors) {
    if (ancestor.type === "blockquote") {
      containers.push("blockquote");
    } else if (ancestor.type === "listItem") {
      const { marker } = parseListItem(sourceCode, ancestor);
      const markerLoc = sourceCode.getLoc(ancestor);
      const line = sourceCode.lines[markerLoc.start.line - 1];
      const markerStart = markerLoc.start.column - 1;
      const markerEnd = markerStart + marker.text.length;
      const spaces = /^[\t ]*/u.exec(line.slice(markerEnd))![0];
      const padding =
        getWidth(line.slice(0, markerEnd + spaces.length)) -
        getWidth(line.slice(0, markerEnd));
      const indentation =
        getWidth(line.slice(0, markerStart)) -
        getWidth(
          line.slice(0, skipContainers(markerLoc.start.line, containers)),
        );
      containers.push({
        width:
          indentation +
          marker.text.length +
          (padding > 0 && padding <= 4 ? padding : 1),
        firstLine: markerLoc.start.line,
        firstContentColumn: markerEnd + (padding <= 4 ? spaces.length : 1),
      });
    } else if (ancestor.type === "footnoteDefinition") {
      const footnoteLoc = sourceCode.getLoc(ancestor);
      const line = sourceCode.lines[footnoteLoc.start.line - 1];
      const firstChildLoc = sourceCode.getLoc(ancestor.children[0]);
      containers.push({
        width: 4,
        firstLine: footnoteLoc.start.line,
        firstContentColumn:
          firstChildLoc.start.line === footnoteLoc.start.line
            ? firstChildLoc.start.column - 1
            : line.length,
      });
    }
  }

  /**
   * Skip only structural container prefixes, not literal greater-than signs.
   */
  function skipContainers(
    lineNumber: number,
    enclosingContainers: Container[],
  ): number {
    const line = sourceCode.lines[lineNumber - 1];
    let index = 0;
    for (const container of enclosingContainers) {
      if (container === "blockquote") {
        let next = index;
        while (line[next] === " " || line[next] === "\t") next++;
        const padding =
          getWidth(line.slice(0, next)) - getWidth(line.slice(0, index));
        if (padding <= 3 && line[next] === ">") {
          index = next + 1;
          if (
            line[index] === "\t" &&
            getWidth(line.slice(0, index)) % 4 !== 3
          ) {
            hasPartialTab = true;
          }
          if (line[index] === " " || line[index] === "\t") index++;
        } else {
          return index;
        }
      } else if (lineNumber === container.firstLine) {
        index = container.firstContentColumn;
      } else {
        const startWidth = getWidth(line.slice(0, index));
        let width = startWidth;
        while (
          (line[index] === " " || line[index] === "\t") &&
          width - startWidth < container.width
        ) {
          width += line[index] === "\t" ? 4 - (width % 4) : 1;
          index++;
        }
        if (width - startWidth > container.width) hasPartialTab = true;
        if (width - startWidth < container.width) {
          return index;
        }
      }
    }
    return index;
  }

  /**
   * Find paragraph content after container prefixes and optional indentation.
   */
  function contentColumn(lineNumber: number): number {
    if (lineNumber === loc.start.line) return loc.start.column - 1;
    const line = sourceCode.lines[lineNumber - 1];
    let index = skipContainers(lineNumber, containers);
    while (line[index] === " " || line[index] === "\t") index++;
    return index;
  }

  const hardBoundaries = new Set<number>();
  const literalBoundaries = new Set<number>();
  let hasDirective = false;

  /**
   * Mark boundaries whose removal would rewrite literal node contents.
   */
  function protect(startLine: number, endLine: number): void {
    for (let line = startLine; line < endLine; line++) {
      literalBoundaries.add(line);
    }
  }

  /**
   * Locate intentional breaks and literal source ranges in the inline AST.
   */
  function visit(node: MDNode): void {
    const nodeLoc = sourceCode.getLoc(node);
    if (node.type === "break") {
      hardBoundaries.add(nodeLoc.start.line);
    } else if (node.type === "html") {
      protect(nodeLoc.start.line, nodeLoc.end.line);
      if (/<!--\s*eslint(?:-|\s)/iu.test(node.value)) hasDirective = true;
      if (
        nodeLoc.start.line === nodeLoc.end.line &&
        /^<br\s*\/?>$/iu.test(node.value)
      ) {
        const lineNumber = nodeLoc.start.line;
        const line = sourceCode.lines[lineNumber - 1];
        if (
          !line
            .slice(contentColumn(lineNumber), nodeLoc.start.column - 1)
            .trim()
        ) {
          hardBoundaries.add(lineNumber - 1);
        }
        if (!line.slice(nodeLoc.end.column - 1).trim()) {
          hardBoundaries.add(lineNumber);
        }
      }
    } else if (
      node.type === "inlineCode" ||
      node.type === "inlineMath" ||
      node.type === "image" ||
      node.type === "imageReference"
    ) {
      protect(nodeLoc.start.line, nodeLoc.end.line);
    } else if (node.type === "link" || node.type === "linkReference") {
      const lastChild = node.children.at(-1);
      protect(
        lastChild ? sourceCode.getLoc(lastChild).end.line : nodeLoc.start.line,
        nodeLoc.end.line,
      );
    }
    if ("children" in node) {
      for (const child of node.children) visit(child);
    }
  }

  visit(paragraph);

  const segments: Segment[] = [];

  /**
   * Describe a contiguous group of soft-wrapped lines as one atomic edit.
   */
  function addSegment(firstLine: number, lastLine: number): void {
    if (firstLine === lastLine) return;
    const start = { line: firstLine, column: contentColumn(firstLine) + 1 };
    const lastColumn =
      lastLine === loc.end.line
        ? loc.end.column
        : sourceCode.lines[lastLine - 1].length + 1;
    const end = { line: lastLine, column: lastColumn };
    const text: string[] = [];
    let canFix = !hasDirective;
    for (let lineNumber = firstLine; lineNumber <= lastLine; lineNumber++) {
      const line = sourceCode.lines[lineNumber - 1];
      const content = line.slice(
        contentColumn(lineNumber),
        lineNumber === lastLine ? lastColumn - 1 : line.length,
      );
      text.push(
        lineNumber === lastLine ? content : content.replace(/[\t ]+$/u, ""),
      );
      if (lineNumber < lastLine && literalBoundaries.has(lineNumber)) {
        canFix = false;
      }
    }
    segments.push({
      loc: {
        start,
        end: {
          line: firstLine,
          column: sourceCode.lines[firstLine - 1].length + 1,
        },
      },
      range: [
        sourceCode.getIndexFromLoc(start),
        sourceCode.getIndexFromLoc(end),
      ],
      text: text.join(" "),
      canFix,
    });
  }

  let firstLine = loc.start.line;
  for (let line = loc.start.line; line < loc.end.line; line++) {
    if (hardBoundaries.has(line)) {
      addSegment(firstLine, line);
      firstLine = line + 1;
    }
  }
  addSegment(firstLine, loc.end.line);
  if (hasPartialTab) {
    for (const segment of segments) segment.canFix = false;
  }
  return segments;
}
