import type { Definition, FootnoteDefinition } from "mdast";
import { createRule } from "../utils/index.ts";
import { toRegExp, isRegExp } from "../utils/regexp.ts";
import { getParent, type MDNode } from "../utils/ast.ts";

type MatchOption = string | string[];
type OrderOption =
  | MatchOption
  | {
      match: MatchOption;
      sort: "alphabetical" | "ignore";
    };
export default createRule<[{ order?: OrderOption[] }?]>("sort-definitions", {
  meta: {
    type: "layout",
    docs: {
      description:
        "enforce a specific order for link definitions and footnote definitions",
      categories: ["standard"],
      listCategory: "Stylistic",
    },
    fixable: "code",
    hasSuggestions: false,
    schema: [
      {
        type: "object",
        properties: {
          order: {
            type: "array",
            items: {
              anyOf: [
                { type: "string" },
                {
                  type: "array",
                  items: {
                    type: "string",
                  },
                  uniqueItems: true,
                  minItems: 1,
                },
                {
                  type: "object",
                  properties: {
                    match: {
                      anyOf: [
                        { type: "string" },
                        {
                          type: "array",
                          items: {
                            type: "string",
                          },
                          uniqueItems: true,
                          minItems: 1,
                        },
                      ],
                    },
                    sort: {
                      enum: ["alphabetical", "ignore"],
                    },
                  },
                  required: ["match", "sort"],
                  additionalProperties: false,
                },
              ],
            },
            uniqueItems: true,
            additionalItems: false,
          },
          alphabetical: { type: "boolean" },
        },
        additionalProperties: false,
      },
    ],
    messages: {
      shouldBefore:
        "The definition '{{currentKey}}' should be before '{{prevKey}}'.",
    },
  },
  create(context) {
    type DefinitionNode = Definition | FootnoteDefinition;

    type ParsedOption = {
      ignore: (node: DefinitionNode) => boolean;
      compare: (a: DefinitionNode, b: DefinitionNode) => number;
    };

    type CompiledOption = {
      match: (node: DefinitionNode) => boolean;
      sort: "alphabetical" | "ignore";
    };

    const sourceCode = context.sourceCode;
    const option = parseOption(context.options[0]);

    const group: DefinitionNode[] = [];

    const cacheText = new Map<DefinitionNode, string>();

    /** Get normalized text */
    function getDefinitionText(node: DefinitionNode) {
      const k = cacheText.get(node);
      if (k != null) return k;

      if (node.type === "definition") {
        return `[${node.label || node.identifier}]: ${node.url}${printTitle(node.title)}`;
      }

      let childrenText = "";
      if (node.children.length) {
        const [start] = sourceCode.getRange(node.children[0]);
        const [, end] = sourceCode.getRange(node.children.at(-1)!);
        childrenText = sourceCode.text.slice(start, end);
      }

      return `[^${node.identifier}]: ${childrenText}`;
    }

    /** Report */
    function report(
      node: DefinitionNode,
      previousNode: DefinitionNode,
      definitions: DefinitionNode[],
    ) {
      const currentKey = getDefinitionText(node);
      const prevKey = getDefinitionText(previousNode);
      context.report({
        node,
        messageId: "shouldBefore",
        data: {
          currentKey,
          prevKey,
        },

        fix(fixer) {
          const previousNodeIndex = definitions.indexOf(previousNode);
          const targetNodeIndex = definitions.indexOf(node);
          const previousNodes = definitions.slice(
            previousNodeIndex,
            targetNodeIndex,
          );
          const before = definitions.slice(0, previousNodeIndex);
          const after = definitions.slice(targetNodeIndex + 1);
          const movedNodes = [...before, node, ...previousNodes, ...after];
          return movedNodes.map((moveNode, index) => {
            let text = sourceCode.getText(moveNode);
            if (moveNode.type === "definition" && index > 0) {
              if (movedNodes[index - 1].type === "footnoteDefinition") {
                const footnoteLoc = sourceCode.getLoc(definitions[index - 1]);
                const linkLoc = sourceCode.getLoc(definitions[index]);
                if (linkLoc.start.line - footnoteLoc.end.line <= 1) {
                  // If there is no blank line between the footnote definition and the link definition, add a line break.
                  text = `\n${text}`;
                }
              }
            }

            return fixer.replaceText(definitions[index], text);
          });
        },
      });
    }

    /**
     * Verify definitions and footnote definitions.
     */
    function verify(definitions: DefinitionNode[]) {
      if (definitions.length === 0) return;

      const validPreviousNodes: DefinitionNode[] = [];

      for (const definition of definitions) {
        if (option.ignore(definition)) {
          continue;
        }
        const invalidPreviousNode = validPreviousNodes.find(
          (previousNode) => option.compare(previousNode, definition) > 0,
        );
        if (invalidPreviousNode) {
          report(definition, invalidPreviousNode, definitions);
          continue;
        }

        validPreviousNodes.push(definition);
      }
    }

    return {
      "*"(node: MDNode) {
        const last = group.at(-1);
        if (
          last &&
          ((node.type !== "definition" && node.type !== "footnoteDefinition") ||
            getParent(sourceCode, node) !== getParent(sourceCode, last))
        ) {
          const range = sourceCode.getRange(node);
          const lastDefinitionRange = sourceCode.getRange(last);
          if (lastDefinitionRange[1] <= range[0]) {
            verify(group);
            group.length = 0;
          }
        }
        if (node.type === "definition" || node.type === "footnoteDefinition") {
          group.push(node);
        }
      },
      "root:exit"() {
        verify(group);
      },
    };

    /** Parse options */
    function parseOption(userOption?: { order?: OrderOption[] }): ParsedOption {
      const order: OrderOption[] = userOption?.order ?? [
        {
          match: String.raw`!/^\[\\^/u`,
          sort: "alphabetical",
        },
        {
          match: String.raw`/./u`,
          sort: "alphabetical",
        },
      ];

      const compiled: CompiledOption[] = order.map(compileOption);

      return {
        ignore: (node) => {
          return !compiled.some((c) => c.match(node));
        },
        compare: (a, b) => {
          for (const c of compiled) {
            const matchA = c.match(a);
            const matchB = c.match(b);
            if (matchA && matchB) {
              if (c.sort === "alphabetical") {
                const textA = getDefinitionText(a);
                const textB = getDefinitionText(b);
                if (textA === textB) return 0;
                return textA < textB ? -1 : 1;
              }
              return 0;
            }
            if (matchA) {
              return -1;
            }
            if (matchB) {
              return 1;
            }
          }
          throw new Error("Illegal state");
        },
      };
    }

    /** Compile order option */
    function compileOption(orderOption: OrderOption): CompiledOption {
      const cache = new Map<DefinitionNode, boolean>();
      const compiled = compileOptionWithoutCache(orderOption);

      return {
        match: (node) => {
          const cached = cache.get(node);
          if (cached != null) return cached;
          const result = compiled.match(node);
          cache.set(node, result);
          return result;
        },
        sort: compiled.sort,
      };
    }

    /** Compile order option without cache */
    function compileOptionWithoutCache(
      orderOption: OrderOption,
    ): CompiledOption {
      if (typeof orderOption === "string") {
        const match = compileMatcher([orderOption]);
        return { match, sort: "ignore" };
      }
      if (Array.isArray(orderOption)) {
        const match = compileMatcher(orderOption);
        return { match, sort: "ignore" };
      }
      const { match } = compileOptionWithoutCache(orderOption.match);
      return { match, sort: orderOption.sort || "ignore" };
    }

    /** Compile matcher */
    function compileMatcher(
      pattern: string[],
    ): (node: DefinitionNode) => boolean {
      const rules: {
        negative: boolean;
        match: (node: DefinitionNode) => boolean;
      }[] = [];
      for (const p of pattern) {
        let negative: boolean, patternStr: string;
        if (p.startsWith("!")) {
          // If there is `!` at the beginning, it will be parsed with a negative pattern.
          negative = true;
          patternStr = p.substring(1);
        } else {
          negative = false;
          patternStr = p;
        }
        const regex = toRegExp(patternStr);
        if (isRegExp(patternStr)) {
          rules.push({
            negative,
            match: (node) => regex.test(getDefinitionText(node)),
          });
        } else {
          rules.push({
            negative,
            match: (node) => {
              if (node.label === patternStr || node.identifier === patternStr) {
                return true;
              }
              if (node.type === "definition") {
                if (node.url === patternStr) return true;
                if (URL.canParse(patternStr) && URL.canParse(node.url)) {
                  const normalizedPattern = normalizedURL(patternStr);
                  const normalizedUrl = normalizedURL(node.url);
                  if (normalizedUrl.startsWith(normalizedPattern)) {
                    return true;
                  }
                }
              }
              return regex.test(getDefinitionText(node));
            },
          });
        }
      }
      return (node) => {
        // If the first rule is a negative pattern, they are considered to match if they do not match that pattern.
        let result = Boolean(rules[0]?.negative);
        for (const { negative, match } of rules) {
          if (result === !negative) {
            // Even if it matches, the result does not change, so skip it.
            continue;
          }
          if (match(node)) {
            result = !negative;
          }
        }
        return result;
      };
    }
  },
});

/**
 * Print the title with quotes.
 */
function printTitle(title: string | null | undefined) {
  if (!title) {
    return "";
  }

  // title is escaped after `remark-parse` v7
  let titleToPrint = title.replaceAll(/\\(?=["')])/gu, "");

  if (
    titleToPrint.includes('"') &&
    titleToPrint.includes("'") &&
    !titleToPrint.includes(")")
  ) {
    return ` (${titleToPrint})`; // avoid escaped quotes
  }
  const quote = getQuote(titleToPrint);
  titleToPrint = titleToPrint.replaceAll("\\", "\\\\");
  titleToPrint = titleToPrint.replaceAll(quote, `\\${quote}`);
  return ` ${quote}${titleToPrint}${quote}`;
}

/**
 * Get the preferred quote for a string.
 */
function getQuote(text: string) {
  let doubleQuoteCount = 0;
  let singleQuoteCount = 0;
  for (const character of text) {
    if (character === '"') {
      doubleQuoteCount++;
    } else if (character === "'") {
      singleQuoteCount++;
    }
  }

  return doubleQuoteCount > singleQuoteCount ? "'" : '"';
}

/**
 * Normalize a URL by ensuring it ends with a slash.
 */
function normalizedURL(url: string) {
  const urlObj = new URL(url);
  if (!urlObj) return url;
  return urlObj.href.endsWith("/") ? urlObj.href : `${urlObj.href}/`;
}
