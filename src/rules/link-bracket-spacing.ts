import type {
  Definition,
  Image,
  ImageReference,
  Link,
  LinkReference,
  PhrasingContent,
} from "../language/ast-types.ts";
import { getLinkKind, getSourceLocationFromRange } from "../utils/ast.ts";
import { createRule } from "../utils/index.ts";
import { parseInlineLink } from "../utils/link.ts";
import { isWhitespace } from "../utils/unicode.ts";
import { parseLinkReference } from "../utils/link-reference.ts";
import { parseImage } from "../utils/image.ts";
import { parseImageReference } from "../utils/image-reference.ts";
import { parseLinkDefinition } from "../utils/link-definition.ts";

type Options = {
  space?: "always" | "never";
  imagesInLinks?: boolean;
};

/**
 * The basic option for links and images.
 */
function parseOptions(option?: Options) {
  const space = option?.space ?? "never";
  const imagesInLinks = option?.imagesInLinks;
  return {
    space,
    spaceForText: getOptionForText,
  };

  /**
   * Get the spacing option for the given node.
   */
  function getOptionForText(node: Link | LinkReference) {
    if (imagesInLinks != null) {
      // Trim the whitespace-only children from both ends.
      const children = [...node.children];
      let child: PhrasingContent;
      while (
        children.length &&
        (child = children[0]) &&
        child.type === "text" &&
        isWhitespace(child.value)
      ) {
        children.shift();
      }
      while (
        children.length &&
        (child = children[children.length - 1]) &&
        child.type === "text" &&
        isWhitespace(child.value)
      ) {
        children.pop();
      }

      // If the link has only one child and it is an image or image reference, use the exception option.
      const loneChild = children.length === 1 ? children[0] : null;
      if (loneChild?.type === "image" || loneChild?.type === "imageReference") {
        return imagesInLinks ? "always" : "never";
      }
    }
    if (
      node.children.length === 0 ||
      (node.children.length === 1 &&
        node.children[0]?.type === "text" &&
        isWhitespace(node.children[0].value))
    ) {
      // Ignore empty label or label with only whitespace
      return "ignore";
    }
    return space;
  }
}

export default createRule<[Options?]>("link-bracket-spacing", {
  meta: {
    type: "layout",
    docs: {
      description: "enforce consistent spacing inside link brackets",
      categories: ["standard"],
      listCategory: "Whitespace",
    },
    fixable: "whitespace",
    hasSuggestions: false,
    schema: [
      {
        type: "object",
        properties: {
          space: {
            enum: ["always", "never"],
          },
          imagesInLinks: {
            type: "boolean",
          },
        },
        additionalProperties: false,
      },
    ],
    messages: {
      unexpectedSpaceAfterOpeningBracket:
        "Unexpected space after opening bracket.",
      expectedSpaceAfterOpeningBracket: "Expected space after opening bracket.",
      unexpectedSpaceBeforeClosingBracket:
        "Unexpected space before closing bracket.",
      expectedSpaceBeforeClosingBracket:
        "Expected space before closing bracket.",
    },
  },
  create(context) {
    const sourceCode = context.sourceCode;
    const options = parseOptions(context.options[0]);

    /**
     * Verify the space after the opening bracket and before the closing bracket.
     */
    function verifySpaceAfterOpeningBracket(
      node: Link | LinkReference | Image | ImageReference | Definition,
      openingBracketIndex: number,
      spaceOption: "always" | "never",
    ) {
      const space = getSpaceAfterOpeningBracket(openingBracketIndex);
      if (space.includes("\n")) return;
      if (spaceOption === "always") {
        if (space.length > 0) return;
        context.report({
          node,
          loc: getSourceLocationFromRange(sourceCode, node, [
            openingBracketIndex,
            openingBracketIndex + 1,
          ]),
          messageId: "expectedSpaceAfterOpeningBracket",
          fix: (fixer) =>
            fixer.insertTextAfterRange(
              [openingBracketIndex, openingBracketIndex + 1],
              " ",
            ),
        });
      } else if (spaceOption === "never") {
        if (space.length === 0) return;
        context.report({
          node,
          loc: getSourceLocationFromRange(sourceCode, node, [
            openingBracketIndex + 1,
            openingBracketIndex + 1 + space.length,
          ]),
          messageId: "unexpectedSpaceAfterOpeningBracket",
          fix: (fixer) =>
            fixer.removeRange([
              openingBracketIndex + 1,
              openingBracketIndex + 1 + space.length,
            ]),
        });
      }
    }

    /**
     * Verify the space before the closing bracket.
     */
    function verifySpaceBeforeClosingBracket(
      node: Link | LinkReference | Image | ImageReference | Definition,
      openingBracketIndex: number,
      closingBracketIndex: number,
      spaceOption: "always" | "never",
    ) {
      const space = getSpaceBeforeClosingBracket(closingBracketIndex);
      if (openingBracketIndex + 1 === closingBracketIndex - space.length) {
        // It space is already checked by `verifySpaceAfterOpeningBracket()`.
        return;
      }
      if (space.includes("\n")) return;
      if (spaceOption === "always") {
        if (space.length > 0) return;
        context.report({
          node,
          loc: getSourceLocationFromRange(sourceCode, node, [
            closingBracketIndex,
            closingBracketIndex + 1,
          ]),
          messageId: "expectedSpaceBeforeClosingBracket",
          fix: (fixer) =>
            fixer.insertTextBeforeRange(
              [closingBracketIndex, closingBracketIndex + 1],
              " ",
            ),
        });
      } else if (spaceOption === "never") {
        if (space.length === 0) return;
        context.report({
          node,
          loc: getSourceLocationFromRange(sourceCode, node, [
            closingBracketIndex - space.length,
            closingBracketIndex,
          ]),
          messageId: "unexpectedSpaceBeforeClosingBracket",
          fix: (fixer) =>
            fixer.removeRange([
              closingBracketIndex - space.length,
              closingBracketIndex,
            ]),
        });
      }
    }

    return {
      link(node) {
        const kind = getLinkKind(sourceCode, node);
        if (kind !== "inline") return;
        const parsed = parseInlineLink(sourceCode, node);
        if (!parsed) return;
        const spaceForText = options.spaceForText(node);
        if (spaceForText === "ignore") return;
        verifySpaceAfterOpeningBracket(
          node,
          parsed.text.range[0],
          spaceForText,
        );
        verifySpaceBeforeClosingBracket(
          node,
          parsed.text.range[0],
          parsed.text.range[1] - 1,
          spaceForText,
        );
      },
      linkReference(node) {
        const parsed = parseLinkReference(sourceCode, node);
        if (!parsed) return;
        const spaceForText = options.spaceForText(node);
        if (spaceForText !== "ignore") {
          // Allow `[^foo ]` and `[ ^foo]` for footnotes
          // because it is common to write `[ ^1]` and `[^1 ]`.
          // So, skip checking the space after `[` if the label starts with `^`.
          // Also, skip checking the space before `]` if the label starts with `^`.
          if (
            spaceForText !== "never" ||
            !sourceCode.text
              .slice(parsed.text.range[0] + 1, parsed.text.range[1] - 1)
              .trimStart()
              .startsWith("^")
          ) {
            verifySpaceAfterOpeningBracket(
              node,
              parsed.text.range[0],
              spaceForText,
            );
            verifySpaceBeforeClosingBracket(
              node,
              parsed.text.range[0],
              parsed.text.range[1] - 1,
              spaceForText,
            );
          }
        }
        if (parsed.label?.type === "full") {
          verifySpaceAfterOpeningBracket(
            node,
            parsed.label.range[0],
            options.space,
          );
          verifySpaceBeforeClosingBracket(
            node,
            parsed.label.range[0],
            parsed.label.range[1] - 1,
            options.space,
          );
        }
      },
      image(node) {
        const parsed = parseImage(sourceCode, node);
        if (!parsed) return;
        verifySpaceAfterOpeningBracket(
          node,
          parsed.text.range[0],
          options.space,
        );
        verifySpaceBeforeClosingBracket(
          node,
          parsed.text.range[0],
          parsed.text.range[1] - 1,
          options.space,
        );
      },
      imageReference(node) {
        const parsed = parseImageReference(sourceCode, node);
        if (!parsed) return;
        verifySpaceAfterOpeningBracket(
          node,
          parsed.text.range[0],
          options.space,
        );
        verifySpaceBeforeClosingBracket(
          node,
          parsed.text.range[0],
          parsed.text.range[1] - 1,
          options.space,
        );
        if (parsed.label?.type === "full") {
          verifySpaceAfterOpeningBracket(
            node,
            parsed.label.range[0],
            options.space,
          );
          verifySpaceBeforeClosingBracket(
            node,
            parsed.label.range[0],
            parsed.label.range[1] - 1,
            options.space,
          );
        }
      },
      definition(node) {
        const parsed = parseLinkDefinition(sourceCode, node);
        if (!parsed) return;

        // Allow `[^foo ]` and `[ ^foo]` for footnotes
        // because it is common to write `[ ^1]` and `[^1 ]`.
        // So, skip checking the space after `[` if the label starts with `^`.
        // Also, skip checking the space before `]` if the label starts with `^`.
        if (
          options.space !== "never" ||
          !sourceCode.text
            .slice(parsed.label.range[0] + 1, parsed.label.range[1] - 1)
            .trimStart()
            .startsWith("^")
        ) {
          verifySpaceAfterOpeningBracket(
            node,
            parsed.label.range[0],
            options.space,
          );
          verifySpaceBeforeClosingBracket(
            node,
            parsed.label.range[0],
            parsed.label.range[1] - 1,
            options.space,
          );
        }
      },
    };

    /**
     * Get the spaces after the opening bracket.
     */
    function getSpaceAfterOpeningBracket(openingBracketIndex: number) {
      for (let i = openingBracketIndex + 1; i < sourceCode.text.length; i++) {
        const char = sourceCode.text[i];
        if (isWhitespace(char)) {
          continue;
        }
        return sourceCode.text.slice(openingBracketIndex + 1, i);
      }
      return sourceCode.text.slice(openingBracketIndex + 1);
    }

    /**
     * Get the spaces before the closing bracket.
     */
    function getSpaceBeforeClosingBracket(closingBracketIndex: number) {
      for (let i = closingBracketIndex - 1; i >= 0; i--) {
        const char = sourceCode.text[i];
        if (isWhitespace(char)) {
          continue;
        }
        return sourceCode.text.slice(i + 1, closingBracketIndex);
      }
      return sourceCode.text.slice(0, closingBracketIndex);
    }
  },
});
