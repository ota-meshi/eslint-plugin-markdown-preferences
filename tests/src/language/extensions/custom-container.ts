import assert from "assert";
import { parseExtendedMarkdown } from "../../../../src/language/parser.ts";
import type {
  Blockquote,
  CustomContainer,
  Paragraph,
} from "../../../../src/language/ast-types.ts";

describe("parseExtendedMarkdown with Custom Container", () => {
  it("should parse custom containers", () => {
    const code = `::: warning
This is a warning message.
:::`;
    const ast = parseExtendedMarkdown(code);

    assert.strictEqual(ast.type, "root");

    assert.strictEqual(ast.children.length, 1);
    const container = ast.children[0] as unknown as CustomContainer;
    assert.strictEqual(container.type, "customContainer");
    assert.strictEqual(container.children.length, 1);
    assert.strictEqual(container.children[0].type, "paragraph");
  });

  it("should parse custom containers with info and meta", () => {
    const code = `::: info "Custom Title"
Some information content.
:::`;
    const ast = parseExtendedMarkdown(code);

    assert.strictEqual(ast.type, "root");

    assert.strictEqual(ast.children.length, 1);
    const container = ast.children[0] as CustomContainer;
    assert.strictEqual(container.type, "customContainer");
    assert.strictEqual(container.info, 'info "Custom Title"');
  });

  it("should parse nested custom containers with same fence lengths", () => {
    const code = `::: outer
Outer content.

::: inner
Inner content.
:::

Outside content.
:::`;
    const ast = parseExtendedMarkdown(code);

    assert.strictEqual(ast.type, "root");

    assert.strictEqual(ast.children.length, 2);
    const outerContainer = ast.children[0] as CustomContainer;
    assert.strictEqual(outerContainer.type, "customContainer");
    assert.strictEqual(outerContainer.children.length, 2);
    assert.strictEqual(outerContainer.children[0].type, "paragraph");
    assert.deepStrictEqual(
      outerContainer.children[0].children
        .map((c) => (c.type === "text" ? c.value : "?"))
        .join(""),
      "Outer content.",
    );
    assert.strictEqual(outerContainer.children[1].type, "customContainer");
    const innerContainer = outerContainer.children[1];
    assert.strictEqual(innerContainer.children.length, 1);
    assert.strictEqual(innerContainer.children[0].type, "paragraph");
    assert.deepStrictEqual(
      innerContainer.children[0].children
        .map((c) => (c.type === "text" ? c.value : "?"))
        .join(""),
      "Inner content.",
    );
    const paragraph = ast.children[1] as Paragraph;
    assert.strictEqual(paragraph.type, "paragraph");
    assert.deepStrictEqual(
      paragraph.children
        .map((c) => (c.type === "text" ? c.value : "?"))
        .join(""),
      "Outside content.\n:::",
    );
  });

  it("should parse nested custom containers with different fence lengths", () => {
    const code = `:::: outer
Outer content.

::: inner
Inner content.
:::

More outer content.
::::`;
    const ast = parseExtendedMarkdown(code);

    assert.strictEqual(ast.type, "root");

    assert.strictEqual(ast.children.length, 1);
    const outerContainer = ast.children[0] as CustomContainer;
    assert.strictEqual(outerContainer.type, "customContainer");
    assert.strictEqual(outerContainer.children.length, 3);
    assert.strictEqual(outerContainer.children[0].type, "paragraph");
    assert.deepStrictEqual(
      outerContainer.children[0].children
        .map((c) => (c.type === "text" ? c.value : "?"))
        .join(""),
      "Outer content.",
    );
    assert.strictEqual(outerContainer.children[1].type, "customContainer");
    const innerContainer = outerContainer.children[1];
    assert.strictEqual(innerContainer.children.length, 1);
    assert.strictEqual(innerContainer.children[0].type, "paragraph");
    assert.deepStrictEqual(
      innerContainer.children[0].children
        .map((c) => (c.type === "text" ? c.value : "?"))
        .join(""),
      "Inner content.",
    );
    assert.strictEqual(outerContainer.children[2].type, "paragraph");
    assert.deepStrictEqual(
      outerContainer.children[2].children
        .map((c) => (c.type === "text" ? c.value : "?"))
        .join(""),
      "More outer content.",
    );
  });

  it("should parse custom containers with different fence lengths", () => {
    const code = `:::: container
Content with ::: in it.
::::`;
    const ast = parseExtendedMarkdown(code);

    assert.strictEqual(ast.type, "root");

    assert.strictEqual(ast.children.length, 1);
    const container = ast.children[0] as CustomContainer;
    assert.strictEqual(container.type, "customContainer");
    assert.strictEqual(container.children.length, 1);
    assert.strictEqual(container.children[0].type, "paragraph");
    assert.deepStrictEqual(
      container.children[0].children
        .map((c) => (c.type === "text" ? c.value : "?"))
        .join(""),
      "Content with ::: in it.",
    );
  });

  it("should parse custom containers with same fence lengths", () => {
    const code = `::: container
Content with ::: in it.
:::`;
    const ast = parseExtendedMarkdown(code);

    assert.strictEqual(ast.type, "root");

    assert.strictEqual(ast.children.length, 1);
    const container = ast.children[0] as CustomContainer;
    assert.strictEqual(container.type, "customContainer");
    assert.strictEqual(container.children.length, 1);
    assert.strictEqual(container.children[0].type, "paragraph");
    assert.deepStrictEqual(
      container.children[0].children
        .map((c) => (c.type === "text" ? c.value : "?"))
        .join(""),
      "Content with ::: in it.",
    );
  });

  it("should parse custom containers with multiple paragraphs", () => {
    const code = `::: note
First paragraph in the container.

Second paragraph in the container.

Third paragraph in the container.
:::`;
    const ast = parseExtendedMarkdown(code);

    assert.strictEqual(ast.type, "root");

    assert.strictEqual(ast.children.length, 1);
    const container = ast.children[0] as CustomContainer;
    assert.strictEqual(container.type, "customContainer");
    assert.strictEqual(container.children.length, 3);
    assert.strictEqual(container.children[0].type, "paragraph");
    assert.strictEqual(container.children[1].type, "paragraph");
    assert.strictEqual(container.children[2].type, "paragraph");
  });

  it("should parse custom containers with mixed content", () => {
    const code = `::: details Summary
# Heading in container

Some text with **bold** and *italic*.

- List item 1
- List item 2

\`\`\`javascript
console.log('code in container');
\`\`\`
:::`;
    const ast = parseExtendedMarkdown(code);

    assert.strictEqual(ast.type, "root");

    assert.strictEqual(ast.children.length, 1);
    const container = ast.children[0] as CustomContainer;
    assert.strictEqual(container.type, "customContainer");
    assert(container.children.length > 1);
    assert(container.children.some((child) => child.type === "heading"));
    assert(container.children.some((child) => child.type === "list"));
    assert(container.children.some((child) => child.type === "code"));
  });

  it("should handle malformed custom containers gracefully", () => {
    // Test unclosed container
    const code1 = `::: warning
This container is not closed.`;
    const ast1 = parseExtendedMarkdown(code1);

    // Should not throw and should parse as regular content or container
    assert.strictEqual(ast1.type, "root");
    assert.strictEqual(ast1.children.length, 1);
    const container1 = ast1.children[0] as unknown as CustomContainer;
    assert.strictEqual(container1.type, "customContainer");
    assert.strictEqual(container1.children.length, 1);
    assert.strictEqual(container1.children[0].type, "paragraph");

    // Test container with mismatched fence lengths
    const code2 = `::: info
Content
::::`;
    const ast2 = parseExtendedMarkdown(code2);

    assert.strictEqual(ast2.type, "root");
    assert.strictEqual(ast2.children.length, 1);
    const container2 = ast2.children[0] as unknown as CustomContainer;
    assert.strictEqual(container2.type, "customContainer");
    assert.strictEqual(container2.children.length, 1);
    assert.strictEqual(container2.children[0].type, "paragraph");
  });

  it("should preserve container info and meta attributes", () => {
    const code = `::: tip "Pro Tip" {.custom-class}
This is a helpful tip.
:::`;
    const ast = parseExtendedMarkdown(code);

    assert.strictEqual(ast.children.length, 1);

    const container = ast.children[0] as CustomContainer;
    assert.strictEqual(container.type, "customContainer");
    assert.strictEqual(container.info, 'tip "Pro Tip" {.custom-class}');
  });

  it("should parse empty custom containers", () => {
    const code = `::: empty
:::`;
    const ast = parseExtendedMarkdown(code);

    assert.strictEqual(ast.type, "root");

    assert.strictEqual(ast.children.length, 1);
    const container = ast.children[0] as CustomContainer;
    assert.strictEqual(container.type, "customContainer");
    assert.strictEqual(container.children.length, 0);
  });

  it("should parse custom containers with blockquote and outside closing marker like", () => {
    const code = `
> ::: warning Note
> This is a warning inside a blockquote.

This is outside the blockquote.
:::`;
    const ast = parseExtendedMarkdown(code);

    assert.strictEqual(ast.type, "root");

    assert.strictEqual(ast.children.length, 2);
    const block = ast.children[0] as Blockquote;
    assert.strictEqual(block.type, "blockquote");
    assert.strictEqual(block.children.length, 1);
    const container = block.children[0] as CustomContainer;
    assert.strictEqual(container.type, "customContainer");
    assert.strictEqual(container.info, "warning Note");
    assert.strictEqual(container.children.length, 1);
    assert.strictEqual(container.children[0].type, "paragraph");
    assert.deepStrictEqual(
      container.children[0].children
        .map((c) => (c.type === "text" ? c.value : "?"))
        .join(""),
      "This is a warning inside a blockquote.",
    );
    const paragraph = ast.children[1] as Paragraph;
    assert.strictEqual(paragraph.type, "paragraph");
    assert.strictEqual(paragraph.children.length, 1);
    assert.deepStrictEqual(
      paragraph.children
        .map((c) => (c.type === "text" ? c.value : "?"))
        .join(""),
      "This is outside the blockquote.\n:::",
    );
  });

  it("should parse custom containers without corresponding closing markers", () => {
    const code = `
:::: first
A
::: second
B
::::
C
:::`;
    const ast = parseExtendedMarkdown(code);

    assert.strictEqual(ast.type, "root");

    assert.strictEqual(ast.children.length, 2);
    const container = ast.children[0] as CustomContainer;
    assert.strictEqual(container.type, "customContainer");
    assert.strictEqual(container.info, "first");
    assert.strictEqual(container.children.length, 2);
    assert.strictEqual(container.children[0].type, "paragraph");
    assert.deepStrictEqual(
      container.children[0].children
        .map((c) => (c.type === "text" ? c.value : "?"))
        .join(""),
      "A",
    );
    const childContainer = container.children[1] as CustomContainer;
    assert.strictEqual(childContainer.type, "customContainer");
    assert.strictEqual(childContainer.info, "second");
    assert.strictEqual(childContainer.children.length, 1);
    assert.strictEqual(childContainer.children[0].type, "paragraph");
    assert.deepStrictEqual(
      childContainer.children[0].children
        .map((c) => (c.type === "text" ? c.value : "?"))
        .join(""),
      "B",
    );
    const paragraph = ast.children[1] as Paragraph;
    assert.strictEqual(paragraph.type, "paragraph");
    assert.strictEqual(paragraph.children.length, 1);
    assert.deepStrictEqual(
      paragraph.children
        .map((c) => (c.type === "text" ? c.value : "?"))
        .join(""),
      "C\n:::",
    );
  });

  it("should not parse containers with insufficient colons", () => {
    // Test with less than 3 colons - this should be treated as regular text
    const code = `:: warning
This should not be a container.
::`;
    const ast = parseExtendedMarkdown(code);

    assert.strictEqual(ast.type, "root");
    assert.strictEqual(ast.children.length, 1);

    // Should be parsed as a paragraph, not a custom container
    const paragraph = ast.children[0] as Paragraph;
    assert.strictEqual(paragraph.type, "paragraph");
    assert.strictEqual(paragraph.children.length, 1);
    assert.strictEqual(paragraph.children[0].type, "text");
  });

  it("should handle single colon as regular text", () => {
    // Test with single colon
    const code = `: note
This is just text.`;
    const ast = parseExtendedMarkdown(code);

    assert.strictEqual(ast.type, "root");
    assert.strictEqual(ast.children.length, 1);

    // Should be parsed as a paragraph
    const paragraph = ast.children[0] as Paragraph;
    assert.strictEqual(paragraph.type, "paragraph");
  });

  it("should handle incomplete container closing with insufficient colons", () => {
    // Test case where container is opened but attempted to close with < 3 colons
    const code = `::: warning
This is a warning.
::
More content after incomplete close.`;
    const ast = parseExtendedMarkdown(code);

    assert.strictEqual(ast.type, "root");
    assert.strictEqual(ast.children.length, 1);

    // Should be parsed as a single custom container because :: is insufficient to close
    const container = ast.children[0] as CustomContainer;
    assert.strictEqual(container.type, "customContainer");

    // The container should contain the warning text and the attempted close sequence as content
    assert.ok(container.children.length >= 1);

    // Verify that :: was not recognized as a closing marker by checking the content
    const contentText = container.children
      .map((child) => {
        if (child.type === "paragraph") {
          return child.children.map((c) => (c as any).value || "").join("");
        }
        return "";
      })
      .join("\n");

    assert.ok(
      contentText.includes("::") || contentText.includes("More content"),
    );
  });

  it("should handle attempted container closing with single colon", () => {
    // Test case where container closing is attempted with only one colon
    const code = `::: info
Content here.
:
Still inside container.`;
    const ast = parseExtendedMarkdown(code);

    assert.strictEqual(ast.type, "root");
    assert.strictEqual(ast.children.length, 1);

    // Should remain as a custom container since : is insufficient to close
    const container = ast.children[0] as CustomContainer;
    assert.strictEqual(container.type, "customContainer");
  });
});
