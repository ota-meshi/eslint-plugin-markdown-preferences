import stringWidth from "string-width";

let segmenter: Intl.Segmenter | null;
/**
 * Get the width of a text string.
 */
export function getTextWidth(
  text: string,
  start = 0,
  end = text.length,
): number {
  if (!text.includes("\t")) {
    return stringWidth(text.slice(start, end));
  }
  const prefixWidth = getTextWidthBySegment(text.slice(0, start), 0);
  return getTextWidthBySegment(text.slice(start, end), prefixWidth);
}

/**
 * Get the width of a text string by segmenter.
 */
function getTextWidthBySegment(text: string, startWidth: number): number {
  if (!segmenter) {
    segmenter = new Intl.Segmenter("en");
  }
  let width = startWidth;
  for (const { segment: c } of segmenter.segment(text)) {
    if (c === "\t") {
      width += 4 - (width % 4);
    } else {
      width += stringWidth(c);
    }
  }
  return width;
}
