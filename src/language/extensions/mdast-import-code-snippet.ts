import type { Extension } from "mdast-util-from-markdown";
import type { ImportCodeSnippet } from "../ast-types.ts";

/**
 * Mdast extension to support [VitePress-style Import Code Snippets](https://vitepress.dev/guide/markdown#import-code-snippets) syntax using triple left angle brackets.
 */
export function importCodeSnippetFromMarkdown(): Extension {
  return {
    enter: {
      importCodeSnippet(token) {
        this.enter({ type: "importCodeSnippet", value: "" } as never, token);
      },
      importCodeSnippetPath() {
        this.buffer();
      },
    },
    exit: {
      importCodeSnippet(token) {
        this.exit(token);
      },
      importCodeSnippetPath() {
        const data = this.resume();
        const node = this.stack[
          this.stack.length - 1
        ] as unknown as ImportCodeSnippet;
        node.value = data;
      },
    },
  };
}
