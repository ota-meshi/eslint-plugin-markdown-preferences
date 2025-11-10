import type {
  Definition,
  Heading,
  Image,
  ImageReference,
  Link,
  LinkReference,
  Resource,
} from "../language/ast-types.ts";
import { createRule } from "../utils/index.ts";

export default createRule<[{ minLinks?: number }?]>(
  "prefer-link-reference-definitions",
  {
    meta: {
      type: "layout",
      docs: {
        description:
          "enforce using link reference definitions instead of inline links",
        categories: [],
        listCategory: "Notation",
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
      const links: (Link | Image)[] = [];
      const references: (LinkReference | ImageReference)[] = [];
      const headings: Heading[] = [];

      /**
       * Verify links.
       */
      function verify() {
        type ResourceNodes = {
          links: (Link | Image)[];
          references: (LinkReference | ImageReference)[];
          definitions: Definition[];
        };

        const resourceToNodes = new Map<
          string,
          Map<string | null, ResourceNodes>
        >();
        for (const link of links) {
          getResourceNodes(link).links.push(link);
        }
        for (const reference of references) {
          const definition = definitions.find(
            (def) => def.identifier === reference.identifier,
          );
          if (definition) {
            getResourceNodes(definition).references.push(reference);
          }
        }
        for (const definition of definitions) {
          getResourceNodes(definition).definitions.push(definition);
        }

        for (const map of resourceToNodes.values()) {
          for (const nodes of map.values()) {
            if (
              nodes.links.length === 0 ||
              nodes.links.length + nodes.references.length < minLinks
            )
              continue;

            nodes.links.sort(
              (a, b) => sourceCode.getRange(a)[0] - sourceCode.getRange(b)[0],
            );

            const firstLink = nodes.links[0];
            const lastLink = nodes.links[nodes.links.length - 1];
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
                    identifier = linkInfo.label.replaceAll(/[[\]]/gu, "-");
                    if (
                      definitions.some((def) => def.identifier === identifier)
                    ) {
                      let seq = 1;
                      const original = identifier;
                      identifier = `${original}-${seq}`;
                      while (
                        // eslint-disable-next-line no-loop-func -- OK
                        definitions.some((def) => def.identifier === identifier)
                      ) {
                        identifier = `${original}-${++seq}`;
                      }
                    }
                  }

                  if (firstLink !== link) {
                    // Expand the range of the fixes to avoid adding duplicate definitions
                    const firstLinkRange = sourceCode.getRange(firstLink);
                    yield fixer.insertTextBeforeRange(
                      [firstLinkRange[0], firstLinkRange[0]],
                      "",
                    );
                  }

                  yield fixer.replaceTextRange(
                    [linkInfo.bracketsRange[0], sourceCode.getRange(link)[1]],
                    `${sourceCode.text.slice(...linkInfo.bracketsRange)}${identifier === linkInfo.label ? "" : `[${identifier}]`}`,
                  );

                  if (!definition) {
                    const linkRange = sourceCode.getRange(link);
                    const nextSectionHeading = headings.find(
                      (heading) =>
                        linkRange[1] < sourceCode.getRange(heading)[0],
                    );
                    let insertIndex: number;
                    if (nextSectionHeading) {
                      const headingRange =
                        sourceCode.getRange(nextSectionHeading);
                      const headingStartLoc =
                        sourceCode.getLoc(nextSectionHeading).start;
                      insertIndex = headingRange[0] - headingStartLoc.column;
                    } else {
                      insertIndex = sourceCode.text.trimEnd().length;
                    }

                    yield fixer.insertTextAfterRange(
                      [insertIndex, insertIndex],
                      `${
                        sourceCode.text[insertIndex - 1] === "\n" ? "" : "\n"
                      }\n[${identifier}]: ${sourceCode.text
                        .slice(
                          linkInfo.urlAndTitleRange[0] + 1,
                          linkInfo.urlAndTitleRange[1] - 1,
                        )
                        .trim()}${nextSectionHeading ? "\n" : ""}`,
                    );
                  }

                  if (lastLink !== link) {
                    // Expand the range of the fixes to avoid adding duplicate definitions
                    const lastLinkRange = sourceCode.getRange(lastLink);
                    yield fixer.insertTextAfterRange(
                      [lastLinkRange[1], lastLinkRange[1]],
                      "",
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
              references: [],
              definitions: [],
            };
            map.set(title, nodes);
          }
          return nodes;
        }
      }

      return {
        link(node) {
          if (sourceCode.getText(node).startsWith("[")) {
            // Ignore <link> and url links
            links.push(node);
          }
        },
        image(node) {
          links.push(node);
        },
        "linkReference, imageReference"(node) {
          references.push(node);
        },
        definition(node) {
          definitions.push(node);
        },
        heading(node) {
          headings.push(node);
        },
        "root:exit"() {
          verify();
        },
      };

      /**
       * Get the range of the link label.
       */
      function getLinkInfo(link: Link | Image) {
        const range = sourceCode.getRange(link);
        if (link.type === "link") {
          const bracketsRange = getLinkBracketsRange(link);
          const linkBracketsText = sourceCode.text.slice(...bracketsRange);
          const linkLabelText = linkBracketsText.slice(1, -1).trim();
          const urlStartIndex = sourceCode.text.indexOf("(", bracketsRange[1]);
          return {
            label: linkLabelText,
            bracketsRange,
            urlAndTitleRange: [urlStartIndex, range[1]] as [number, number],
          };
        }
        const bracketsRange = getImageBracketsRange(link);
        const linkBracketsText = sourceCode.text.slice(...bracketsRange);
        const linkLabelText = linkBracketsText.slice(1, -1).trim();
        const urlStartIndex = sourceCode.text.indexOf("(", bracketsRange[1]);
        return {
          label: linkLabelText,
          bracketsRange,
          urlAndTitleRange: [urlStartIndex, range[1]] as [number, number],
        };
      }

      /**
       * Get the range of the link label.
       */
      function getLinkBracketsRange(link: Link): [number, number] {
        const range = sourceCode.getRange(link);
        if (link.children.length === 0) {
          const index = sourceCode.text.indexOf("]", range[0] + 1);
          return [range[0], index + 1];
        }
        const lastRange = sourceCode.getRange(
          link.children[link.children.length - 1],
        );
        const index = sourceCode.text.indexOf("]", lastRange[1]);
        return [range[0], index + 1];
      }

      /**
       * Get the range of the image label.
       */
      function getImageBracketsRange(image: Image): [number, number] {
        const range = sourceCode.getRange(image);
        const index = sourceCode.text.indexOf("]", range[0] + 2);
        return [range[0] + 1, index + 1];
      }
    },
  },
);
