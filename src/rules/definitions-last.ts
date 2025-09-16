import type {
  Blockquote,
  Definition,
  FootnoteDefinition,
  Heading,
  ListItem,
  RootContent,
} from "mdast";
import { createRule } from "../utils/index.ts";
import { getNextSibling, getPrevSibling } from "../utils/ast.ts";
import type { RuleTextEditor } from "@eslint/core";

type Options = {
  linkDefinitionPlacement?: {
    referencedFromSingleSection?: "document-last" | "section-last";
    referencedFromMultipleSections?:
      | "document-last"
      | "first-reference-section-last"
      | "last-reference-section-last";
  };
  footnoteDefinitionPlacement?: {
    referencedFromSingleSection?: "document-last" | "section-last";
    referencedFromMultipleSections?:
      | "document-last"
      | "first-reference-section-last"
      | "last-reference-section-last";
  };
};

/**
 * Parse options with defaults.
 */
function parseOptions(options: Options | undefined) {
  const linkDefinitionPlacement = {
    referencedFromSingleSection:
      options?.linkDefinitionPlacement?.referencedFromSingleSection ||
      "document-last",
    referencedFromMultipleSections:
      options?.linkDefinitionPlacement?.referencedFromMultipleSections ||
      "document-last",
  };
  const footnoteDefinitionPlacement = {
    referencedFromSingleSection:
      options?.footnoteDefinitionPlacement?.referencedFromSingleSection ||
      "document-last",
    referencedFromMultipleSections:
      options?.footnoteDefinitionPlacement?.referencedFromMultipleSections ||
      "document-last",
  };
  return { linkDefinitionPlacement, footnoteDefinitionPlacement };
}

export default createRule<[Options?]>("definitions-last", {
  meta: {
    type: "layout",
    docs: {
      description:
        "require link definitions and footnote definitions to be placed at the end of the document",
      categories: [],
      listCategory: "Notation",
    },
    fixable: "code",
    hasSuggestions: false,
    schema: [
      {
        type: "object",
        properties: {
          linkDefinitionPlacement: {
            type: "object",
            properties: {
              referencedFromSingleSection: {
                type: "string",
                enum: ["document-last", "section-last"],
              },
              referencedFromMultipleSections: {
                type: "string",
                enum: [
                  "document-last",
                  "first-reference-section-last",
                  "last-reference-section-last",
                ],
              },
            },
            additionalProperties: false,
          },
          footnoteDefinitionPlacement: {
            type: "object",
            properties: {
              referencedFromSingleSection: {
                type: "string",
                enum: ["document-last", "section-last"],
              },
              referencedFromMultipleSections: {
                type: "string",
                enum: [
                  "document-last",
                  "first-reference-section-last",
                  "last-reference-section-last",
                ],
              },
            },
            additionalProperties: false,
          },
        },
        additionalProperties: false,
      },
    ],
    messages: {
      definitionsDocumentLast:
        "Definition or footnote definition should be placed at the end of the document.",
      definitionsSectionLast:
        "Definition or footnote definition should be placed at the end of the section ({{at}}).",
      definitionsLastSectionLast:
        "Definition or footnote definition should be placed at the end of the last section (the end of the document).",
    },
  },
  create(context) {
    const sourceCode = context.sourceCode;
    const options = parseOptions(context.options[0]);

    /**
     * Determine whether a node can be placed as the last node of the document or a section.
     */
    function canBePlacedLastNode(node: RootContent) {
      return (
        node.type === "definition" ||
        node.type === "footnoteDefinition" ||
        (node.type === "html" &&
          (node.value.startsWith("<!--") ||
            node.value.startsWith("<script") ||
            node.value.startsWith("<style")))
      );
    }

    const beforeLastNode = sourceCode.ast.children.findLast(
      (node) => !canBePlacedLastNode(node),
    );
    if (!beforeLastNode) {
      return {};
    }

    type Section = {
      heading: Heading | null;
      linkReferenceIds: Set<string>;
      footnoteReferenceIds: Set<string>;
      nextHeading: Heading | null;
    };

    let lastSection: Section = {
      heading: null,
      linkReferenceIds: new Set(),
      footnoteReferenceIds: new Set(),
      nextHeading: null,
    };
    const sections: [Section, ...Section[]] = [lastSection];
    const definitions: (Definition | FootnoteDefinition)[] = [];

    /**
     * Get the expected placement of a definition or footnote definition node.
     */
    function getExpectedPlacement(node: Definition | FootnoteDefinition):
      | { type: "document-last" }
      | {
          type:
            | "section-last"
            | "first-reference-section-last"
            | "last-reference-section-last";
          section: Section;
        } {
      let referencedFromSingleSection: "document-last" | "section-last";
      let referencedFromMultipleSections:
        | "document-last"
        | "first-reference-section-last"
        | "last-reference-section-last";
      let referenceIdsNs: "linkReferenceIds" | "footnoteReferenceIds";
      if (node.type === "definition") {
        ({ referencedFromSingleSection, referencedFromMultipleSections } =
          options.linkDefinitionPlacement);
        referenceIdsNs = "linkReferenceIds";
      } else if (node.type === "footnoteDefinition") {
        ({ referencedFromSingleSection, referencedFromMultipleSections } =
          options.footnoteDefinitionPlacement);
        referenceIdsNs = "footnoteReferenceIds";
      } else {
        // Never
        return { type: "document-last" };
      }
      if (
        referencedFromSingleSection === "document-last" &&
        referencedFromSingleSection === referencedFromMultipleSections
      ) {
        return { type: "document-last" };
      }
      const referencedSections: Section[] = [];
      for (const section of sections) {
        if (!section[referenceIdsNs].has(node.identifier)) continue;
        referencedSections.push(section);
        if (
          referencedSections.length > 1 &&
          referencedFromMultipleSections !== "last-reference-section-last"
        ) {
          // If referenced from multiple sections and the expected placement is not "last-reference-section-last",
          // we can stop here.
          return {
            type: referencedFromMultipleSections,
            section: referencedSections[0],
          };
        }
      }
      if (referencedSections.length === 0) {
        // If not referenced, treat as document-last
        return { type: "document-last" };
      }
      if (referencedSections.length === 1) {
        return {
          type: referencedFromSingleSection,
          section: referencedSections[0],
        };
      }
      return {
        type: referencedFromMultipleSections,
        section: referencedSections[referencedSections.length - 1],
      };
    }

    /**
     * Verify the position of a definition or footnote definition node.
     */
    function verifyDefinitionPosition(node: Definition | FootnoteDefinition) {
      const expectedPlacement = getExpectedPlacement(node);
      if (expectedPlacement.type === "document-last") {
        verifyDefinitionOnDocumentLast(node, "definitionsDocumentLast");
      } else if (
        expectedPlacement.type === "section-last" ||
        expectedPlacement.type === "first-reference-section-last" ||
        expectedPlacement.type === "last-reference-section-last"
      ) {
        if (!expectedPlacement.section.nextHeading) {
          // The last section can be treated as document-last
          verifyDefinitionOnDocumentLast(node, "definitionsLastSectionLast");
        } else {
          verifyDefinitionOnSectionLast(
            node,
            expectedPlacement.section.nextHeading,
          );
        }
      }
    }

    /**
     * Verify that a definition or footnote definition node is at the end of the document.
     */
    function verifyDefinitionOnDocumentLast(
      node: Definition | FootnoteDefinition,
      messageId: "definitionsDocumentLast" | "definitionsLastSectionLast",
    ) {
      if (!beforeLastNode) return;
      const range = sourceCode.getRange(node);
      const beforeLastNodeRange = sourceCode.getRange(beforeLastNode);
      if (beforeLastNodeRange[1] <= range[0]) return;

      context.report({
        node,
        messageId,
        fix(fixer) {
          return fixToMoveFromBeforeLastOfSectionToLastOfSection(
            fixer,
            beforeLastNode,
            node,
          );
        },
      });
    }

    /**
     * Verify that a definition or footnote definition node is at the end of its section.
     */
    function verifyDefinitionOnSectionLast(
      node: Definition | FootnoteDefinition,
      nextSectionHeading: Heading,
    ) {
      const beforeLastOfSectionNode =
        getSectionBeforeLastNode(nextSectionHeading);
      if (!beforeLastOfSectionNode) return;
      const range = sourceCode.getRange(node);

      const beforeLastOfSectionRange = sourceCode.getRange(
        beforeLastOfSectionNode,
      );
      const nextSectionHeadingRange = sourceCode.getRange(nextSectionHeading);
      if (
        beforeLastOfSectionRange[1] <= range[0] &&
        range[1] <= nextSectionHeadingRange[0]
      )
        return;

      const expectedStartLine =
        sourceCode.getLoc(beforeLastOfSectionNode).end.line + 1;
      const expectedEndLine =
        sourceCode.getLoc(nextSectionHeading).start.line - 1;

      context.report({
        node,
        messageId: "definitionsSectionLast",
        data: {
          at:
            expectedStartLine === expectedEndLine
              ? `L${expectedStartLine}`
              : `between L${expectedStartLine} and L${expectedEndLine}`,
        },
        fix(fixer) {
          if (range[0] < beforeLastOfSectionRange[1]) {
            // Move from before the last of the section to after the last of the section
            return fixToMoveFromBeforeLastOfSectionToLastOfSection(
              fixer,
              beforeLastOfSectionNode,
              node,
            );
          }
          // Move from after the next section heading to before the next section heading
          return fixToMoveFromAfterLastOfSectionToLastOfSection(
            fixer,
            nextSectionHeading,
            node,
          );
        },
      });
    }

    /**
     * Get the node before the last node of a section.
     */
    function getSectionBeforeLastNode(
      nextSectionHeading: Heading,
    ): RootContent | undefined | null {
      let candidate = getPrevSibling(sourceCode, nextSectionHeading);
      while (candidate && canBePlacedLastNode(candidate)) {
        candidate = getPrevSibling(sourceCode, candidate);
      }
      return candidate;
    }

    /**
     * Fixer to move a definition or footnote definition node from before the last of the document/section
     * to the last of the document/section.
     */
    function fixToMoveFromBeforeLastOfSectionToLastOfSection(
      fixer: RuleTextEditor,
      prev: RootContent,
      node: Definition | FootnoteDefinition,
    ) {
      const next = getNextSibling(sourceCode, prev);
      return fixToMove(fixer, prev, next, node);
    }

    /**
     * Fixer to move a definition or footnote definition node from after the last of the document/section
     * to the last of the document/section.
     */
    function fixToMoveFromAfterLastOfSectionToLastOfSection(
      fixer: RuleTextEditor,
      next: Heading,
      node: Definition | FootnoteDefinition,
    ) {
      const prev = getPrevSibling(sourceCode, next);
      if (!prev) return null;
      return fixToMove(fixer, prev, next, node);
    }

    /**
     * Fixer to move a definition or footnote definition node to after the prev node.
     */
    function* fixToMove(
      fixer: RuleTextEditor,
      prev: RootContent,
      next: RootContent | null,
      node: Definition | FootnoteDefinition,
    ) {
      const range = sourceCode.getRange(node);
      const loc = sourceCode.getLoc(node);
      const lineStart = range[0] - loc.start.column + 1;
      let rangeStart = lineStart;
      let lineFeeds = 0;
      for (let index = rangeStart - 1; index >= 0; index--) {
        const c = sourceCode.text[index];
        if (c.trim()) {
          break;
        }
        rangeStart = index;
        if (c === "\n") {
          lineFeeds++;
        }
      }
      yield fixer.removeRange([rangeStart, range[1]]);
      // Remove blockquote quoting ">" from the definition or footnote definition
      const startColumnOffset = loc.start.column - 1;
      const insertLines = sourceCode.lines
        .slice(loc.start.line - 1, loc.end.line)
        .map((lineText, i, arr) => {
          if (i === arr.length - 1) {
            return lineText.slice(startColumnOffset, loc.end.column - 1);
          }
          return lineText.slice(startColumnOffset);
        });
      let insertText =
        sourceCode.text.slice(rangeStart, lineStart) +
        insertLines.join(/\r?\n/u.exec(sourceCode.text)?.[0] ?? "\n");

      if (
        prev.type === "footnoteDefinition" &&
        node.type !== "footnoteDefinition" &&
        lineFeeds <= 1
      ) {
        // If moving after a footnote definition and there is no blank line in the removed part, add a line feed.
        insertText = `\n${insertText}`;
      }
      if (
        next &&
        node.type === "footnoteDefinition" &&
        next.type !== "footnoteDefinition"
      ) {
        const prevLoc = sourceCode.getLoc(prev);
        const nextLoc = sourceCode.getLoc(next);
        const hasBlankLine = prevLoc.end.line + 1 < nextLoc.start.line;
        if (!hasBlankLine) {
          // If there is no blank line after the inserted part, add a line feed.
          insertText = `${insertText}\n`;
        }
      }
      yield fixer.insertTextAfter(prev, insertText);
    }

    type ContainerNode = Blockquote | ListItem | FootnoteDefinition;
    const containerStack: ContainerNode[] = [];
    return {
      "blockquote, listItem, footnoteDefinition"(node: ContainerNode) {
        containerStack.push(node);
      },
      "blockquote, listItem, footnoteDefinition:exit"() {
        containerStack.pop();
      },
      heading(node) {
        if (containerStack.length > 0) {
          // Ignore headings in containers
          return;
        }
        lastSection.nextHeading = node;
        lastSection = {
          heading: node,
          linkReferenceIds: new Set(),
          footnoteReferenceIds: new Set(),
          nextHeading: null,
        };
        sections.push(lastSection);
      },
      linkReference(node) {
        lastSection.linkReferenceIds.add(node.identifier);
      },
      imageReference(node) {
        lastSection.linkReferenceIds.add(node.identifier);
      },
      footnoteReference(node) {
        lastSection.footnoteReferenceIds.add(node.identifier);
      },
      "definition, footnoteDefinition"(node: Definition | FootnoteDefinition) {
        definitions.push(node);
      },
      "root:exit"() {
        for (const node of definitions) {
          verifyDefinitionPosition(node);
        }
      },
    };
  },
});
