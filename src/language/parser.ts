import type { Root } from "./ast-types.ts";
import type { Options } from "mdast-util-from-markdown";
import { fromMarkdown } from "mdast-util-from-markdown";
import { frontmatterFromMarkdown } from "mdast-util-frontmatter";
import { gfmFromMarkdown } from "mdast-util-gfm";
import { frontmatter } from "micromark-extension-frontmatter";
import { gfm } from "micromark-extension-gfm";
import { customContainer } from "./extensions/micromark-custom-container.ts";
import { customContainerFromMarkdown } from "./extensions/mdast-custom-container.ts";

/**
 * Parse Extended Markdown to MDAST.
 */
export function parseExtendedMarkdown(code: string): Root {
  const options: Options = {
    extensions: [gfm(), frontmatter(["yaml", "toml"]), customContainer()],
    mdastExtensions: [
      gfmFromMarkdown(),
      frontmatterFromMarkdown(["yaml", "toml"]),
      customContainerFromMarkdown(),
    ],
  };
  return fromMarkdown(code, options);
}
