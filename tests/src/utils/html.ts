import assert from "node:assert";
import { parseHtmlFromText, parseHtml } from "../../../src/utils/html.ts";
import { parseMarkdown } from "../../utils/markdown-parser/parser.ts";
import type { Html } from "../../../src/language/ast-types.ts";

describe("utils/html", () => {
  describe("parseHtmlFromText", () => {
    describe("Open tags", () => {
      it("should parse a simple open tag", () => {
        const tokens = [...parseHtmlFromText("<div>")];
        assert.strictEqual(tokens.length, 1);
        const tag = tokens[0];
        assert.strictEqual(tag.type, "OpenTag");
        assert.strictEqual(tag.name.value, "div");
        assert.strictEqual(tag.selfClosing, false);
        assert.deepStrictEqual(tag.range, [0, 5]);
      });

      it("should parse a self-closing tag", () => {
        const tokens = [...parseHtmlFromText("<br/>")];
        assert.strictEqual(tokens.length, 1);
        const tag = tokens[0];
        assert.strictEqual(tag.type, "OpenTag");
        assert.strictEqual(tag.name.value, "br");
        assert.strictEqual(tag.selfClosing, true);
      });

      it("should parse tag with single attribute", () => {
        const tokens = [...parseHtmlFromText('<div class="container">')];
        assert.strictEqual(tokens.length, 1);
        const tag = tokens[0];
        assert.strictEqual(tag.type, "OpenTag");
        assert.strictEqual(tag.attributes.length, 1);
        assert.strictEqual(tag.attributes[0].name.value, "class");
        assert.strictEqual(tag.attributes[0].value!.value.value, "container");
        assert.strictEqual(
          tag.attributes[0].value!.value.type,
          "DoubleQuotedAttributeValueToken",
        );
      });

      it("should parse tag with multiple attributes", () => {
        const tokens = [
          ...parseHtmlFromText('<input type="text" id="name" disabled>'),
        ];
        assert.strictEqual(tokens.length, 1);
        const tag = tokens[0];
        assert.strictEqual(tag.type, "OpenTag");
        assert.strictEqual(tag.attributes.length, 3);
        assert.strictEqual(tag.attributes[0].name.value, "type");
        assert.strictEqual(tag.attributes[0].value!.value.value, "text");
        assert.strictEqual(tag.attributes[1].name.value, "id");
        assert.strictEqual(tag.attributes[1].value!.value.value, "name");
        assert.strictEqual(tag.attributes[2].name.value, "disabled");
        assert.strictEqual(tag.attributes[2].value, null);
      });

      it("should parse tag with single-quoted attribute", () => {
        const tokens = [...parseHtmlFromText("<div class='container'>")];
        assert.strictEqual(tokens.length, 1);
        const tag = tokens[0];
        assert.strictEqual(tag.type, "OpenTag");
        assert.strictEqual(
          tag.attributes[0].value!.value.type,
          "SingleQuotedAttributeValueToken",
        );
        assert.strictEqual(tag.attributes[0].value!.value.value, "container");
      });

      it("should parse tag with unquoted attribute", () => {
        const tokens = [...parseHtmlFromText("<div class=container>")];
        assert.strictEqual(tokens.length, 1);
        const tag = tokens[0];
        assert.strictEqual(tag.type, "OpenTag");
        assert.strictEqual(
          tag.attributes[0].value!.value.type,
          "UnquotedAttributeValueToken",
        );
        assert.strictEqual(tag.attributes[0].value!.value.value, "container");
      });

      it("should parse tag with attribute containing colon and underscore", () => {
        const tokens = [...parseHtmlFromText("<div _attr:name='value'>")];
        assert.strictEqual(tokens.length, 1);
        const tag = tokens[0];
        assert.strictEqual(tag.type, "OpenTag");
        assert.strictEqual(tag.attributes[0].name.value, "_attr:name");
      });

      it("should parse tag with attribute containing hyphens and dots", () => {
        const tokens = [...parseHtmlFromText("<div data-attr.name='value'>")];
        assert.strictEqual(tokens.length, 1);
        const tag = tokens[0];
        assert.strictEqual(tag.type, "OpenTag");
        assert.strictEqual(tag.attributes[0].name.value, "data-attr.name");
      });

      it("should parse tag with spaces and newlines", () => {
        const tokens = [
          ...parseHtmlFromText("<div\n  class = \n  'container'\n/>"),
        ];
        assert.strictEqual(tokens.length, 1);
        const tag = tokens[0];
        assert.strictEqual(tag.type, "OpenTag");
        assert.strictEqual(tag.selfClosing, true);
        assert.strictEqual(tag.attributes[0].name.value, "class");
        assert.strictEqual(tag.attributes[0].value!.value.value, "container");
      });

      it("should parse tag name with hyphens", () => {
        const tokens = [...parseHtmlFromText("<custom-element>")];
        assert.strictEqual(tokens.length, 1);
        const tag = tokens[0];
        assert.strictEqual(tag.type, "OpenTag");
        assert.strictEqual(tag.name.value, "custom-element");
      });

      it("should parse tag name with digits", () => {
        const tokens = [...parseHtmlFromText("<h1>")];
        assert.strictEqual(tokens.length, 1);
        const tag = tokens[0];
        assert.strictEqual(tag.type, "OpenTag");
        assert.strictEqual(tag.name.value, "h1");
      });
    });

    describe("Close tags", () => {
      it("should parse a closing tag", () => {
        const tokens = [...parseHtmlFromText("</div>")];
        assert.strictEqual(tokens.length, 1);
        const tag = tokens[0];
        assert.strictEqual(tag.type, "CloseTag");
        assert.strictEqual(tag.name.value, "div");
        assert.deepStrictEqual(tag.range, [0, 6]);
      });

      it("should parse closing tag with spaces", () => {
        const tokens = [...parseHtmlFromText("</div  \n>")];
        assert.strictEqual(tokens.length, 1);
        const tag = tokens[0];
        assert.strictEqual(tag.type, "CloseTag");
        assert.strictEqual(tag.name.value, "div");
      });
    });

    describe("Comments", () => {
      it("should parse HTML comment", () => {
        const tokens = [...parseHtmlFromText("<!-- comment -->")];
        assert.strictEqual(tokens.length, 1);
        const token = tokens[0];
        assert.strictEqual(token.type, "CommentTag");
        assert.strictEqual(token.value, " comment ");
      });

      it("should parse empty comment <!--->", () => {
        const tokens = [...parseHtmlFromText("<!--->")];
        assert.strictEqual(tokens.length, 1);
        const token = tokens[0];
        assert.strictEqual(token.type, "CommentTag");
      });

      it("should parse minimal comment <!-->", () => {
        const tokens = [...parseHtmlFromText("<!-->")];
        assert.strictEqual(tokens.length, 1);
        const token = tokens[0];
        assert.strictEqual(token.type, "CommentTag");
      });

      it("should parse multiline comment", () => {
        const tokens = [...parseHtmlFromText("<!-- line1\nline2 -->")];
        assert.strictEqual(tokens.length, 1);
        const token = tokens[0];
        assert.strictEqual(token.type, "CommentTag");
        assert.strictEqual(token.value, " line1\nline2 ");
      });
    });

    describe("Processing instructions", () => {
      it("should parse processing instruction", () => {
        const tokens = [...parseHtmlFromText("<?xml version='1.0'?>")];
        assert.strictEqual(tokens.length, 1);
        const token = tokens[0];
        assert.strictEqual(token.type, "ProcessingInstructionTag");
        assert.strictEqual(token.value, "<?xml version='1.0'?>");
      });

      it("should parse multiline processing instruction", () => {
        const tokens = [...parseHtmlFromText("<?xml\nversion='1.0'?>")];
        assert.strictEqual(tokens.length, 1);
        const token = tokens[0];
        assert.strictEqual(token.type, "ProcessingInstructionTag");
      });
    });

    describe("Declarations", () => {
      it("should parse declaration", () => {
        const tokens = [...parseHtmlFromText("<!DOCTYPE html>")];
        assert.strictEqual(tokens.length, 1);
        const token = tokens[0];
        assert.strictEqual(token.type, "DeclarationTag");
        assert.strictEqual(token.value, "<!DOCTYPE html>");
      });

      it("should parse declaration with attributes", () => {
        const tokens = [
          ...parseHtmlFromText(
            '<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0">',
          ),
        ];
        assert.strictEqual(tokens.length, 1);
        const token = tokens[0];
        assert.strictEqual(token.type, "DeclarationTag");
      });
    });

    describe("CDATA sections", () => {
      it("should parse CDATA section", () => {
        const tokens = [...parseHtmlFromText("<![CDATA[content]]>")];
        assert.strictEqual(tokens.length, 1);
        const token = tokens[0];
        assert.strictEqual(token.type, "CDATATag");
        assert.strictEqual(token.value, "<![CDATA[content]]>");
      });

      it("should parse CDATA section with special characters", () => {
        const tokens = [...parseHtmlFromText("<![CDATA[<div>text</div>]]>")];
        assert.strictEqual(tokens.length, 1);
        const token = tokens[0];
        assert.strictEqual(token.type, "CDATATag");
      });

      it("should parse multiline CDATA section", () => {
        const tokens = [...parseHtmlFromText("<![CDATA[line1\nline2]]>")];
        assert.strictEqual(tokens.length, 1);
        const token = tokens[0];
        assert.strictEqual(token.type, "CDATATag");
      });
    });

    describe("Text tokens", () => {
      it("should parse text before tag", () => {
        const tokens = [...parseHtmlFromText("text<div>")];
        assert.strictEqual(tokens.length, 2);
        const token = tokens[0];
        assert.strictEqual(token.type, "Text");
        assert.strictEqual(token.value, "text");
        assert.deepStrictEqual(token.range, [0, 4]);
      });

      it("should parse text after tag", () => {
        const tokens = [...parseHtmlFromText("<div>text")];
        assert.strictEqual(tokens.length, 2);
        const token = tokens[1];
        assert.strictEqual(token.type, "Text");
        assert.strictEqual(token.value, "text");
      });

      it("should parse text between tags", () => {
        const tokens = [...parseHtmlFromText("<div>text</div>")];
        assert.strictEqual(tokens.length, 3);
        const token = tokens[1];
        assert.strictEqual(token.type, "Text");
        assert.strictEqual(token.value, "text");
      });

      it("should parse only text when no tags", () => {
        const tokens = [...parseHtmlFromText("just text")];
        assert.strictEqual(tokens.length, 1);
        const token = tokens[0];
        assert.strictEqual(token.type, "Text");
        assert.strictEqual(token.value, "just text");
      });
    });

    describe("Mixed content", () => {
      it("should parse complete HTML structure", () => {
        const html = "<div class='wrapper'><p>text</p></div>";
        const tokens = [...parseHtmlFromText(html)];
        assert.strictEqual(tokens.length, 5);
        assert.strictEqual(tokens[0].type, "OpenTag");
        assert.strictEqual(tokens[1].type, "OpenTag");
        assert.strictEqual(tokens[2].type, "Text");
        assert.strictEqual(tokens[3].type, "CloseTag");
        assert.strictEqual(tokens[4].type, "CloseTag");
      });

      it("should handle invalid tag-like text", () => {
        const tokens = [...parseHtmlFromText("< invalid")];
        assert.strictEqual(tokens.length, 1);
        const token = tokens[0];
        assert.strictEqual(token.type, "Text");
        assert.strictEqual(token.value, "< invalid");
      });

      it("should parse comment followed by tag", () => {
        const tokens = [...parseHtmlFromText("<!-- comment --><div>")];
        assert.strictEqual(tokens.length, 2);
        assert.strictEqual(tokens[0].type, "CommentTag");
        assert.strictEqual(tokens[1].type, "OpenTag");
      });
    });

    describe("Edge cases", () => {
      it("should handle empty string", () => {
        const tokens = [...parseHtmlFromText("")];
        assert.strictEqual(tokens.length, 0);
      });

      it("should handle unclosed tag", () => {
        const tokens = [...parseHtmlFromText("<div")];
        assert.strictEqual(tokens.length, 1);
        const token = tokens[0];
        assert.strictEqual(token.type, "Text");
      });

      it("should handle attribute without value", () => {
        const tokens = [...parseHtmlFromText("<div class=>")];
        assert.strictEqual(tokens.length, 1);
        const token = tokens[0];
        assert.strictEqual(token.type, "Text");
      });

      it("should handle multiple angle brackets", () => {
        const tokens = [...parseHtmlFromText("<<div>>")];
        assert.strictEqual(tokens.length, 3);
        assert.strictEqual(tokens[0].type, "Text");
        assert.strictEqual(tokens[1].type, "OpenTag");
        assert.strictEqual(tokens[2].type, "Text");
      });
    });
  });

  describe("parseHtml", () => {
    it("should parse HTML in simple markdown", () => {
      const src = parseMarkdown("<div>text</div>", { frontmatter: "yaml" });
      const htmlNode = src!.ast.children[0] as Html;
      const tokens = [...parseHtml(src!, htmlNode)];
      assert.strictEqual(tokens.length, 3);
      assert.strictEqual(tokens[0].type, "OpenTag");
      assert.strictEqual(tokens[1].type, "Text");
      assert.strictEqual(tokens[2].type, "CloseTag");
    });

    it("should parse single-line HTML", () => {
      const src = parseMarkdown("<span>test</span>", { frontmatter: "yaml" });
      const htmlNode = src!.ast.children[0] as Html;
      const tokens = [...parseHtml(src!, htmlNode)];
      assert.strictEqual(tokens.length, 3);
    });

    it("should parse multiline HTML in blockquote", () => {
      const markdown = "> <div>\n> text\n> </div>";
      const src = parseMarkdown(markdown, { frontmatter: "yaml" });
      const blockquote = src!.ast.children[0];
      if (blockquote.type !== "blockquote") {
        throw new Error("Expected blockquote");
      }
      const htmlNode = blockquote.children[0] as Html;
      const tokens = [...parseHtml(src!, htmlNode)];
      assert.strictEqual(tokens.length, 3);
      assert.strictEqual(tokens[0].type, "OpenTag");
      assert.strictEqual(tokens[1].type, "Text");
      assert.strictEqual(tokens[2].type, "CloseTag");
    });

    it("should parse multiline HTML in nested blockquote", () => {
      const markdown = "> > <div>\n> > text\n> > </div>";
      const src = parseMarkdown(markdown, { frontmatter: "yaml" });
      const outerBlockquote = src!.ast.children[0];
      if (outerBlockquote.type !== "blockquote") {
        throw new Error("Expected blockquote");
      }
      const innerBlockquote = outerBlockquote.children[0];
      if (innerBlockquote.type !== "blockquote") {
        throw new Error("Expected inner blockquote");
      }
      const htmlNode = innerBlockquote.children[0] as Html;
      const tokens = [...parseHtml(src!, htmlNode)];
      assert.strictEqual(tokens.length, 3);
      assert.strictEqual(tokens[0].type, "OpenTag");
      assert.strictEqual(tokens[1].type, "Text");
      assert.strictEqual(tokens[2].type, "CloseTag");
    });

    it("should handle HTML with mixed spaces and tabs in blockquote", () => {
      const markdown = "> \t<div>\n> \ttext\n> \t</div>";
      const src = parseMarkdown(markdown, { frontmatter: "yaml" });
      const blockquote = src!.ast.children[0];
      if (blockquote.type !== "blockquote") {
        throw new Error("Expected blockquote");
      }
      const htmlNode = blockquote.children[0] as Html;
      const tokens = [...parseHtml(src!, htmlNode)];
      // Tab before <div> is parsed as text, so we get 4 tokens
      assert.strictEqual(tokens.length, 4);
      assert.strictEqual(tokens[0].type, "Text");
      assert.strictEqual(tokens[1].type, "OpenTag");
      assert.strictEqual(tokens[2].type, "Text");
      assert.strictEqual(tokens[3].type, "CloseTag");
    });

    it("should parse self-closing tag in markdown", () => {
      const src = parseMarkdown("<br/>", { frontmatter: "yaml" });
      const htmlNode = src!.ast.children[0] as Html;
      const tokens = [...parseHtml(src!, htmlNode)];
      assert.strictEqual(tokens.length, 1);
      assert.strictEqual(tokens[0].type, "OpenTag");
      assert.strictEqual(tokens[0].selfClosing, true);
    });

    it("should parse HTML comment in markdown", () => {
      const src = parseMarkdown("<!-- comment -->", { frontmatter: "yaml" });
      const htmlNode = src!.ast.children[0] as Html;
      const tokens = [...parseHtml(src!, htmlNode)];
      assert.strictEqual(tokens.length, 1);
      assert.strictEqual(tokens[0].type, "CommentTag");
    });
  });
});
