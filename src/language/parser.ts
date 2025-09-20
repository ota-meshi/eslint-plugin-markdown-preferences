import type { Root } from "./ast-types.ts";
import type { Options } from "mdast-util-from-markdown";
import { fromMarkdown } from "mdast-util-from-markdown";
import { frontmatterFromMarkdown } from "mdast-util-frontmatter";
import { gfmFromMarkdown } from "mdast-util-gfm";
import { frontmatter } from "micromark-extension-frontmatter";
import { gfm } from "micromark-extension-gfm";
import { math } from "micromark-extension-math";
import { mathFromMarkdown } from "mdast-util-math";
import { customContainer } from "./extensions/micromark-custom-container.ts";
import { customContainerFromMarkdown } from "./extensions/mdast-custom-container.ts";
import { importCodeSnippet } from "./extensions/micromark-import-code-snippet.ts";
import { importCodeSnippetFromMarkdown } from "./extensions/mdast-import-code-snippet.ts";

/**
 * Parse Extended Markdown to MDAST.
 */
export function parseExtendedMarkdown(code: string): Root {
  const options: Options = {
    extensions: [
      gfm(),
      frontmatter(["yaml", "toml"]),
      math(),
      customContainer(),
      importCodeSnippet(),
    ],
    mdastExtensions: [
      gfmFromMarkdown(),
      frontmatterFromMarkdown(["yaml", "toml"]),
      mathFromMarkdown(),
      customContainerFromMarkdown(),
      importCodeSnippetFromMarkdown(),
    ],
  };
  return fromMarkdown(code, options);
}
