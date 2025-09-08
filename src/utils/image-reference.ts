import type { MarkdownSourceCode } from "@eslint/markdown";
import type { SourceLocation } from "estree";
import type { ImageReference } from "mdast";
import { getSourceLocationFromRange } from "./ast.ts";
import { isWhitespace } from "./unicode.ts";

export type ParsedImageReference = {
  text: {
    text: string;
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
 * Parse the image reference.
 */
export function parseImageReference(
  sourceCode: MarkdownSourceCode,
  node: ImageReference,
): ParsedImageReference | null {
  const nodeRange = sourceCode.getRange(node);
  if (node.referenceType === "shortcut") {
    const textRange: [number, number] = [nodeRange[0] + 1, nodeRange[1]];
    return {
      text: {
        range: textRange,
        text: sourceCode.text.slice(...textRange),
        loc: getSourceLocationFromRange(sourceCode, node, textRange),
      },
      label: null,
    };
  }
  if (node.referenceType === "collapsed") {
    const textRange: [number, number] = [nodeRange[0] + 1, nodeRange[1] - 2];
    const labelRange: [number, number] = [textRange[1], nodeRange[1]];
    return {
      text: {
        range: textRange,
        text: sourceCode.text.slice(...textRange),
        loc: getSourceLocationFromRange(sourceCode, node, textRange),
      },
      label: {
        type: "collapsed",
        range: labelRange,
        loc: getSourceLocationFromRange(sourceCode, node, labelRange),
      },
    };
  }
  const parsed = parseFullImageReferenceFromText(sourceCode.getText(node));
  if (!parsed) return null;
  const textRange: [number, number] = [
    nodeRange[0] + parsed.text.range[0],
    nodeRange[0] + parsed.text.range[1],
  ];
  const labelRange: [number, number] = [
    nodeRange[0] + parsed.label.range[0],
    nodeRange[0] + parsed.label.range[1],
  ];
  return {
    text: {
      range: textRange,
      text: parsed.text.text,
      loc: getSourceLocationFromRange(sourceCode, node, textRange),
    },
    label: {
      type: "full",
      text: parsed.label.text,
      range: labelRange,
      loc: getSourceLocationFromRange(sourceCode, node, labelRange),
    },
  };
}

/**
 * Parse the full image reference from the given text.
 */
export function parseFullImageReferenceFromText(text: string): {
  text: {
    text: string;
    range: [number, number];
  };
  label: {
    text: string;
    range: [number, number];
  };
} | null {
  if (!text.startsWith("![")) return null;
  let index = text.length - 1;
  skipSpaces();
  if (text[index] !== "]") return null;
  const labelEndIndex = index + 1;
  index--;
  skipSpaces();
  if (!skipUntilStart((c) => c === "[")) return null;
  const labelRange: [number, number] = [index, labelEndIndex];
  index--;
  const label: NonNullable<
    ReturnType<typeof parseFullImageReferenceFromText>
  >["label"] = {
    text: text.slice(...labelRange),
    range: labelRange,
  };

  if (text[index] !== "]") return null;
  const textRange: [number, number] = [1, index + 1];
  return {
    text: {
      text: text.slice(...textRange),
      range: textRange,
    },
    label,
  };

  /**
   * Skip spaces
   */
  function skipSpaces() {
    while (index >= 0 && isWhitespace(text[index])) {
      index--;
    }
  }

  /**
   * Skip until the start by the given condition
   */
  function skipUntilStart(checkStart: (c: string) => boolean) {
    while (index >= 0) {
      const c = text[index];
      if (checkStart(c)) {
        if (index > 1) {
          let escapeText = "";
          while (text.endsWith(`${escapeText}\\`, index)) {
            escapeText += "\\";
          }
          // An odd number of backslashes acts as an escape.
          if (escapeText.length % 2 === 1) {
            index -= escapeText.length + 1;
            continue;
          }
        }
        return true;
      }
      index--;
    }
    return false;
  }
}
