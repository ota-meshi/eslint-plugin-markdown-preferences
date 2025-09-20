import assert from "assert";
import { parseExtendedMarkdown } from "../../../src/language/parser.ts";
import type {
  Heading,
  Code,
  List,
  Blockquote,
  Yaml,
  CustomContainer,
} from "../../../src/language/ast-types.ts";

describe("parseExtendedMarkdown", () => {
  it("should parse basic markdown", () => {
    const code = "# Hello World\n\nThis is a paragraph.";
    const ast = parseExtendedMarkdown(code);

    assert.strictEqual(ast.type, "root");
    assert.strictEqual(ast.children.length, 2);

    const heading = ast.children[0] as Heading;
    assert.strictEqual(heading.type, "heading");
    assert.strictEqual(heading.depth, 1);
    assert.strictEqual(heading.children.length, 1);
    assert.strictEqual(heading.children[0].type, "text");
    assert.strictEqual((heading.children[0] as any).value, "Hello World");

    const paragraph = ast.children[1];
    assert.strictEqual(paragraph.type, "paragraph");
  });

  it("should parse code blocks", () => {
    const code = "```javascript\nconsole.log('hello');\n```";
    const ast = parseExtendedMarkdown(code);

    assert.strictEqual(ast.children.length, 1);
    const codeBlock = ast.children[0] as Code;
    assert.strictEqual(codeBlock.type, "code");
    assert.strictEqual(codeBlock.lang, "javascript");
    assert.strictEqual(codeBlock.value, "console.log('hello');");
  });

  it("should parse GFM tables", () => {
    const code = `| Name | Age |
|------|-----|
| John | 25  |
| Jane | 30  |`;
    const ast = parseExtendedMarkdown(code);

    assert.strictEqual(ast.children.length, 1);
    const table = ast.children[0];
    assert.strictEqual(table.type, "table");
    assert.strictEqual((table as any).children.length, 3); // header + 2 rows
  });

  it("should parse GFM strikethrough", () => {
    const code = "This is ~~deleted~~ text.";
    const ast = parseExtendedMarkdown(code);

    const paragraph = ast.children[0];
    assert.strictEqual(paragraph.type, "paragraph");
    assert.strictEqual((paragraph as any).children.length, 3);
    assert.strictEqual((paragraph as any).children[1].type, "delete");
  });

  it("should parse task lists", () => {
    const code = `- [x] Completed task
- [ ] Incomplete task`;
    const ast = parseExtendedMarkdown(code);

    const list = ast.children[0] as List;
    assert.strictEqual(list.type, "list");
    assert.strictEqual(list.children.length, 2);

    const firstItem = list.children[0];
    const secondItem = list.children[1];
    assert.strictEqual((firstItem as any).checked, true);
    assert.strictEqual((secondItem as any).checked, false);
  });

  it("should parse YAML frontmatter", () => {
    const code = `---
title: Test Page
author: John Doe
---

# Content`;
    const ast = parseExtendedMarkdown(code);

    assert.strictEqual(ast.children.length, 2);
    const frontmatter = ast.children[0] as Yaml;
    assert.strictEqual(frontmatter.type, "yaml");
    assert.strictEqual(frontmatter.value, "title: Test Page\nauthor: John Doe");

    const heading = ast.children[1] as Heading;
    assert.strictEqual(heading.type, "heading");
  });

  it("should parse TOML frontmatter", () => {
    const code = `+++
title = "Test Page"
author = "John Doe"
+++

# Content`;
    const ast = parseExtendedMarkdown(code);

    assert.strictEqual(ast.children.length, 2);
    const frontmatter = ast.children[0];
    assert.strictEqual(frontmatter.type, "toml");
    assert.strictEqual(
      (frontmatter as any).value,
      'title = "Test Page"\nauthor = "John Doe"',
    );
  });

  it("should parse blockquotes", () => {
    const code = "> This is a blockquote\n> with multiple lines";
    const ast = parseExtendedMarkdown(code);

    const blockquote = ast.children[0] as Blockquote;
    assert.strictEqual(blockquote.type, "blockquote");
    assert.strictEqual(blockquote.children.length, 1);
    assert.strictEqual(blockquote.children[0].type, "paragraph");
  });

  it("should parse nested lists", () => {
    const code = `1. First item
   - Nested item
   - Another nested item
2. Second item`;
    const ast = parseExtendedMarkdown(code);

    const list = ast.children[0] as List;
    assert.strictEqual(list.type, "list");
    assert.strictEqual(list.ordered, true);
    assert.strictEqual(list.children.length, 2);

    const firstItem = list.children[0];
    assert.strictEqual((firstItem as any).children.length, 2); // paragraph + nested list
  });

  it("should parse links and images", () => {
    const code =
      "This is a [link](https://example.com) and an ![image](image.png).";
    const ast = parseExtendedMarkdown(code);

    const paragraph = ast.children[0];
    assert.strictEqual(paragraph.type, "paragraph");
    const children = (paragraph as any).children;

    // Find link and image nodes
    const link = children.find((child: any) => child.type === "link");
    const image = children.find((child: any) => child.type === "image");

    assert.strictEqual(link.url, "https://example.com");
    assert.strictEqual(image.url, "image.png");
  });

  it("should parse inline code", () => {
    const code = "This has `inline code` in it.";
    const ast = parseExtendedMarkdown(code);

    const paragraph = ast.children[0];
    const children = (paragraph as any).children;

    const inlineCode = children.find(
      (child: any) => child.type === "inlineCode",
    );
    assert.strictEqual(inlineCode.value, "inline code");
  });

  it("should parse emphasis and strong", () => {
    const code = "This is *emphasized* and **strong** text.";
    const ast = parseExtendedMarkdown(code);

    const paragraph = ast.children[0];
    const children = (paragraph as any).children;

    const emphasis = children.find((child: any) => child.type === "emphasis");
    const strong = children.find((child: any) => child.type === "strong");

    assert.strictEqual(emphasis.children[0].value, "emphasized");
    assert.strictEqual(strong.children[0].value, "strong");
  });

  it("should handle empty input", () => {
    const code = "";
    const ast = parseExtendedMarkdown(code);

    assert.strictEqual(ast.type, "root");
    assert.strictEqual(ast.children.length, 0);
  });

  it("should parse multiple headings", () => {
    const code = `# Heading 1
## Heading 2
### Heading 3`;
    const ast = parseExtendedMarkdown(code);

    assert.strictEqual(ast.children.length, 3);

    const h1 = ast.children[0] as Heading;
    const h2 = ast.children[1] as Heading;
    const h3 = ast.children[2] as Heading;

    assert.strictEqual(h1.depth, 1);
    assert.strictEqual(h2.depth, 2);
    assert.strictEqual(h3.depth, 3);
  });

  it("should parse horizontal rules", () => {
    const code = "Before\n\n---\n\nAfter";
    const ast = parseExtendedMarkdown(code);

    assert.strictEqual(ast.children.length, 3);
    assert.strictEqual(ast.children[0].type, "paragraph");
    assert.strictEqual(ast.children[1].type, "thematicBreak");
    assert.strictEqual(ast.children[2].type, "paragraph");
  });

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
});
