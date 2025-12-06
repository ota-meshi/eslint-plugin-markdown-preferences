import type {
  Blockquote,
  Code,
  FootnoteDefinition,
  Heading,
  Html,
  List,
  Math,
  Paragraph,
  Table,
  Toml,
  Yaml,
} from "../language/ast-types.ts";
import { createRule } from "../utils/index.ts";
import { getTextWidth } from "../utils/text-width.ts";

type IgnorableOption = number | "ignore";
type NestedOptions = {
  heading?: IgnorableOption;
  paragraph?: IgnorableOption;
};

type OptionObject = {
  heading?: IgnorableOption;
  paragraph?: IgnorableOption;
  list?: IgnorableOption | NestedOptions;
  blockquote?: IgnorableOption | NestedOptions;
  table?: IgnorableOption;
  footnoteDefinition?: IgnorableOption | NestedOptions;
  html?: IgnorableOption;
  code?: IgnorableOption | Record<string, IgnorableOption>;
  frontmatter?: IgnorableOption | Record<string, IgnorableOption>;
  math?: IgnorableOption;
  ignoreUrls?: boolean;
};
type Option = OptionObject;

const URL_PATTERN =
  /https?:\/\/(?:w{3}\.)?[\w#%+.:=@~-]{1,256}\.[\w()]{1,6}\b[\w#%&()+./:=?@~-]*/gu;

const ignorableSchema = {
  oneOf: [
    {
      type: "integer",
      minimum: 1,
    },
    {
      enum: ["ignore"],
    },
  ],
};

const nestedOptionsSchema = {
  oneOf: [
    ignorableSchema,
    {
      type: "object",
      properties: {
        heading: ignorableSchema,
        paragraph: ignorableSchema,
      },
      additionalProperties: false,
    },
  ],
};

const codeOrFrontmatterSchema = {
  oneOf: [
    ignorableSchema,
    {
      type: "object",
      patternProperties: {
        ".*": ignorableSchema,
      },
      additionalProperties: false,
    },
  ],
};

export default createRule<[Option?]>("max-len", {
  meta: {
    type: "layout",
    docs: {
      description: "enforce maximum length for various Markdown entities",
      categories: [],
    },
    fixable: null,
    hasSuggestions: false,
    schema: [
      {
        type: "object",
        properties: {
          heading: ignorableSchema,
          paragraph: ignorableSchema,
          list: nestedOptionsSchema,
          blockquote: nestedOptionsSchema,
          table: ignorableSchema,
          footnoteDefinition: nestedOptionsSchema,
          html: ignorableSchema,
          code: codeOrFrontmatterSchema,
          frontmatter: codeOrFrontmatterSchema,
          math: ignorableSchema,
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
    const ignoreUrls = opt.ignoreUrls ?? true;

    // Track which lines we've already checked to avoid double-checking
    const checkedLines = new Set<number>();

    // Track context for nested checks
    const contextStack: { type: string; options: NestedOptions }[] = [];

    /**
     * Get the max length for a specific entity type
     */
    function getMaxLength(
      entityType: "heading" | "paragraph",
      defaultMax: number,
    ): number | null {
      // Check if we're in a nested context (blockquote, list, footnoteDefinition)
      for (let i = contextStack.length - 1; i >= 0; i--) {
        const ctx = contextStack[i];
        if (ctx.options[entityType] !== undefined) {
          const val = ctx.options[entityType];
          if (val === "ignore") return null;
          return val;
        }
      }

      // Use top-level option
      const val = opt[entityType];
      if (val === undefined) return defaultMax;
      if (val === "ignore") return null;
      return val;
    }

    /**
     * Check if a line contains a URL (following @stylistic/max-len behavior)
     * URLs are identified by the URL_PATTERN
     */
    function containsUrl(line: string): boolean {
      // Reset regex state
      URL_PATTERN.lastIndex = 0;
      return URL_PATTERN.test(line);
    }

    /**
     * Check lines in a node against a maximum length
     */
    function checkLines(
      node:
        | Heading
        | Paragraph
        | List
        | Blockquote
        | Table
        | FootnoteDefinition
        | Html
        | Code
        | Yaml
        | Toml
        | Math,
      maxLength: number | "ignore" | null | undefined,
    ): void {
      if (
        maxLength === "ignore" ||
        maxLength === null ||
        maxLength === undefined
      )
        return;

      const nodeLoc = sourceCode.getLoc(node);
      const startLine = nodeLoc.start.line;
      const endLine = nodeLoc.end.line;

      for (let lineNumber = startLine; lineNumber <= endLine; lineNumber++) {
        // Skip if we've already checked this line
        if (checkedLines.has(lineNumber)) {
          continue;
        }

        const line = sourceCode.lines[lineNumber - 1];
        const width = getTextWidth(line);

        if (width > maxLength) {
          if (ignoreUrls && containsUrl(line)) {
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

          checkedLines.add(lineNumber);
        }
      }
    }

    /**
     * Get code/frontmatter max length by language
     */
    function getCodeMaxLength(lang: string | null | undefined): number | null {
      const codeOpt = opt.code;
      if (codeOpt === undefined) return null; // ignore by default
      if (codeOpt === "ignore") return null;
      if (typeof codeOpt === "number") return codeOpt;

      // Language-specific configuration
      if (lang && codeOpt[lang] !== undefined) {
        const val = codeOpt[lang];
        if (val === "ignore") return null;
        return val;
      }

      return null; // ignore if no match
    }

    /**
     * Get frontmatter max length by type
     */
    function getFrontmatterMaxLength(type: "yaml" | "toml"): number | null {
      const frontmatterOpt = opt.frontmatter;
      if (frontmatterOpt === undefined) return null; // ignore by default
      if (frontmatterOpt === "ignore") return null;
      if (typeof frontmatterOpt === "number") return frontmatterOpt;

      // Type-specific configuration
      if (frontmatterOpt[type] !== undefined) {
        const val = frontmatterOpt[type];
        if (val === "ignore") return null;
        return val;
      }

      return null; // ignore if no match
    }

    return {
      heading(node: Heading) {
        const maxLength = getMaxLength("heading", 80);
        checkLines(node, maxLength, "heading");
      },
      paragraph(node: Paragraph) {
        const maxLength = getMaxLength("paragraph", 120);
        checkLines(node, maxLength, "paragraph");
      },
      list(node: List) {
        const listOpt = opt.list ?? 120;
        if (listOpt === "ignore") return;

        if (typeof listOpt === "object") {
          // Nested configuration
          contextStack.push({ type: "list", options: listOpt });
        } else {
          // Simple number
          checkLines(node, listOpt, "list");
        }
      },
      "list:exit"(_node: List) {
        const listOpt = opt.list;
        if (typeof listOpt === "object") {
          contextStack.pop();
        }
      },
      blockquote(node: Blockquote) {
        const blockquoteOpt = opt.blockquote ?? 120;
        if (blockquoteOpt === "ignore") return;

        if (typeof blockquoteOpt === "object") {
          // Nested configuration
          contextStack.push({ type: "blockquote", options: blockquoteOpt });
        } else {
          // Simple number
          checkLines(node, blockquoteOpt, "blockquote");
        }
      },
      "blockquote:exit"(_node: Blockquote) {
        const blockquoteOpt = opt.blockquote;
        if (typeof blockquoteOpt === "object") {
          contextStack.pop();
        }
      },
      table(node: Table) {
        const tableOpt = opt.table ?? 120;
        checkLines(node, tableOpt, "table");
      },
      footnoteDefinition(node: FootnoteDefinition) {
        const footnoteOpt = opt.footnoteDefinition ?? 120;
        if (footnoteOpt === "ignore") return;

        if (typeof footnoteOpt === "object") {
          // Nested configuration
          contextStack.push({
            type: "footnoteDefinition",
            options: footnoteOpt,
          });
        } else {
          // Simple number
          checkLines(node, footnoteOpt, "footnoteDefinition");
        }
      },
      "footnoteDefinition:exit"(_node: FootnoteDefinition) {
        const footnoteOpt = opt.footnoteDefinition;
        if (typeof footnoteOpt === "object") {
          contextStack.pop();
        }
      },
      html(node: Html) {
        const htmlOpt = opt.html ?? 120;
        checkLines(node, htmlOpt, "html");
      },
      code(node: Code) {
        const maxLength = getCodeMaxLength(node.lang);
        checkLines(node, maxLength, "code");
      },
      yaml(node: Yaml) {
        const maxLength = getFrontmatterMaxLength("yaml");
        checkLines(node, maxLength, "frontmatter");
      },
      toml(node: Toml) {
        const maxLength = getFrontmatterMaxLength("toml");
        checkLines(node, maxLength, "frontmatter");
      },
      math(node: Math) {
        const mathOpt = opt.math;
        checkLines(node, mathOpt, "math");
      },
    };
  },
});
