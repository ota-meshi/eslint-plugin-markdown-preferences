import type { Json, Toml } from "@eslint/markdown/types";
import type {
  Blockquote,
  Break,
  Code,
  Definition,
  Delete,
  Emphasis,
  FootnoteDefinition,
  FootnoteReference,
  Heading,
  Html,
  Image,
  ImageReference,
  InlineCode,
  Link,
  LinkReference,
  List,
  ListItem,
  Paragraph,
  Root,
  Strong,
  Table,
  TableCell,
  TableRow,
  Text,
  ThematicBreak,
  Yaml,
} from "mdast";

export type MDNode =
  | Root
  | Blockquote
  | Break
  | Code
  | Definition
  | Emphasis
  | Heading
  | Html
  | Image
  | ImageReference
  | InlineCode
  | Link
  | LinkReference
  | List
  | ListItem
  | Paragraph
  | Strong
  | Text
  | ThematicBreak
  | Delete
  | FootnoteDefinition
  | FootnoteReference
  | Table
  | TableCell
  | TableRow
  | Yaml
  | Toml
  | Json;
