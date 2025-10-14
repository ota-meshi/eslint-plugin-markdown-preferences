/**
 * @fileoverview Utilities for parsing HTML.
 * This parser is based on the CommonMark specification.
 * @see https://spec.commonmark.org/0.31.2/#raw-html
 * @see https://spec.commonmark.org/0.31.2/#html-blocks
 */
import type { Html } from "../language/ast-types.ts";
import type { ExtendedMarkdownSourceCode } from "src/language/extended-markdown-language.ts";
import type { MDNode } from "./ast.ts";
import { getParent } from "./ast.ts";
import { isSpaceOrTab } from "./unicode.ts";

export type TokenBase = {
  range: [number, number];
  value: string;
};
// A tag name consists of an ASCII letter followed by zero or more ASCII letters, digits, or hyphens (-).
const RE_TAG_NAME = /[a-z][\d\-a-z]*/iuy;
export type TagNameToken = TokenBase & {
  type: "TagNameToken";
};

// An attribute name consists of an ASCII letter, _, or :, followed by zero or more ASCII letters, digits, _, ., :, or -. (Note: This is the XML specification restricted to ASCII. HTML5 is laxer.)
const RE_ATTRIBUTE_NAME = /[:a-z_][\w\-.:]*/iuy;
export type AttributeNameToken = TokenBase & {
  type: "AttributeNameToken";
};

// An unquoted attribute value is a nonempty string of characters not including spaces, tabs, line endings, ", ', =, <, >, or `.
const RE_UNQUOTED_ATTRIBUTE_VALUE = /[^\s"'<=>`]+/uy;
export type UnquotedAttributeValueToken = TokenBase & {
  type: "UnquotedAttributeValueToken";
};

// A single-quoted attribute value consists of ', zero or more characters not including ', and a final '.
const RE_SINGLE_QUOTED_ATTRIBUTE_VALUE = /'[^']*'/uy;
export type SingleQuotedAttributeValueToken = TokenBase & {
  type: "SingleQuotedAttributeValueToken";
};

// A double-quoted attribute value consists of ", zero or more characters not including ", and a final ".
const RE_DOUBLE_QUOTED_ATTRIBUTE_VALUE = /"[^"]*"/uy;
export type DoubleQuotedAttributeValueToken = TokenBase & {
  type: "DoubleQuotedAttributeValueToken";
};

// An attribute value consists of an unquoted attribute value, a single-quoted attribute value, or a double-quoted attribute value.
export type AttributeValueToken =
  | UnquotedAttributeValueToken
  | SingleQuotedAttributeValueToken
  | DoubleQuotedAttributeValueToken;

/**
 * Parses an attribute value from the given code starting at the specified index.
 */
function parseAttributeValue(
  code: string,
  index: number,
): AttributeValueToken | null {
  RE_UNQUOTED_ATTRIBUTE_VALUE.lastIndex = index;
  const unquotedMatch = RE_UNQUOTED_ATTRIBUTE_VALUE.exec(code);
  if (unquotedMatch) {
    return {
      type: "UnquotedAttributeValueToken",
      value: unquotedMatch[0],
      range: [
        unquotedMatch.index,
        unquotedMatch.index + unquotedMatch[0].length,
      ],
    };
  }
  RE_SINGLE_QUOTED_ATTRIBUTE_VALUE.lastIndex = index;
  const singleQuotedMatch = RE_SINGLE_QUOTED_ATTRIBUTE_VALUE.exec(code);
  if (singleQuotedMatch) {
    return {
      type: "SingleQuotedAttributeValueToken",
      value: singleQuotedMatch[0].slice(1, -1),
      range: [
        singleQuotedMatch.index,
        singleQuotedMatch.index + singleQuotedMatch[0].length,
      ],
    };
  }
  RE_DOUBLE_QUOTED_ATTRIBUTE_VALUE.lastIndex = index;
  const doubleQuotedMatch = RE_DOUBLE_QUOTED_ATTRIBUTE_VALUE.exec(code);
  if (doubleQuotedMatch) {
    return {
      type: "DoubleQuotedAttributeValueToken",
      value: doubleQuotedMatch[0].slice(1, -1),
      range: [
        doubleQuotedMatch.index,
        doubleQuotedMatch.index + doubleQuotedMatch[0].length,
      ],
    };
  }
  return null;
}

// spaces, tabs, and up to one line ending
const RE_SPACES = /[\t ]*(?:\r\n?|\n)?[\t ]*/uy;

// An attribute value specification consists of optional spaces, tabs, and up to one line ending, a = character, optional spaces, tabs, and up to one line ending, and an attribute value.
export type AttributeValueSpecificationTokens = {
  equalIndex: number;
  value: AttributeValueToken;
};

/**
 * Parses an attribute value specification from the given code starting at the specified index.
 */
function parseAttributeValueSpecification(
  code: string,
  index: number,
): AttributeValueSpecificationTokens | null {
  let currentIndex = index;
  RE_SPACES.lastIndex = currentIndex;
  const spacesMatch = RE_SPACES.exec(code);
  if (spacesMatch) {
    currentIndex += spacesMatch[0].length;
  }
  if (code[currentIndex] !== "=") {
    return null;
  }
  const equalIndex = currentIndex;
  currentIndex += 1; // Skip '='
  RE_SPACES.lastIndex = currentIndex;
  const spacesAfterEqualMatch = RE_SPACES.exec(code);
  if (spacesAfterEqualMatch) {
    currentIndex += spacesAfterEqualMatch[0].length;
  }
  const attributeValue = parseAttributeValue(code, currentIndex);
  if (!attributeValue) {
    return null;
  }
  return {
    equalIndex,
    value: attributeValue,
  };
}

// An attribute consists of spaces, tabs, and up to one line ending, an attribute name, and an optional attribute value specification.
export type Attribute = {
  name: AttributeNameToken;
  value: AttributeValueSpecificationTokens | null;
};

/**
 * Parses an attribute from the given code starting at the specified index.
 */
function parseAttribute(code: string, index: number): Attribute | null {
  let currentIndex = index;
  RE_SPACES.lastIndex = currentIndex;
  const spacesMatch = RE_SPACES.exec(code);
  if (!spacesMatch) return null;
  currentIndex += spacesMatch[0].length;
  RE_ATTRIBUTE_NAME.lastIndex = currentIndex;
  const attributeNameMatch = RE_ATTRIBUTE_NAME.exec(code);
  if (!attributeNameMatch) return null;
  const name: AttributeNameToken = {
    type: "AttributeNameToken",
    value: attributeNameMatch[0],
    range: [currentIndex, currentIndex + attributeNameMatch[0].length],
  };
  currentIndex += attributeNameMatch[0].length;
  const attributeValueSpec = parseAttributeValueSpecification(
    code,
    currentIndex,
  );
  if (attributeValueSpec) {
    return {
      name,
      value: attributeValueSpec,
    };
  }
  return {
    name,
    value: null,
  };
}

// An open tag consists of a < character, a tag name, zero or more attributes, optional spaces, tabs, and up to one line ending, an optional / character, and a > character.
export type OpenTag = {
  type: "OpenTag";
  name: TagNameToken;
  attributes: Attribute[];
  selfClosing: boolean;
  range: [number, number];
};

/**
 * Parses an open tag from the given code starting at the specified index.
 */
function parseOpenTag(code: string, index: number): OpenTag | null {
  let currentIndex = index;
  if (code[currentIndex] !== "<") return null;
  currentIndex += 1; // Skip '<'
  RE_TAG_NAME.lastIndex = currentIndex;
  const tagNameMatch = RE_TAG_NAME.exec(code);
  if (!tagNameMatch) return null;
  const tagName: TagNameToken = {
    type: "TagNameToken",
    value: tagNameMatch[0],
    range: [currentIndex, currentIndex + tagNameMatch[0].length],
  };
  currentIndex += tagNameMatch[0].length;
  const attributes: Attribute[] = [];
  while (true) {
    const attribute = parseAttribute(code, currentIndex);
    if (!attribute) break;
    attributes.push(attribute);
    currentIndex = attribute.value?.value.range[1] ?? attribute.name.range[1];
  }
  RE_SPACES.lastIndex = currentIndex;
  const spacesMatch = RE_SPACES.exec(code);
  if (spacesMatch) {
    currentIndex += spacesMatch[0].length;
  }
  let selfClosing = false;
  if (code[currentIndex] === "/") {
    selfClosing = true;
    currentIndex += 1; // Skip '/'
  }
  if (code[currentIndex] !== ">") return null;
  currentIndex += 1; // Skip '>'
  return {
    type: "OpenTag",
    name: tagName,
    attributes,
    selfClosing,
    range: [index, currentIndex],
  };
}

// A closing tag consists of the string </, a tag name, optional spaces, tabs, and up to one line ending, and the character >.
export type CloseTag = {
  type: "CloseTag";
  name: TagNameToken;
  range: [number, number];
};

/**
 * Parses a closing tag from the given code starting at the specified index.
 */
function parseCloseTag(code: string, index: number): CloseTag | null {
  let currentIndex = index;
  if (code[currentIndex] !== "<" || code[currentIndex + 1] !== "/") {
    return null;
  }
  currentIndex += 2; // Skip '</'
  RE_TAG_NAME.lastIndex = currentIndex;
  const tagNameMatch = RE_TAG_NAME.exec(code);
  if (!tagNameMatch) return null;
  const tagName: TagNameToken = {
    type: "TagNameToken",
    value: tagNameMatch[0],
    range: [currentIndex, currentIndex + tagNameMatch[0].length],
  };
  currentIndex += tagNameMatch[0].length;
  RE_SPACES.lastIndex = currentIndex;
  const spacesMatch = RE_SPACES.exec(code);
  if (spacesMatch) {
    currentIndex += spacesMatch[0].length;
  }
  if (code[currentIndex] !== ">") return null;
  currentIndex += 1; // Skip '>'
  return {
    type: "CloseTag",
    name: tagName,
    range: [index, currentIndex],
  };
}

// An HTML comment consists of <!-->, <!--->, or <!--, a string of characters not including the string -->, and --> (see the HTML spec).
const RE_COMMENT = /<!--(?:>|->|([\s\S]*?)-->)/uy;
export type CommentTagToken = TokenBase & {
  type: "CommentTag";
};

// A processing instruction consists of the string <?, a string of characters not including the string ?>, and the string ?>.
const RE_PROCESSING_INSTRUCTION = /<\?[\s\S]*?\?>/uy;
export type ProcessingInstructionTagToken = TokenBase & {
  type: "ProcessingInstructionTag";
};

// A declaration consists of the string <!, an ASCII letter, zero or more characters not including the character >, and the character >.
const RE_DECLARATION = /<![a-z][^>]*>/iuy;
export type DeclarationTagToken = TokenBase & {
  type: "DeclarationTag";
};

// A CDATA section consists of the string <![CDATA[, a string of characters not including the string ]]>, and the string ]]>.
const RE_CDATA = /<!\[CDATA\[[\s\S]*?\]\]>/uy;
export type CDATATagToken = TokenBase & {
  type: "CDATATag";
};

// An HTML tag consists of an open tag, a closing tag, an HTML comment, a processing instruction, a declaration, or a CDATA section.
/**
 * Parses an HTML tag from the given code starting at the specified index.
 */
function parseHTMLTag(
  code: string,
  index: number,
):
  | OpenTag
  | CloseTag
  | CommentTagToken
  | ProcessingInstructionTagToken
  | DeclarationTagToken
  | CDATATagToken
  | null {
  const openTag = parseOpenTag(code, index);
  if (openTag) return openTag;
  const closeTag = parseCloseTag(code, index);
  if (closeTag) return closeTag;
  RE_COMMENT.lastIndex = index;
  const commentMatch = RE_COMMENT.exec(code);
  if (commentMatch) {
    return {
      type: "CommentTag",
      value: commentMatch[1],
      range: [commentMatch.index, commentMatch.index + commentMatch[0].length],
    };
  }
  RE_PROCESSING_INSTRUCTION.lastIndex = index;
  const piMatch = RE_PROCESSING_INSTRUCTION.exec(code);
  if (piMatch) {
    return {
      type: "ProcessingInstructionTag",
      value: piMatch[0],
      range: [piMatch.index, piMatch.index + piMatch[0].length],
    };
  }
  RE_DECLARATION.lastIndex = index;
  const declarationMatch = RE_DECLARATION.exec(code);
  if (declarationMatch) {
    return {
      type: "DeclarationTag",
      value: declarationMatch[0],
      range: [
        declarationMatch.index,
        declarationMatch.index + declarationMatch[0].length,
      ],
    };
  }
  RE_CDATA.lastIndex = index;
  const cdataMatch = RE_CDATA.exec(code);
  if (cdataMatch) {
    return {
      type: "CDATATag",
      value: cdataMatch[0],
      range: [cdataMatch.index, cdataMatch.index + cdataMatch[0].length],
    };
  }
  return null;
}

export type TextToken = TokenBase & {
  type: "Text";
};

/**
 * Parse the HTML from the given text.
 */
export function* parseHtmlFromText(
  code: string,
  start = 0,
  end: number = code.length,
): Iterable<
  | OpenTag
  | CloseTag
  | CommentTagToken
  | ProcessingInstructionTagToken
  | DeclarationTagToken
  | CDATATagToken
  | TextToken
> {
  let currentParser = parseHTMLTag;
  let currentIndex = start;
  while (currentIndex < end) {
    let tag:
      | OpenTag
      | CloseTag
      | CommentTagToken
      | ProcessingInstructionTagToken
      | DeclarationTagToken
      | CDATATagToken
      | null = null;
    let openingAngleIndex = code.indexOf("<", currentIndex);
    while (openingAngleIndex > -1 && openingAngleIndex < end) {
      tag = currentParser(code, openingAngleIndex);
      if (tag) break;
      openingAngleIndex = code.indexOf("<", openingAngleIndex + 1);
    }
    if (tag == null || end < tag.range[1]) break;
    if (tag.range[0] > currentIndex) {
      // There is text before the tag
      yield {
        type: "Text",
        value: code.slice(currentIndex, tag.range[0]),
        range: [currentIndex, tag.range[0]],
      };
    }
    yield tag;
    currentIndex = tag.range[1];
    currentParser = parseHTMLTag;

    if (
      tag.type === "OpenTag" &&
      !tag.selfClosing &&
      ["script", "style", "textarea"].includes(tag.name.value.toLowerCase())
    ) {
      // script, style, and textarea tags can contain anything until the matching closing tag
      const openTag = tag;
      currentParser = (codeText, index) => {
        const closeTag = parseCloseTag(codeText, index);
        if (
          !closeTag ||
          closeTag.name.value.toLowerCase() !== openTag.name.value.toLowerCase()
        )
          return null;
        return closeTag;
      };
    }
  }
  if (currentIndex < end) {
    yield {
      type: "Text",
      value: code.slice(currentIndex, end),
      range: [currentIndex, end],
    };
  }
}

/**
 * Parse the HTML node.
 */
export function parseHtml(
  sourceCode: ExtendedMarkdownSourceCode,
  node: Html,
): Iterable<
  | OpenTag
  | CloseTag
  | CommentTagToken
  | ProcessingInstructionTagToken
  | DeclarationTagToken
  | CDATATagToken
  | TextToken
> {
  const range = sourceCode.getRange(node);
  const lines = sourceCode.text.slice(range[0], range[1]).split("\n");
  if (lines.length === 1)
    return parseHtmlFromText(sourceCode.text, range[0], range[1]);

  let parent: MDNode | null = getParent(sourceCode, node);
  let blockquoteLevel = 0;
  while (parent) {
    if (parent.type === "blockquote") blockquoteLevel++;
    parent = getParent(sourceCode, parent);
  }
  // Replace blockquotes from each line
  for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
    const line = lines[lineIndex];
    let replacedLine = "";
    let replacedBlockquote = 0;
    for (const char of line) {
      if (char === ">") {
        replacedLine += " ";
        replacedBlockquote++;
        if (replacedBlockquote >= blockquoteLevel) break;
      } else if (isSpaceOrTab(char)) {
        replacedLine += char;
      } else {
        break;
      }
    }
    replacedLine += line.slice(replacedLine.length);
    lines[lineIndex] = replacedLine;
  }
  return parseHtmlFromText(
    `${" ".repeat(range[0])}${lines.join("\n")}`,
    range[0],
    range[1],
  );
}
