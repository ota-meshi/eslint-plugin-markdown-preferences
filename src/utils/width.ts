/**
 * Get the visual width of the string.
 */
export function getWidth(str: string): number {
  let width = 0;
  for (const c of str) {
    if (c === "\t") {
      width += 4 - (width % 4);
    } else {
      width++;
    }
  }
  return width;
}

/**
 * Get a slice of the string by visual width.
 */
export function sliceWidth(str: string, start: number, end?: number): string {
  const buffer = [...str];
  let width = 0;
  let c;
  while ((c = buffer.shift())) {
    if (start <= width) {
      buffer.unshift(c);
      break;
    }
    if (c === "\t") {
      width += 4 - (width % 4);
    } else {
      width++;
    }
  }
  if (buffer.length === 0) return "";
  let result = " ".repeat(width - start);
  if (end == null) {
    return `${result}${buffer.join("")}`;
  }
  while ((c = buffer.shift())) {
    let newWidth;
    if (c === "\t") {
      newWidth = width + 4 - (width % 4);
    } else {
      newWidth = width + 1;
    }
    if (end < newWidth) {
      buffer.unshift(c);
      break;
    }
    result += c;
    width = newWidth;
  }
  if (buffer.length === 0) return result;
  result += " ".repeat(end - width);
  return result;
}

/**
 * Get the character at the visual width.
 */
export function atWidth(str: string, target: number): string | null {
  let width = 0;
  for (const c of str) {
    if (target === width) {
      return c;
    }
    if (target < width) {
      return " ";
    }
    if (c === "\t") {
      width += 4 - (width % 4);
    } else {
      width++;
    }
  }
  return null;
}
