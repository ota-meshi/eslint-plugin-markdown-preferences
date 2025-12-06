import type {
  Blockquote,
  Code,
  Heading,
  ListItem,
  Paragraph,
  TableRow,
} from "../language/ast-types.ts";
import { createRule } from "../utils/index.ts";
import { getTextWidth } from "../utils/text-width.ts";

type OptionObject = {
  heading?: number;
  paragraph?: number;
  listItem?: number;
  blockquote?: number;
  tableRow?: number;
  codeBlock?: number | null;
  ignoreUrls?: boolean;
};
type Option = OptionObject;

const URL_PATTERN =
  /https?:\/\/(?:w{3}\.)?[\w#%+\-.:=@~]{1,256}\.[()0-9A-Za-z]{1,6}\b[\w#%&()+\-./:=?@~]*/gu;

export default createRule<[Option?]>("max-len", {
  meta: {
    type: "layout",
    docs: {
      description: "enforce maximum length for various Markdown entities",
      categories: ["standard"],
      listCategory: "Layout & Formatting",
    },
    fixable: null,
    hasSuggestions: false,
    schema: [
      {
        type: "object",
        properties: {
          heading: {
            type: "integer",
            minimum: 1,
          },
          paragraph: {
            type: "integer",
            minimum: 1,
          },
          listItem: {
            type: "integer",
            minimum: 1,
          },
          blockquote: {
            type: "integer",
            minimum: 1,
          },
          tableRow: {
            type: "integer",
            minimum: 1,
          },
          codeBlock: {
            oneOf: [
              {
                type: "integer",
                minimum: 1,
              },
              {
                type: "null",
              },
            ],
          },
          ignoreUrls: {
            type: "boolean",
          },
        },
        additionalProperties: false,
      },
    ],
    messages: {
      maxLenExceeded:
        "Line length of {{actual}} exceeds the maximum of {{max}}.",
    },
  },
  create(context) {
    const sourceCode = context.sourceCode;

    const opt = context.options[0] || {};
    const headingMax = opt.heading ?? 80;
    const paragraphMax = opt.paragraph ?? 120;
    const listItemMax = opt.listItem ?? 120;
    const blockquoteMax = opt.blockquote ?? 120;
    const tableRowMax = opt.tableRow ?? 120;
    const codeBlockMax = opt.codeBlock ?? null; // null means ignore
    const ignoreUrls = opt.ignoreUrls ?? true;

    // Track which ranges we've already checked to avoid double-checking
    const checkedRanges = new Set<string>();

    /**
     * Check if a line contains a URL that takes up significant space
     */
    function shouldIgnoreLine(text: string, maxLength: number): boolean {
      if (!ignoreUrls) return false;

      // Find all URLs in the text
      const urls = [...text.matchAll(URL_PATTERN)];
      if (urls.length === 0) return false;

      // Calculate the longest URL length
      const longestUrlLength = Math.max(
        ...urls.map((match) => match[0].length),
      );

      // If the URL takes up a significant portion of the line, ignore it
      // We consider it significant if the URL is longer than the max length
      // or if the text without URLs would fit within the max length
      if (longestUrlLength > maxLength) return true;

      // Calculate length without URLs
      let textWithoutUrls = text;
      for (const match of urls) {
        textWithoutUrls = textWithoutUrls.replace(match[0], "");
      }

      const widthWithoutUrls = getTextWidth(textWithoutUrls);
      return widthWithoutUrls <= maxLength;
    }

    /**
     * Get the text content of a node by concatenating all its text children
     */
    function getNodeText(
      node: Heading | Paragraph | ListItem | Blockquote | TableRow | Code,
    ): string {
      const range = sourceCode.getRange(node);
      return sourceCode.text.slice(range[0], range[1]);
    }

    /**
     * Check lines in a node against a maximum length
     */
    function checkLines(
      node: Heading | Paragraph | ListItem | Blockquote | TableRow | Code,
      maxLength: number,
    ): void {
      const text = getNodeText(node);
      const lines = text.split(/\r?\n/);
      const startLoc = sourceCode.getLocFromIndex(sourceCode.getRange(node)[0]);

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const width = getTextWidth(line);

        if (width > maxLength) {
          if (shouldIgnoreLine(line, maxLength)) {
            continue;
          }

          const lineNumber = startLoc.line + i;
          const rangeKey = `${lineNumber}`;

          // Skip if we've already checked this line
          if (checkedRanges.has(rangeKey)) {
            continue;
          }

          context.report({
            node,
            loc: {
              start: { line: lineNumber, column: 1 },
              end: { line: lineNumber, column: line.length + 1 },
            },
            messageId: "maxLenExceeded",
            data: {
              actual: String(width),
              max: String(maxLength),
            },
          });

          checkedRanges.add(rangeKey);
        }
      }
    }

    return {
      heading(node: Heading) {
        checkLines(node, headingMax);
      },
      paragraph(node: Paragraph) {
        checkLines(node, paragraphMax);
      },
      listItem(node: ListItem) {
        // Check the list item content
        checkLines(node, listItemMax);
      },
      blockquote(node: Blockquote) {
        checkLines(node, blockquoteMax);
      },
      tableRow(node: TableRow) {
        checkLines(node, tableRowMax);
      },
      code(node: Code) {
        if (codeBlockMax === null) return; // Ignore code blocks by default
        checkLines(node, codeBlockMax);
      },
    };
  },
});
