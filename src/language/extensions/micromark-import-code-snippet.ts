import { markdownLineEnding, markdownSpace } from "micromark-util-character";
import type {
  Code,
  Construct,
  Effects,
  Extension,
  State,
  TokenizeContext,
} from "micromark-util-types";
import { codes, constants, types } from "micromark-util-symbol";
import { factorySpace } from "micromark-factory-space";

type CustomContainerState = {
  size: number;
  closed?: boolean;
  info?: string; // for debugging
};

declare module "micromark-util-types" {
  interface TokenTypeMap {
    // For custom container
    importCodeSnippet: "importCodeSnippet";
    importCodeSnippetMarkerSequence: "importCodeSnippetMarkerSequence";
    importCodeSnippetPath: "importCodeSnippetPath";
  }
  interface ContainerState {
    _customContainer?: {
      open: Token;
    };
  }
  interface Token {
    _customContainer?: CustomContainerState;
  }
}

/**
 * Micromark extension to support [VitePress-style Import Code Snippets](https://vitepress.dev/guide/markdown#import-code-snippets) syntax using triple left angle brackets.
 */
export function importCodeSnippet(): Extension {
  const importCodeSnippetConstruct: Construct = {
    name: "importCodeSnippet",
    tokenize(effects, ok, nok) {
      return tokenizeImportCodeSnippet(this, effects, ok, nok);
    },
  };

  return {
    flow: {
      [codes.lessThan]: importCodeSnippetConstruct,
    },
  };

  /**
   * Tokenizer for the import code snippet.
   */
  function tokenizeImportCodeSnippet(
    _self: TokenizeContext,
    effects: Effects,
    ok: State,
    nok: State,
  ): State {
    let size = 0;

    return start;

    /**
     * Process start for the opening marker of the import code snippet.
     */
    function start(code: Code): State | undefined {
      if (code !== codes.lessThan) return nok(code);
      size = 0;
      effects.enter("importCodeSnippet");
      effects.enter("importCodeSnippetMarkerSequence");
      return sequence(code);
    }

    /**
     * Process the sequence of opening markers for the import code snippet.
     *
     * ```markdown
     * > | <<< ./path/to/code.ts
     *     ^^^
     * ```
     */
    function sequence(code: Code): State | undefined {
      if (code === codes.lessThan) {
        size++;
        effects.consume(code);
        return sequence;
      }
      if (size < 3) {
        return nok(code);
      }
      effects.exit("importCodeSnippetMarkerSequence");
      return markdownSpace(code)
        ? factorySpace(effects, afterMarker, types.whitespace)(code)
        : afterMarker(code);
    }

    /**
     * Process after the opening marker of the import code snippet.
     *
     * ```markdown
     * > | <<< ./path/to/code.ts
     *         ^
     * ```
     */
    function afterMarker(code: Code): State | undefined {
      if (code === codes.eof || markdownLineEnding(code)) {
        // There must be a path.
        return nok(code);
      }
      effects.enter("importCodeSnippetPath");
      effects.enter(types.chunkString, {
        contentType: constants.contentTypeString,
      });
      return importPath(code);
    }

    /**
     * Process the path of the import code snippet.
     *
     * ```markdown
     * > | <<< ./path/to/code.ts
     *         ^^^^^^^^^^^^^^^^^
     * ```
     */
    function importPath(code: Code): State | undefined {
      if (
        code === codes.eof ||
        markdownLineEnding(code) ||
        markdownSpace(code)
      ) {
        effects.exit(types.chunkString);
        effects.exit("importCodeSnippetPath");
        effects.exit("importCodeSnippet");
        return afterPath(code);
      }
      effects.consume(code);
      return importPath;
    }

    /**
     * Process after the path of the import code snippet.
     *
     * ```markdown
     * > | <<< ./path/to/code.ts
     *                          ^
     * ```
     */
    function afterPath(code: Code): State | undefined {
      if (code === codes.eof || markdownLineEnding(code)) {
        return ok(code);
      }
      if (markdownSpace(code)) {
        return factorySpace(effects, afterPath, types.whitespace)(code);
      }
      // There should be only whitespace after the path.
      return nok(code);
    }
  }
}
