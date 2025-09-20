// eslint-disable-next-line no-restricted-imports -- OK
import type * as mdast from "mdast";

export type Node = mdast.Node;
export type Root = ExtendChildren<mdast.Root>;
export type Blockquote = ExtendChildren<mdast.Blockquote>;
export type Break = mdast.Break;
export type Code = mdast.Code;
export type Definition = mdast.Definition;
export type Delete = mdast.Delete;
export type Emphasis = mdast.Emphasis;
export type FootnoteDefinition = ExtendChildren<mdast.FootnoteDefinition>;
export type FootnoteReference = mdast.FootnoteReference;
export type Heading = mdast.Heading;
export type Html = mdast.Html;
export type Image = mdast.Image;
export type ImageReference = mdast.ImageReference;
export type InlineCode = mdast.InlineCode;
export type Link = mdast.Link;
export type LinkReference = mdast.LinkReference;
export type List = mdast.List;
export type ListItem = ExtendChildren<mdast.ListItem>;
export type Paragraph = mdast.Paragraph;
export type Strong = mdast.Strong;
export type Table = mdast.Table;
export type TableCell = mdast.TableCell;
export type TableRow = mdast.TableRow;
export type Text = mdast.Text;
export type ThematicBreak = mdast.ThematicBreak;
export type Yaml = mdast.Yaml;

export interface CustomContainer extends ExtendChildren<mdast.Parent> {
  /**
   * Node type of mdast block quote.
   */
  type: "customContainer";
  /**
   * Info string (e.g., "warning" in ::: warning ... :::).
   */
  info: string | null;
  /**
   * Children of custom container.
   */
  children: (CustomContainer | mdast.BlockContent | mdast.DefinitionContent)[];
}

export type RootContent = RootContentMap[keyof RootContentMap];
export type Resource = mdast.Resource;
export type PhrasingContent = mdast.PhrasingContent;

type ExtendChildren<N extends Node & { children: unknown[] }> = Omit<
  N,
  "children"
> & { children: (N["children"][number] | CustomContainer)[] };

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
  customContainer: CustomContainer;
}
