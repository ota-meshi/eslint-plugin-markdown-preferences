import type * as eslint from "@eslint/markdown/types";
// eslint-disable-next-line no-restricted-imports -- OK
import type * as mdast from "mdast";
// eslint-disable-next-line no-restricted-imports -- OK
import type * as math from "mdast-util-math";

export type Node = mdast.Node;
export type Root = ExtendChildren<mdast.Root, RootContent>;
export type Blockquote = ExtendChildren<mdast.Blockquote, CustomContainer>;
export type Break = mdast.Break;
export type Code = mdast.Code;
export type Definition = mdast.Definition;
export type Delete = mdast.Delete;
export type Emphasis = mdast.Emphasis;
export type FootnoteDefinition = ExtendChildren<
  mdast.FootnoteDefinition,
  CustomContainer
>;
export type FootnoteReference = mdast.FootnoteReference;
export type Heading = mdast.Heading;
export type Html = mdast.Html;
export type Image = mdast.Image;
export type ImageReference = mdast.ImageReference;
export type InlineCode = mdast.InlineCode;
export type Link = mdast.Link;
export type LinkReference = mdast.LinkReference;
export type List = mdast.List;
export type ListItem = ExtendChildren<mdast.ListItem, CustomContainer>;
export type Paragraph = mdast.Paragraph;
export type Strong = mdast.Strong;
export type Table = mdast.Table;
export type TableCell = mdast.TableCell;
export type TableRow = mdast.TableRow;
export type Text = mdast.Text;
export type ThematicBreak = mdast.ThematicBreak;
export type Yaml = mdast.Yaml;
export type Math = math.Math;
export type InlineMath = math.InlineMath;
export type Toml = eslint.Toml;
export type Json = eslint.Json;

export interface CustomContainer extends ExtendChildren<
  mdast.Parent,
  CustomContainer | ImportCodeSnippet
> {
  /**
   * Node type of mdast custom container.
   */
  type: "customContainer";
  /**
   * Info string (e.g., "warning" in ::: warning ... :::).
   */
  info: string;
  /**
   * Children of custom container.
   */
  children: (CustomContainer | BlockContent | DefinitionContent)[];
}

export interface ImportCodeSnippet extends mdast.Literal {
  /**
   * Node type of mdast import code snippet.
   */
  type: "importCodeSnippet";
}

export type RootContent = RootContentMap[keyof RootContentMap];
export type BlockContent =
  | RootContentMap[keyof mdast.BlockContentMap]
  | ImportCodeSnippet;
export type DefinitionContent =
  RootContentMap[keyof mdast.DefinitionContentMap];
export type Resource = mdast.Resource;
export type PhrasingContent = mdast.PhrasingContent;

type ExtendChildren<
  N extends mdast.Node & { children: mdast.Node[] },
  C extends mdast.Node,
> = Omit<N, "children"> & { children: (MapChild<N["children"][number]> | C)[] };

type MapChild<N extends mdast.Node> = N["type"] extends RootContent["type"]
  ? RootContentMap[N["type"]]
  : N;

interface RootContentMap {
  blockquote: Blockquote;
  break: Break;
  code: Code;
  definition: Definition;
  delete: Delete;
  emphasis: Emphasis;
  footnoteDefinition: FootnoteDefinition;
  footnoteReference: FootnoteReference;
  heading: Heading;
  html: Html;
  image: Image;
  imageReference: ImageReference;
  inlineCode: InlineCode;
  link: Link;
  linkReference: LinkReference;
  list: List;
  listItem: ListItem;
  paragraph: Paragraph;
  strong: Strong;
  table: Table;
  tableCell: TableCell;
  tableRow: TableRow;
  text: Text;
  thematicBreak: ThematicBreak;
  yaml: Yaml;
  toml: Toml;
  json: Json;
  customContainer: CustomContainer;
  inlineMath: InlineMath;
  math: Math;
  importCodeSnippet: ImportCodeSnippet;
}
