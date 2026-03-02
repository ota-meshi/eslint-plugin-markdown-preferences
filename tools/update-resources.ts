import fs from "node:fs/promises";

const GH_EMOJI_PATH = new URL(
  import.meta.resolve("../src/utils/resources/gh-emoji.ts"),
);

void generateGhEmoji();

/**
 * Generate GitHub emoji list
 */
async function generateGhEmoji() {
  const segmenter = new Intl.Segmenter("en", { granularity: "grapheme" });
  // eslint-disable-next-line n/no-unsupported-features/node-builtins -- It's tools code, so we can use fetch
  const response = await fetch("https://api.github.com/emojis");
  const data = await response.json();
  const emojiMap = Object.create(null);
  const iconMap = Object.create(null);
  for (const [name, url] of Object.entries(data)) {
    const emoji = parseGitHubEmojiUrl(url as string, name);
    if (emoji) {
      emojiMap[name] = emoji;
    } else {
      iconMap[name] = url;
    }
  }
  await fs.writeFile(
    GH_EMOJI_PATH,
    [
      `export const GH_EMOJI_MAP = ${JSON.stringify(emojiMap)};`,
      `export const GH_EMOJI_ICON_MAP = ${JSON.stringify(iconMap)};`,
    ].join("\n"),
  );

  /**
   * Parse a GitHub emoji URL and return the corresponding emoji character.
   */
  function parseGitHubEmojiUrl(url: string, name: string) {
    const hex = /\/unicode\/([\d\-a-f]+).png/u.exec(url)?.[1];
    if (!hex) return null;
    const emojiElements: string[] = [];
    for (const element of hex.split("-")) {
      emojiElements.push(String.fromCodePoint(parseInt(element, 16)));
    }

    let small: { c: string; count: number } | null = null;
    for (const candidate of (function* () {
      if (emojiElements.length === 2 && emojiElements[1] === "\u{20e3}") {
        yield emojiElements.join("\u{fe0f}"); // Emoji presentation
      }
      yield emojiElements.join("");
      yield emojiElements.join("\u{200d}"); // Zero-width joiner
    })()) {
      const currCount = countGrapheme(candidate);
      if (currCount === 1) {
        // if (!/^[\p{Emoji}\p{RGI_Emoji}]$/v.test(candidate)) {
        //   console.log(candidate, name);
        //   debugger;
        // }
        return candidate;
      }
      if (!small || currCount < small.count) {
        small = {
          c: candidate,
          count: currCount,
        };
      }
    }

    // eslint-disable-next-line no-console -- Debugging grapheme counts
    console.log(
      `Emoji "${small!.c}" has ${small!.count} graphemes. At ${name}`,
    );
    return small!.c;
  }

  /**
   * Count the number of graphemes in a string.
   */
  function countGrapheme(c: string) {
    let count = 0;
    for (const _grapheme of segmenter.segment(c)) {
      count++;
    }
    return count;
  }
}
