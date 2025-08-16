import { createRule } from "../utils/index.ts";
import { toRegExp } from "../utils/regexp.ts";
import { GH_EMOJI_MAP } from "../utils/resources/gh-emoji.ts";
import emojiRegex from "emoji-regex-xs";

type Options = {
  prefer?: "unicode" | "colon";
  ignoreUnknown?: boolean;
  ignoreList?: string[];
};

class EmojiData {
  private _entries: [string, string][] | null = null;

  private _emojiToColon: Record<string, string | undefined> | null = null;

  private _colonToEmoji: Record<string, string | undefined> | null = null;

  public get entries(): [string, string][] {
    return (this._entries ??= Object.entries(GH_EMOJI_MAP));
  }

  public get emojiToColon(): Record<string, string | undefined> {
    if (this._emojiToColon) return this._emojiToColon;
    const emojiToCode = (this._emojiToColon = Object.create(null));
    for (const [name, unicode] of this.entries) {
      emojiToCode[unicode] = `:${name}:`;
    }
    return emojiToCode;
  }

  public get colonToEmoji(): Record<string, string | undefined> {
    if (this._colonToEmoji) return this._colonToEmoji;
    const colonToEmoji = (this._colonToEmoji = Object.create(null));
    for (const [name, unicode] of this.entries) {
      colonToEmoji[`:${name}:`] = unicode;
    }
    return colonToEmoji;
  }
}

const emojiData = new EmojiData();

export default createRule<[Options?]>("emoji-notation", {
  meta: {
    type: "suggestion",
    docs: {
      description: "Enforce consistent emoji notation style in Markdown files.",
      categories: [],
      listCategory: "Preference",
    },
    fixable: "code",
    hasSuggestions: false,
    schema: [
      {
        type: "object",
        properties: {
          prefer: {
            enum: ["unicode", "colon"],
            description: "Preferred emoji notation style.",
          },
          ignoreUnknown: {
            type: "boolean",
            description: "If true, suppress unknown colon-style emoji.",
          },
          ignoreList: {
            type: "array",
            items: { type: "string" },
            uniqueItems: true,
            description:
              "List of colon-style, Unicode emoji, or regex (as string) to suppress.",
          },
        },
        additionalProperties: false,
      },
    ],
    messages: {
      preferUnicode:
        "Use Unicode emoji '{{unicode}}' instead of colon-style emoji ('{{colon}}').",
      preferColon:
        "Use colon-style emoji '{{colon}}' instead of Unicode emoji ('{{unicode}}').",
      preferUnknownUnicode:
        "Use Unicode emoji (e.g. '{{unicode}}') instead of colon-style emoji ('{{colon}}').",
      preferUnknownColon:
        "Use colon-style emoji (e.g. '{{colon}}') instead of Unicode emoji ('{{unicode}}').",
    },
  },
  create(context) {
    const sourceCode = context.sourceCode;
    const options = context.options?.[0] || {};
    const prefer = options.prefer || "unicode";
    const ignoreUnknown = options.ignoreUnknown ?? true;
    const ignoreList = (options.ignoreList || [])
      .map((s) => toRegExp(s))
      .flatMap((re) => {
        const result = [re];
        for (const [name, unicode] of emojiData.entries) {
          if (re.test(`:${name}:`) || re.test(unicode)) {
            result.push(toRegExp(`:${name}:`), toRegExp(unicode));
          }
        }
        return result;
      });

    const isIgnoreBase = (s: string) => ignoreList.some((re) => re.test(s));

    if (prefer === "colon") {
      let isIgnore: (s: string) => boolean;
      if (ignoreUnknown) {
        isIgnore = (s: string) => isIgnoreBase(s) || !emojiData.emojiToColon[s];
      } else {
        isIgnore = (s: string) => isIgnoreBase(s);
      }
      return {
        text(node) {
          const re = emojiRegex();
          const text = sourceCode.getText(node);
          for (const match of text.matchAll(re)) {
            const emoji = match[0];
            if (isIgnore(emoji)) continue;
            const emojiOffset = match.index;

            const loc = sourceCode.getLoc(node);
            const beforeLines = text.slice(0, emojiOffset).split(/\n/u);
            const line = loc.start.line + beforeLines.length - 1;
            const column =
              (beforeLines.length === 1 ? loc.start.column : 1) +
              (beforeLines.at(-1) || "").length;

            const colon = emojiData.emojiToColon[emoji];

            context.report({
              node,
              loc: {
                start: { line, column },
                end: { line, column: column + emoji.length },
              },
              messageId: colon ? "preferColon" : "preferUnknownColon",
              data: { unicode: emoji, colon: colon || ":smile:" },
              fix: colon
                ? (fixer) => {
                    const [nodeStart] = sourceCode.getRange(node);
                    return fixer.replaceTextRange(
                      [
                        nodeStart + emojiOffset,
                        nodeStart + emojiOffset + emoji.length,
                      ],
                      colon,
                    );
                  }
                : null,
            });
          }
        },
      };
    }

    let isIgnore: (s: string) => boolean;
    if (ignoreUnknown) {
      isIgnore = (s: string) => isIgnoreBase(s) || !emojiData.colonToEmoji[s];
    } else {
      isIgnore = (s: string) => isIgnoreBase(s);
    }
    return {
      text(node) {
        // eslint-disable-next-line no-control-regex -- OK
        const re = /:[^\s\x00-\x0f:\u{7f}]+:/gu;
        const text = sourceCode.getText(node);
        for (const match of text.matchAll(re)) {
          const colon = match[0];
          if (isIgnore(colon)) continue;
          const colonOffset = match.index;

          const loc = sourceCode.getLoc(node);
          const beforeLines = text.slice(0, colonOffset).split(/\n/u);
          const line = loc.start.line + beforeLines.length - 1;
          const column =
            (beforeLines.length === 1 ? loc.start.column : 1) +
            (beforeLines.at(-1) || "").length;

          const emoji = emojiData.colonToEmoji[colon];
          context.report({
            node,
            loc: {
              start: { line, column },
              end: { line, column: column + colon.length },
            },
            messageId: emoji ? "preferUnicode" : "preferUnknownUnicode",
            data: { unicode: emoji || "😄", colon },
            fix: emoji
              ? (fixer) => {
                  const [nodeStart] = sourceCode.getRange(node);
                  return fixer.replaceTextRange(
                    [
                      nodeStart + colonOffset,
                      nodeStart + colonOffset + colon.length,
                    ],
                    emoji,
                  );
                }
              : null,
          });
        }
      },
    };
  },
});
