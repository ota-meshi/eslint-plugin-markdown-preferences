import type {
  Code,
  Heading,
  Html,
  Math,
  Paragraph,
  Table,
  Toml,
  Yaml,
} from "../language/ast-types.ts";
import type { ExtendedMarkdownSourceCode } from "../language/extended-markdown-language.ts";
import type { MDNode } from "../utils/ast.ts";
import { getParent } from "../utils/ast.ts";
import { createRule } from "../utils/index.ts";
import { getTextWidth } from "../utils/text-width.ts";

type MaxLengthOption = number | "ignore";
type MaxLengthParLangOption = MaxLengthOption | Record<string, MaxLengthOption>;
type MaxLengthParNodeOptions = {
  heading?: MaxLengthOption;
  paragraph?: MaxLengthOption;
  table?: MaxLengthOption;
  html?: MaxLengthOption;
  math?: MaxLengthOption;
  code?: MaxLengthParLangOption;
  frontmatter?: MaxLengthParLangOption;
};
type MaxLengthOptionForContainer = MaxLengthOption | MaxLengthParNodeOptions;
type Options = MaxLengthParNodeOptions & {
  // Options for containers that can have nested entities
  list?: MaxLengthOptionForContainer;
  blockquote?: MaxLengthOptionForContainer;
  footnoteDefinition?: MaxLengthOptionForContainer;
  // Whether to ignore lines containing URLs
  ignoreUrls?: boolean;
};

const URL_PATTERN =
  /https?:\/\/(?:w{3}\.)?[\w#%+\-.:=@~]{1,256}\.[\w()]{1,6}\b[\w#%&()+\-./:=?@~]*/gu;

const maxLengthSchema = {
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
const maxLengthParLangSchema = {
  oneOf: [
    maxLengthSchema,
    {
      type: "object",
      patternProperties: {
        ".*": maxLengthSchema,
      },
      additionalProperties: false,
    },
  ],
};
const maxLengthParPhrasingNodeOptionsSchema = {
  type: "object",
  properties: {
    heading: maxLengthSchema,
    paragraph: maxLengthSchema,
    table: maxLengthSchema,
    html: maxLengthSchema,
    math: maxLengthSchema,
    code: maxLengthParLangSchema,
    frontmatter: maxLengthParLangSchema,
  },
  additionalProperties: false,
};
const maxLengthOptionForContainerSchema = {
  oneOf: [maxLengthSchema, maxLengthParPhrasingNodeOptionsSchema],
};

/**
 * Parse options
 */
function parseOptions(
  options: Options,
  sourceCode: ExtendedMarkdownSourceCode,
): {
  maxLength: (
    node: Heading | Paragraph | Table | Html | Code | Yaml | Toml | Math,
  ) => number | "ignore";
  ignoreUrls: boolean;
} {
  const ignoreUrls = options.ignoreUrls ?? true;

  const maxLengthForNode = parseOptionsParNode({
    heading: options.heading ?? 80,
    paragraph: options.paragraph ?? 120,
    table: options.table ?? 120,
    html: options.html ?? 120,
    math: options.math ?? 120,
    code: options.code ?? "ignore",
    frontmatter: options.frontmatter ?? "ignore",
  });

  const maxLengthForInBlockquote = parseContainerOption(
    options.blockquote ?? {},
  );
  const maxLengthForInList = parseContainerOption(options.list ?? {});
  const maxLengthForInFootnoteDefinition = parseContainerOption(
    options.footnoteDefinition ?? {},
  );

  return {
    maxLength: (node) => {
      let maxLength: number | null = null;
      let parent: MDNode | null = getParent(sourceCode, node);
      while (parent) {
        const len =
          parent.type === "blockquote"
            ? maxLengthForInBlockquote(node)
            : parent.type === "listItem"
              ? maxLengthForInList(node)
              : parent.type === "footnoteDefinition"
                ? maxLengthForInFootnoteDefinition(node)
                : null;
        if (len == null) continue;
        if (len === "ignore") return "ignore";
        if (maxLength == null || len < maxLength) {
          maxLength = len;
        }

        parent = getParent(sourceCode, parent);
      }

      return maxLength ?? maxLengthForNode(node);
    },
    ignoreUrls,
  };
}

/**
 * Parse code option
 */
function parseCodeOption(
  option: MaxLengthParLangOption,
): (node: Code) => number | "ignore" {
  if (typeof option === "number" || option === "ignore") {
    return () => option;
  }
  return (node) => {
    if (node.lang && option[node.lang] != null) {
      return option[node.lang];
    }
    return "ignore";
  };
}

/**
 * Parse frontmatter option
 */
function parseFrontmatterOption(
  option: MaxLengthParLangOption,
): (node: Yaml | Toml) => number | "ignore" {
  if (typeof option === "number" || option === "ignore") {
    return () => option;
  }
  return (node) => {
    if (option[node.type] != null) {
      return option[node.type];
    }
    return "ignore";
  };
}

/**
 * Parse container option
 */
function parseContainerOption(
  option: MaxLengthOptionForContainer,
): (
  node: Heading | Paragraph | Table | Html | Code | Yaml | Toml | Math,
) => number | "ignore" | null {
  if (typeof option === "number" || option === "ignore") {
    return () => option;
  }
  return parseOptionsParNode(option);
}

/**
 * Parse options for phrasing nodes
 */
function parseOptionsParNode<T extends MaxLengthParNodeOptions>(
  option: T,
): (
  node: Heading | Paragraph | Table | Html | Code | Yaml | Toml | Math,
) =>
  | (number | "ignore")
  | (T extends Required<MaxLengthParNodeOptions> ? never : null) {
  const headingMax = option.heading;
  const paragraphMax = option.paragraph;
  const tableMax = option.table;
  const htmlMax = option.html;
  const mathMax = option.math;

  const maxLengthForCode = option.code ? parseCodeOption(option.code) : null;
  const maxLengthForFrontmatter = option.frontmatter
    ? parseFrontmatterOption(option.frontmatter)
    : null;

  /**
   * Get max length for a specific node type
   */
  function getMaxLength(
    node: Heading | Paragraph | Table | Html | Code | Yaml | Toml | Math,
  ): number | "ignore" | null {
    switch (node.type) {
      case "heading":
        return headingMax ?? null;
      case "paragraph":
        return paragraphMax ?? null;
      case "table":
        return tableMax ?? null;
      case "html":
        return htmlMax ?? null;
      case "math":
        return mathMax ?? null;
      case "code":
        return maxLengthForCode?.(node) ?? null;
      case "yaml":
      case "toml":
        return maxLengthForFrontmatter?.(node) ?? null;
    }
    return null;
  }

  return (node) => getMaxLength(node)!;
}

export default createRule<[Options?]>("max-len", {
  meta: {
    type: "layout",
    docs: {
      description: "enforce maximum length for various Markdown entities",
      categories: [],
      listCategory: "Decorative",
    },
    fixable: undefined,
    hasSuggestions: false,
    schema: [
      {
        type: "object",
        properties: {
          ...maxLengthParPhrasingNodeOptionsSchema.properties,

          list: maxLengthOptionForContainerSchema,
          blockquote: maxLengthOptionForContainerSchema,
          footnoteDefinition: maxLengthOptionForContainerSchema,
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

    const options = parseOptions(context.options[0] ?? {}, sourceCode);

    // Track which lines we've already checked to avoid double-checking
    const checkedLines = new Set<number>();

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
      node: Heading | Paragraph | Table | Html | Code | Yaml | Toml | Math,
    ): void {
      const maxLength = options.maxLength(node);
      if (maxLength === "ignore") return;

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
          if (options.ignoreUrls && containsUrl(line)) {
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

    return {
      heading: checkLines,
      paragraph: checkLines,
      table: checkLines,
      html(node) {
        const parent = getParent(sourceCode, node);
        if (
          parent.type !== "root" &&
          parent.type !== "blockquote" &&
          parent.type !== "listItem" &&
          parent.type !== "footnoteDefinition" &&
          parent.type !== "customContainer"
        ) {
          // HTML node is inside phrasing content, so it's not a block-level HTML node
          return;
        }
        checkLines(node);
      },
      code: checkLines,
      yaml: checkLines,
      toml: checkLines,
      math: checkLines,
    };
  },
});
