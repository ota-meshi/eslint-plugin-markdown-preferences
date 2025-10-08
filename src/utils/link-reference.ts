import type { LinkReference } from "../language/ast-types.ts";
import type { ExtendedMarkdownSourceCode } from "../language/extended-markdown-language.ts";

export type ParsedLinkReference = {
  text: {
    range: [number, number];
  };
  label:
    | {
        type: "full";
        text: string;
        range: [number, number];
      }
    | {
        type: "collapsed";
        range: [number, number];
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
      },
      label: null,
    };
  }
  if (node.referenceType === "collapsed") {
    const labelRange: [number, number] = [textRange[1], textRange[1] + 1];
    return {
      text: {
        range: textRange,
      },
      label: {
        type: "collapsed",
        range: labelRange,
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
    },
    label: {
      type: "full",
      text: sourceCode.text.slice(...labelRange),
      range: labelRange,
    },
  };
}
