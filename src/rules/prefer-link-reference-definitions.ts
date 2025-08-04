import type { Definition, Link, LinkReference, Resource } from "mdast";
import { createRule } from "../utils/index.js";

export default createRule<[{ minLinks?: number }?]>(
  "prefer-link-reference-definitions",
  {
    meta: {
      type: "layout",
      docs: {
        description:
          "enforce using link reference definitions instead of inline links",
        categories: [],
      },
      fixable: "code",
      hasSuggestions: false,
      schema: [
        {
          type: "object",
          properties: {
            minLinks: {
              type: "number",
              description:
                "minimum number of links to trigger the rule (default: 2)",
              default: 2,
              minimum: 1,
            },
          },
          additionalProperties: false,
        },
      ],
      messages: {
        useLinkReferenceDefinitions:
          "Use link reference definitions instead of inline links.",
      },
    },
    create(context) {
      const sourceCode = context.sourceCode;
      const options = context.options[0] || {};
      const minLinks = options.minLinks ?? 2;

      const definitions: Definition[] = [];
      const links: Link[] = [];
      const linkReferences: LinkReference[] = [];

      /**
       * Verify links.
       */
      function verify() {
        type ResourceNodes = {
          links: Link[];
          linkReferences: LinkReference[];
          definitions: Definition[];
        };

        const resourceToNodes = new Map<
          string,
          Map<string | null, ResourceNodes>
        >();
        for (const link of links) {
          getResourceNodes(link).links.push(link);
        }
        for (const linkReference of linkReferences) {
          const definition = definitions.find(
            (def) => def.identifier === linkReference.identifier,
          );
          if (definition) {
            getResourceNodes(definition).linkReferences.push(linkReference);
          }
        }
        for (const definition of definitions) {
          getResourceNodes(definition).definitions.push(definition);
        }

        for (const map of resourceToNodes.values()) {
          for (const nodes of map.values()) {
            if (
              nodes.links.length === 0 ||
              nodes.links.length + nodes.linkReferences.length < minLinks
            )
              continue;

            for (const link of nodes.links) {
              const linkInfo = getLinkInfo(link);
              if (linkInfo.label === "") {
                // Ignore empty link labels
                continue;
              }

              context.report({
                node: link,
                messageId: "useLinkReferenceDefinitions",
                *fix(fixer) {
                  const definition = nodes.definitions[0];
                  let identifier: string;
                  if (definition) {
                    identifier = definition.label ?? definition.identifier;
                  } else {
                    identifier = linkInfo.label.replaceAll(/\]/g, "-");
                  }

                  yield fixer.replaceText(
                    link,
                    `${sourceCode.text.slice(...linkInfo.labelRange)}${identifier === linkInfo.label ? "" : `[${identifier}]`}`,
                  );

                  if (!definition) {
                    const linkRange = sourceCode.getRange(link);
                    const reLineBreaks = /\n#{1,6}\s/gu;
                    reLineBreaks.lastIndex = linkRange[1];
                    const nextSectionMatch = reLineBreaks.exec(sourceCode.text);
                    const insertIndex = !nextSectionMatch
                      ? sourceCode.text.trimEnd().length
                      : nextSectionMatch.index;

                    yield fixer.insertTextAfterRange(
                      [insertIndex, insertIndex],
                      `${sourceCode.text[insertIndex - 1] === "\n" ? "" : "\n"}\n[${identifier}]: ${sourceCode.text.slice(linkInfo.urlAndTitleRange[0] + 1, linkInfo.urlAndTitleRange[1] - 1).trim()}${nextSectionMatch ? "\n" : ""}`,
                    );
                  }
                },
              });
            }
          }
        }

        /**
         * Get the resource nodes for a link or definition.
         */
        function getResourceNodes<R extends Resource>(
          resource: R,
        ): ResourceNodes {
          const url = resource.url;
          const title = resource.title ?? null;
          let map = resourceToNodes.get(url);
          if (!map) {
            map = new Map();
            resourceToNodes.set(url, map);
          }
          let nodes = map.get(title);
          if (!nodes) {
            nodes = {
              links: [],
              linkReferences: [],
              definitions: [],
            };
            map.set(title, nodes);
          }
          return nodes;
        }
      }

      return {
        link(node) {
          links.push(node);
        },
        linkReference(node) {
          linkReferences.push(node);
        },
        definition(node) {
          definitions.push(node);
        },
        "root:exit"() {
          verify();
        },
      };

      /**
       * Get the range of the link label.
       */
      function getLinkInfo(link: Link) {
        const range = sourceCode.getRange(link);
        const linkLabelRange = getLinkLabelRange();
        const linkLabelWithBracketsText = sourceCode.text.slice(
          ...linkLabelRange,
        );
        const linkLabelText = linkLabelWithBracketsText.slice(1, -1).trim();
        const urlStartIndex = sourceCode.text.indexOf("(", linkLabelRange[1]);
        return {
          label: linkLabelText,
          labelRange: linkLabelRange,
          urlAndTitleRange: [urlStartIndex, range[1]] as [number, number],
        };

        /**
         * Get the range of the link label.
         */
        function getLinkLabelRange(): [number, number] {
          if (link.children.length === 0) {
            const index = sourceCode.text.indexOf("]", range[0] + 1);
            return [range[0], index + 1];
          }
          const lastRange = sourceCode.getRange(
            link.children[link.children.length - 1],
          );
          const index = sourceCode.text.indexOf("]", lastRange[0] + 1);
          return [range[0], index + 1];
        }
      }
    },
  },
);
