// eslint-disable-next-line no-restricted-imports -- OK
import type * as mdast from "mdast";
import type {
  File,
  FileError,
  Language,
  OkParseResult,
  ParseResult,
  RuleVisitor,
  SourceLocation,
} from "@eslint/core";
import type { MarkdownSourceCode } from "@eslint/markdown";
import markdown from "@eslint/markdown";
import type {
  MarkdownLanguageContext,
  MarkdownLanguageOptions,
  MarkdownRuleVisitor,
} from "@eslint/markdown/types";
import type {
  Root,
  Node,
  InlineMath,
  Math,
  ImportCodeSnippet,
} from "./ast-types.ts";
import type { CustomContainer } from "./ast-types.ts";
import type { TextSourceCodeBase } from "@eslint/plugin-kit";
import { parseExtendedMarkdown } from "./parser.ts";

export interface ExtendedMarkdownSourceCode
  extends TextSourceCodeBase<{
    LangOptions: MarkdownLanguageOptions;
    RootNode: Root;
    SyntaxElementWithLoc: Node;
    ConfigNode: {
      value: string;
      position: SourceLocation;
    };
  }> {
  getInlineConfigNodes(): ReturnType<
    MarkdownSourceCode["getInlineConfigNodes"]
  >;

  getDisableDirectives(): ReturnType<
    MarkdownSourceCode["getDisableDirectives"]
  >;
}

export class ExtendedMarkdownLanguage implements Language {
  /**
   * The type of file to read.
   * @type {"text"}
   */
  public readonly fileType = markdown.languages.gfm.fileType;

  /**
   * The line number at which the parser starts counting.
   * @type {0|1}
   */
  public readonly lineStart = markdown.languages.gfm.lineStart;

  /**
   * The column number at which the parser starts counting.
   * @type {0|1}
   */
  public readonly columnStart = markdown.languages.gfm.columnStart;

  /**
   * The name of the key that holds the type of the node.
   * @type {string}
   */
  public readonly nodeTypeKey = markdown.languages.gfm.nodeTypeKey;

  /**
   * Default language options. User-defined options are merged with this object.
   * @type {MarkdownLanguageOptions}
   */
  public readonly defaultLanguageOptions =
    markdown.languages.gfm.defaultLanguageOptions;

  /**
   * Validates the language options.
   * @param {MarkdownLanguageOptions} languageOptions The language options to validate.
   * @returns {void}
   * @throws {Error} When the language options are invalid.
   */
  public validateLanguageOptions(
    languageOptions: MarkdownLanguageOptions,
  ): void {
    return markdown.languages.gfm.validateLanguageOptions(languageOptions);
  }

  /**
   * Parses the given file into an AST.
   * @param {File} file The virtual file to parse.
   * @param {MarkdownLanguageContext} _context The options to use for parsing.
   * @returns {ParseResult<Root>} The result of parsing.
   */
  public parse(
    file: File,
    _context: MarkdownLanguageContext,
  ): ParseResult<Root> {
    const text = file.body as string;
    try {
      const root = parseExtendedMarkdown(text);
      return {
        ok: true,
        ast: root,
      };
    } catch (ex: unknown) {
      return {
        ok: false,
        errors: [ex as FileError],
      };
    }
  }

  /**
   * Creates a new `MarkdownSourceCode` object from the given information.
   * @param {File} file The virtual file to create a `MarkdownSourceCode` object from.
   * @param {OkParseResult<Root>} parseResult The result returned from `parse()`.
   * @returns {MarkdownSourceCode} The new `MarkdownSourceCode` object.
   */
  public createSourceCode(
    file: File,
    parseResult: OkParseResult<Root>,
  ): ExtendedMarkdownSourceCode {
    return markdown.languages.gfm.createSourceCode(
      file,
      parseResult as OkParseResult<mdast.Root>,
    ) as ExtendedMarkdownSourceCode;
  }
}

type WithExit<RuleVisitorType extends RuleVisitor> = {
  [Key in keyof RuleVisitorType as
    | Key
    | `${Key & string}:exit`]: RuleVisitorType[Key];
};
export interface ExtendedMarkdownRuleVisitor
  extends MarkdownRuleVisitor,
    WithExit<{
      customContainer?(node: CustomContainer): void;
      math?(node: Math): void;
      inlineMath?(node: InlineMath): void;
      importCodeSnippet?(node: ImportCodeSnippet): void;
    }> {}
