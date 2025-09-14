import { isSpaceOrTab, isWhitespace } from "./unicode.ts";

export abstract class CharacterCursor {
  protected readonly text: string;

  protected abstract index: number;

  public constructor(text: string) {
    this.text = text;
  }

  public curr(): string | undefined {
    return this.text[this.index];
  }

  public currIndex(): number {
    return this.index;
  }

  public setCurrIndex(index: number): void {
    this.index = index;
  }

  public isWhitespace(index: number): boolean {
    if (index >= this.text.length) return false;
    const ch = this.text[index];
    if (isWhitespace(ch)) return true;
    if (ch !== ">") return false;
    const prefix: string[] = [ch];
    for (let prev = index - 1; prev >= 0; prev--) {
      const prevCh = this.text[prev];
      if (prevCh === "\n") break;
      if (isSpaceOrTab(prevCh) || prevCh === ">") {
        prefix.unshift(prevCh);
        continue;
      }
      return false;
    }

    let width = 0;
    let leadingMarkerOffset = 0;
    let prevCh: string | undefined;
    for (const currCh of prefix) {
      if (currCh === ">") {
        if (width - leadingMarkerOffset > 3) return false;
        leadingMarkerOffset = width + 1;
      }
      if (currCh === "\t") {
        width += 4 - (width % 4);
      } else {
        width++;
      }
      if (prevCh === ">" && isSpaceOrTab(currCh)) {
        leadingMarkerOffset++;
      }
      prevCh = currCh;
    }
    return true;
  }
}

export class ForwardCharacterCursor extends CharacterCursor {
  protected index: number;

  public constructor(text: string) {
    super(text);
    this.index = 0;
  }

  public next(): string | undefined {
    this.index++;
    return this.text[this.index];
  }

  public finished(): boolean {
    return this.index >= this.text.length;
  }

  public skipSpaces(): void {
    while (this.index < this.text.length && this.isWhitespace(this.index)) {
      this.index++;
    }
  }

  /**
   * Skip until the end by the given condition
   */
  public skipUntilEnd(checkEnd: (c: string, i: number) => boolean): boolean {
    while (this.index < this.text.length) {
      const c = this.text[this.index];
      if (checkEnd(c, this.index)) return true;
      this.index++;
      if (c !== "\\") continue;
      if (
        this.index < this.text.length &&
        (this.text[this.index] === "\\" ||
          checkEnd(this.text[this.index], this.index)) &&
        !isWhitespace(this.text[this.index])
      ) {
        this.index++;
      }
    }
    return false;
  }
}
export class BackwardCharacterCursor extends CharacterCursor {
  protected index: number;

  public constructor(text: string) {
    super(text);
    this.index = text.length - 1;
  }

  public prev(): string | undefined {
    this.index--;
    return this.text[this.index];
  }

  public finished(): boolean {
    return this.index < 0;
  }

  public skipSpaces(): void {
    while (this.index >= 0 && this.isWhitespace(this.index)) {
      this.index--;
    }
  }

  /**
   * Skip until the start by the given condition
   */
  public skipUntilStart(
    checkStart: (c: string, i: number) => boolean,
  ): boolean {
    while (this.index >= 0) {
      const c = this.text[this.index];
      if (checkStart(c, this.index)) {
        if (this.index > 1 && !isWhitespace(c)) {
          let escapeText = "";
          while (this.text.endsWith(`${escapeText}\\`, this.index)) {
            escapeText += "\\";
          }
          // An odd number of backslashes acts as an escape.
          if (escapeText.length % 2 === 1) {
            this.index -= escapeText.length + 1;
            continue;
          }
        }
        return true;
      }
      this.index--;
    }
    return false;
  }
}
