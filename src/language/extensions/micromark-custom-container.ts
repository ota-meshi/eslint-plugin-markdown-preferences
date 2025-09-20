import { markdownLineEnding, markdownSpace } from "micromark-util-character";
import type {
  Code,
  Construct,
  Effects,
  Extension,
  State,
  Token,
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
    customContainer: "customContainer";
    customContainerFence: "customContainerFence";
    customContainerFenceSequence: "customContainerFenceSequence";
    customContainerFenceInfo: "customContainerFenceInfo";
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

const COLON = 58; /* `:` */

/**
 * Micromark extension to support custom containers (e.g., ::: warning ... :::).
 */
export function customContainer(): Extension {
  const customContainerContinuation: Construct = {
    name: "customContainerContinuation",
    tokenize(effects, ok, nok) {
      return tokenizeCustomContainerContinuation(this, effects, ok, nok);
    },
  };
  const customContainerOpenConstruct: Construct = {
    name: "customContainer",
    continuation: customContainerContinuation,
    exit(effects) {
      effects.exit("customContainer");
    },
    tokenize(effects, ok, nok) {
      return tokenizeCustomContainerOpen(this, effects, ok, nok);
    },
  };
  const customContainerCloseConstruct: Construct = {
    name: "customContainerCloseConstruct",
    tokenize(effects, ok, nok) {
      return tokenizeCustomContainerClose(this, effects, ok, nok);
    },
  };

  return {
    document: {
      [COLON]: customContainerOpenConstruct,
    },
  };

  /**
   * Continuation tokenizer for the opening marker of the custom container.
   */
  function tokenizeCustomContainerOpen(
    self: TokenizeContext,
    effects: Effects,
    ok: State,
    nok: State,
  ): State {
    let size = 0;
    let openToken: Token | undefined;

    const infoCodes: number[] = [];

    return start;

    /**
     * Process start for the opening marker of the custom container.
     */
    function start(code: Code): State | undefined {
      if (code !== COLON) return nok(code);

      size = 0;
      openToken = effects.enter("customContainer", { _container: true });
      effects.enter("customContainerFence");
      effects.enter("customContainerFenceSequence");
      return sequence;
    }

    /**
     * Process sequence for the opening marker of the custom container.
     *
     * ```markdown
     * > | ::: info
     *     ^
     * ```
     */
    function sequence(code: Code): State | undefined {
      if (code === COLON) {
        size++;
        effects.consume(code);
        return sequence;
      }

      if (size < 3) {
        return nok(code);
      }
      effects.exit("customContainerFenceSequence");
      return markdownSpace(code)
        ? factorySpace(effects, infoBefore, types.whitespace)(code)
        : infoBefore(code);
    }

    /**
     * Process before info for the opening marker of the custom container.
     *
     * ```markdown
     * > | ::: info
     *        ^
     * ```
     */
    function infoBefore(code: Code): State | undefined {
      if (code === codes.eof || markdownLineEnding(code)) {
        return nok(code);
      }
      openToken!._customContainer = { size };
      self.containerState!._customContainer = { open: openToken! };

      effects.enter("customContainerFenceInfo");
      effects.enter(types.chunkString, {
        contentType: constants.contentTypeString,
      });
      infoCodes.length = 0;
      return info(code);
    }

    /**
     * Process info for the opening marker of the custom container.
     *
     * ```markdown
     * > | ::: info
     *         ^
     * ```
     *
     * @type {State}
     */
    function info(code: Code): State | undefined {
      if (code === codes.eof || markdownLineEnding(code)) {
        effects.exit(types.chunkString);
        effects.exit("customContainerFenceInfo");
        effects.exit("customContainerFence");
        openToken!._customContainer!.info = String.fromCharCode(...infoCodes);
        return ok(code);
      }

      infoCodes.push(code);
      effects.consume(code);
      return info;
    }
  }

  /**
   * Continuation tokenizer for the closing marker of the custom container.
   */
  function tokenizeCustomContainerClose(
    self: TokenizeContext,
    effects: Effects,
    ok: State,
    nok: State,
  ): State {
    let size = 0;
    let startAt: Token["start"] | undefined;

    return start;

    /**
     * Process start for the closing marker of the custom container.
     */
    function start(code: Code): State | undefined {
      if (code !== COLON) return nok(code);

      size = 0;
      startAt = self.now();
      effects.enter("customContainerFence");
      effects.enter("customContainerFenceSequence");
      return sequence;
    }

    /**
     * Process sequence for the closing marker of the custom container.
     *
     * ```markdown
     * > | :::
     * ```
     */
    function sequence(code: Code): State | undefined {
      if (code === COLON) {
        size++;
        effects.consume(code);
        return sequence;
      }

      if (size < 3) {
        return nok(code);
      }
      effects.exit("customContainerFenceSequence");
      return markdownSpace(code)
        ? factorySpace(effects, after, types.whitespace)(code)
        : after(code);
    }

    /**
     * Process after for the closing marker of the custom container.
     *
     * ```markdown
     * > | :::
     *        ^
     * ```
     */
    function after(code: Code): State | undefined {
      if (code === codes.eof || markdownLineEnding(code)) {
        if (!self.containerState)
          throw new Error("containerState is undefined");

        const openToken = self.containerState._customContainer?.open;
        if (openToken?._customContainer?.size === size) {
          if (hasNextSameLengthOpeningMarker(openToken)) {
            // There is a next unclosed custom container with the same length of opening marker.
            // So, do not close this custom container.
            return nok(code);
          }
          openToken._customContainer.closed = true;
          self.containerState._closeFlow = true;
          effects.exit("customContainerFence");
          return ok(code);
        }
      }
      return nok(code);
    }

    /**
     * Check if there is a next unclosed custom container with the same length of opening marker.
     */
    function hasNextSameLengthOpeningMarker(currToken: Token) {
      const currState = currToken._customContainer!;
      const currTokenIndex = self.events.findLastIndex(([, token]) => {
        return token === currToken;
      });
      if (currTokenIndex === -1) return false;
      for (let i = currTokenIndex + 1; i < self.events.length; i++) {
        const [type, token] = self.events[i];
        if (type !== "enter" || token.type !== "customContainer") continue;
        const targetState = token._customContainer;
        if (!targetState || targetState.closed) continue;
        if (
          targetState.size === currState.size &&
          token.start.column === currToken.start.column &&
          token.start.column === startAt!.column
        ) {
          return true;
        }
      }
      return false;
    }
  }

  /**
   * Continuation tokenizer for the custom container.
   */
  function tokenizeCustomContainerContinuation(
    self: TokenizeContext,
    effects: Effects,
    ok: State,
    nok: State,
  ): State {
    if (self.containerState?._customContainer?.open?._customContainer?.closed) {
      self.containerState._closeFlow = true;
      return nok;
    }
    return start;

    /**
     * Process start for the custom container.
     */
    function start(code: Code): State | undefined {
      if (code !== COLON) return ok(code);
      return effects.attempt(
        customContainerCloseConstruct,
        () => {
          self.containerState!._closeFlow = true;
          return ok;
        },
        ok,
      );
    }
  }
}
