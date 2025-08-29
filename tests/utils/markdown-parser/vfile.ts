import type { File } from "@eslint/core";

/**
 * Checks if a string has a byte order mark (BOM).
 */
function hasBOM(value: string) {
  return value.charCodeAt(0) === 0xfeff;
}

/**
 * Strips BOM from the given value.
 */
function stripBOM(value: string) {
  if (!hasBOM(value)) {
    return value;
  }

  return value.slice(1);
}

export class VFile implements File {
  public readonly path;

  public readonly physicalPath;

  public readonly body;

  public readonly bom;

  public constructor(path: string, body: string) {
    this.path = path;
    this.physicalPath = path;
    this.bom = hasBOM(body);
    this.body = stripBOM(body);
  }
}
