import type {
  Definition,
  FootnoteDefinition,
  Heading,
  Image,
  ImageReference,
  Link,
  LinkReference,
  ListItem,
  Text,
} from "mdast";
import { getSourceLocationFromRange } from "../utils/ast.ts";
import { createRule } from "../utils/index.ts";
import { isWhitespace } from "../utils/unicode.ts";
import { parseLinkDefinition } from "../utils/link-definition.ts";
import { parseInlineLink } from "../utils/link.ts";
import { parseImage } from "../utils/image.ts";

export default createRule("no-multi-spaces", {
  meta: {
    type: "layout",
    docs: {
      description: "disallow multiple spaces",
      categories: ["standard"],
      listCategory: "Stylistic",
    },
    fixable: "whitespace",
    hasSuggestions: false,
    schema: [],
    messages: {
      multipleSpaces: "Multiple spaces are not allowed.",
    },
  },
  create(context) {
    const sourceCode = context.sourceCode;

    return {
      definition: verifyLinkDefinition,
      footnoteDefinition: verifyFootnoteDefinition,
      heading: verifyHeading,
      image: verifyImage,
      imageReference: verifyImageReference,
      link: verifyLink,
      linkReference: verifyLinkReference,
      text: verifyText,
    };

    /**
     * Verify a text node.
     */
    function verifyText(node: Text) {
      verifyTextInNode(node);
    }

    /**
     * Verify a definition node.
     */
    function verifyLinkDefinition(node: Definition) {
      const parsed = parseLinkDefinition(sourceCode, node);
      if (!parsed) return;
      const nodeRange = sourceCode.getRange(node);
      verifyTextInRange(node, [nodeRange[0], parsed.destination.range[0]]);
      verifyTextInRange(node, [parsed.destination.range[1], nodeRange[1]]);
    }

    /**
     * Verify a footnote definition node
     */
    function verifyFootnoteDefinition(node: FootnoteDefinition) {
      verifyTextOutsideChildren(node);
    }

    /**
     * Verify a heading node
     */
    function verifyHeading(node: Heading) {
      verifyTextOutsideChildren(node);
    }

    /**
     * Verify an image node
     */
    function verifyImage(node: Image) {
      const parsed = parseImage(sourceCode, node);
      if (!parsed) return;
      const nodeRange = sourceCode.getRange(node);
      verifyTextInRange(node, [nodeRange[0], parsed.destination.range[0]]);
      verifyTextInRange(node, [parsed.destination.range[1], nodeRange[1]]);
    }

    /**
     * Verify an image reference node
     */
    function verifyImageReference(node: ImageReference) {
      verifyTextInNode(node);
    }

    /**
     * Verify a link node
     */
    function verifyLink(node: Link) {
      const parsed = parseInlineLink(sourceCode, node);
      if (!parsed) return;
      const nodeRange = sourceCode.getRange(node);
      if (node.children.length > 0) {
        const first = node.children[0];
        const last = node.children[node.children.length - 1];
        const firstRange = sourceCode.getRange(first);
        const lastRange = sourceCode.getRange(last);
        verifyTextInRange(node, [nodeRange[0], firstRange[0]]);
        verifyTextInRange(node, [lastRange[1], parsed.destination.range[0]]);
      } else {
        verifyTextInRange(node, [nodeRange[0], parsed.destination.range[0]]);
      }
      verifyTextInRange(node, [parsed.destination.range[1], nodeRange[1]]);
    }

    /**
     * Verify a link reference node
     */
    function verifyLinkReference(node: LinkReference) {
      verifyTextOutsideChildren(node);
    }

    /**
     * Verify spaces in a node
     */
    function verifyTextInNode(node: Text | Image | ImageReference) {
      const nodeRange = sourceCode.getRange(node);
      verifyTextInRange(node, nodeRange);
    }

    /**
     * Verify spaces in a node excluding children
     */
    function verifyTextOutsideChildren(
      node: FootnoteDefinition | Heading | LinkReference | ListItem,
    ) {
      const nodeRange = sourceCode.getRange(node);
      if (node.children.length > 0) {
        const first = node.children[0];
        const last = node.children[node.children.length - 1];
        const firstRange = sourceCode.getRange(first);
        const lastRange = sourceCode.getRange(last);
        verifyTextInRange(node, [nodeRange[0], firstRange[0]]);
        verifyTextInRange(node, [lastRange[1], nodeRange[1]]);
      } else {
        verifyTextInRange(node, nodeRange);
      }
    }

    /**
     * Verify spaces in a node
     */
    function verifyTextInRange(
      node:
        | Text
        | Definition
        | FootnoteDefinition
        | Heading
        | Image
        | ImageReference
        | Link
        | LinkReference
        | ListItem,
      textRange: [number, number],
    ) {
      const nodeRange = sourceCode.getRange(node);
      const text = sourceCode.text.slice(...textRange);
      const reSpaces = /\s{2,}|\n/gu;
      let match;

      while ((match = reSpaces.exec(text)) !== null) {
        const spaces = match[0];
        if (spaces.includes("\n")) {
          // Skip blockquote marker
          let c = "";
          while ((c = text[reSpaces.lastIndex]) && (c === ">" || !c.trim())) {
            reSpaces.lastIndex++;
          }
          continue;
        }
        if (spaces.length < 2) continue;
        const start = textRange[0] + match.index;
        const end = start + spaces.length;
        const range: [number, number] = [start, end];

        if (nodeRange[0] === range[0]) {
          let isIndentation = true;
          for (let index = nodeRange[0] - 1; index >= 0; index--) {
            const c = sourceCode.text[index];
            if (c === "\n") break;
            if (isWhitespace(c)) continue;
            isIndentation = false;
            break;
          }
          if (isIndentation) {
            // The spaces are indentation.
            continue;
          }
        }
        if (nodeRange[1] === range[1]) {
          let isTrailingSpaces = true;
          for (
            let index = nodeRange[1];
            index < sourceCode.text.length;
            index++
          ) {
            const c = sourceCode.text[index];
            if (c === "\n") break;
            if (isWhitespace(c)) continue;
            isTrailingSpaces = false;
            break;
          }
          if (isTrailingSpaces) {
            // The spaces are trailing.
            continue;
          }
        }

        context.report({
          node,
          messageId: "multipleSpaces",
          loc: getSourceLocationFromRange(sourceCode, node, range),
          fix(fixer) {
            return fixer.replaceTextRange(range, " ");
          },
        });
      }
    }
  },
});
