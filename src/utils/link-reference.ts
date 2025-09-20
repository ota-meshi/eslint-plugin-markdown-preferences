import type { SourceLocation } from "estree";
import type { LinkReference } from "../language/ast-types.ts";
import { getSourceLocationFromRange } from "./ast.ts";
import type { ExtendedMarkdownSourceCode } from "../language/extended-markdown-ianguage.ts";

export type ParsedLinkReference = {
  text: {
    range: [number, number];
    loc: SourceLocation;
  };
  label:
    | {
        type: "full";
        text: string;
        range: [number, number];
        loc: SourceLocation;
      }
    | {
        type: "collapsed";
        range: [number, number];
        loc: SourceLocation;
      }
    | null;
};
/**
 * Parse the link reference.
 */
export function parseLinkReference(
  sourceCode: ExtendedMarkdownSourceCode,
  node: LinkReference,
): ParsedLinkReference | null {
  const nodeRange = sourceCode.getRange(node);
  let textRange: [number, number];
  if (node.children.length === 0) {
    textRange = [nodeRange[0], sourceCode.text.indexOf("]", nodeRange[0]) + 1];
  } else {
    const lastChildRange = sourceCode.getRange(
      node.children[node.children.length - 1],
    );
    textRange = [
      nodeRange[0],
      sourceCode.text.indexOf("]", lastChildRange[1]) + 1,
    ];
  }
  if (node.referenceType === "shortcut") {
    return {
      text: {
        range: textRange,
        loc: getSourceLocationFromRange(sourceCode, node, textRange),
      },
      label: null,
    };
  }
  if (node.referenceType === "collapsed") {
    const labelRange: [number, number] = [textRange[1], textRange[1] + 1];
    return {
      text: {
        range: textRange,
        loc: getSourceLocationFromRange(sourceCode, node, textRange),
      },
      label: {
        type: "collapsed",
        range: labelRange,
        loc: getSourceLocationFromRange(sourceCode, node, labelRange),
      },
    };
  }

  let index = textRange[1] + 1;
  while (index < sourceCode.text.length) {
    const c = sourceCode.text[index];
    if (c === "]") {
      break;
    }
    index++;
    if (c !== "\\") continue;
    if (
      index < sourceCode.text.length &&
      (sourceCode.text[index] === "\\" || sourceCode.text[index] === "]")
    ) {
      index++;
    }
  }
  if (sourceCode.text[index] !== "]") return null;
  const labelRange: [number, number] = [textRange[1], index + 1];
  return {
    text: {
      range: textRange,
      loc: getSourceLocationFromRange(sourceCode, node, textRange),
    },
    label: {
      type: "full",
      text: sourceCode.text.slice(...labelRange),
      range: labelRange,
      loc: getSourceLocationFromRange(sourceCode, node, labelRange),
    },
  };
}
