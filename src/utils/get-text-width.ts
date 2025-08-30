import stringWidth from "string-width";

let segmenter: Intl.Segmenter | null;
/**
 * Get the width of a text string.
 */
export function getTextWidth(text: string): number {
  if (!text.includes("\t")) {
    return stringWidth(text);
  }
  if (!segmenter) {
    segmenter = new Intl.Segmenter("en");
  }
  let width = 0;
  for (const { segment: c } of segmenter.segment(text)) {
    if (c === "\t") {
      width += 4 - (width % 4);
    } else {
      width += stringWidth(c);
    }
  }
  return width;
}
