import type { Extension } from "mdast-util-from-markdown";
import type { CustomContainer } from "../ast-types.ts";

/**
 * Mdast extension to support custom containers (e.g., ::: warning ... :::).
 */
export function customContainerFromMarkdown(): Extension {
  return {
    enter: {
      customContainer(token) {
        this.enter(
          { type: "customContainer", children: [], info: null } as never,
          token,
        );
      },
      customContainerFenceInfo() {
        this.buffer();
      },
    },
    exit: {
      customContainer(token) {
        this.exit(token);
      },
      customContainerFenceInfo() {
        const data = this.resume();
        const node = this.stack[
          this.stack.length - 1
        ] as unknown as CustomContainer;
        node.info = data;
      },
    },
  };
}
