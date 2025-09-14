import type {
  Blockquote,
  Definition,
  FootnoteDefinition,
  Heading,
  Image,
  ImageReference,
  Link,
  LinkReference,
  ListItem,
  Table,
  Text,
} from "mdast";
import { getSourceLocationFromRange } from "../utils/ast.ts";
import { createRule } from "../utils/index.ts";
import { isWhitespace } from "../utils/unicode.ts";
import { parseLinkDefinition } from "../utils/link-definition.ts";
import { parseInlineLink } from "../utils/link.ts";
import { parseImage } from "../utils/image.ts";
import { parseListItem } from "../utils/list-item.ts";
import { parseTableDelimiterRow } from "../utils/table.ts";

export default createRule("no-multi-spaces", {
  meta: {
    type: "layout",
    docs: {
      description: "disallow multiple spaces",
      categories: ["standard"],
      listCategory: "Whitespace",
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
    let codeText = sourceCode.text;

    return {
      definition: verifyLinkDefinition,
      footnoteDefinition: verifyFootnoteDefinition,
      heading: verifyHeading,
      image: verifyImage,
      imageReference: verifyImageReference,
      link: verifyLink,
      linkReference: verifyLinkReference,
      listItem: verifyListItem,
      blockquote: processBlockquote,
      text: verifyText,
      table: verifyTable,
    };

    /**
     * Verify a text node.
     */
    function verifyText(node: Text) {
      verifyTextInNode(node);
    }

    /**
     * Verify a table node.
     */
    function verifyTable(node: Table) {
      const parsedDelimiterRow = parseTableDelimiterRow(sourceCode, node);
      if (!parsedDelimiterRow) return;
      // Verify the delimiter row text.
      verifyTextInRange(node, parsedDelimiterRow.range);
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
     * Verify a list item node
     */
    function verifyListItem(node: ListItem) {
      const nodeRange = sourceCode.getRange(node);
      const parsed = parseListItem(sourceCode, node);
      if (parsed.taskListItemMarker) {
        verifyTextInRange(node, [
          nodeRange[0],
          parsed.taskListItemMarker.range[0],
        ]);
      }

      // Strip out the marker texts to avoid indent reports.
      let newCodeText =
        codeText.slice(0, parsed.marker.range[0]) +
        " ".repeat(parsed.marker.range[1] - parsed.marker.range[0]);
      if (parsed.taskListItemMarker) {
        newCodeText +=
          codeText.slice(
            parsed.marker.range[1],
            parsed.taskListItemMarker.range[0],
          ) +
          " ".repeat(
            parsed.taskListItemMarker.range[1] -
              parsed.taskListItemMarker.range[0],
          ) +
          codeText.slice(parsed.taskListItemMarker.range[1]);
      } else {
        newCodeText += codeText.slice(parsed.marker.range[1]);
      }
      codeText = newCodeText;
    }

    /**
     * Verify spaces in a node
     */
    function verifyTextInNode(node: Text | Image | ImageReference) {
      const nodeRange = sourceCode.getRange(node);
      verifyTextInRange(node, nodeRange);
    }

    /**
     * Process a blockquote node
     */
    function processBlockquote(node: Blockquote) {
      const nodeRange = sourceCode.getRange(node);

      // Strip out the marker texts to avoid indent reports.
      let newCodeText = "";
      let inIndent = true;
      for (let index = nodeRange[0]; index < nodeRange[1]; index++) {
        const c = codeText[index];
        if (c === "\n") {
          inIndent = true;
          continue;
        }
        if (isWhitespace(c)) continue;
        if (c === ">" && inIndent) {
          newCodeText += `${codeText.slice(newCodeText.length, index)} `;
        }
        inIndent = false;
      }
      newCodeText += codeText.slice(newCodeText.length);
      codeText = newCodeText;
    }

    /**
     * Verify spaces in a node excluding children
     */
    function verifyTextOutsideChildren(
      node: FootnoteDefinition | Heading | LinkReference,
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
        | ListItem
        | Table,
      textRange: [number, number],
    ) {
      const nodeRange = sourceCode.getRange(node);
      const text = codeText.slice(...textRange);
      const reSpaces = /\s{2,}|\n/gu;
      let match;

      while ((match = reSpaces.exec(text)) !== null) {
        const spaces = match[0];
        if (spaces.includes("\n")) {
          // Skip blockquote marker
          let c = "";
          while ((c = text[reSpaces.lastIndex]) && isWhitespace(c)) {
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
            const c = codeText[index];
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
          for (let index = nodeRange[1]; index < codeText.length; index++) {
            const c = codeText[index];
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
