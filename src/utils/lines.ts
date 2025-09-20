import type { ExtendedMarkdownSourceCode } from "../language/extended-markdown-ianguage.ts";

const cache = new WeakMap<ExtendedMarkdownSourceCode, ParsedLines>();

export type ParsedLine = {
  text: string;
  range: [number, number];
  line: number;
  linebreak: string;
};

export class ParsedLines {
  private readonly lines: ParsedLine[];

  public constructor(codeText: string) {
    let offset = 0;
    this.lines = codeText.split(/(?<=\n)/u).map((lineText, index) => {
      const start = offset;
      offset += lineText.length;
      const range: [number, number] = [start, offset];
      let text = lineText;
      let linebreak = "";
      if (text.at(-1) === "\n") {
        text = text.slice(0, -1); // Remove the trailing newline character
        linebreak = "\n";
      }
      if (text.at(-1) === "\r") {
        text = text.slice(0, -1); // Remove the trailing carriage return
        linebreak = `\r${linebreak}`;
      }
      return {
        text,
        range,
        line: index + 1,
        linebreak,
      };
    });
  }

  public [Symbol.iterator](): Iterator<ParsedLine> {
    return this.lines[Symbol.iterator]();
  }

  public get length(): number {
    return this.lines.length;
  }

  public get(lineNumber: number): ParsedLine {
    return this.lines[lineNumber - 1];
  }
}

/**
 * Parse the lines of the source code.
 * @param sourceCode source code to parse
 * @returns parsed lines
 */
export function getParsedLines(
  sourceCode: ExtendedMarkdownSourceCode,
): ParsedLines {
  const cached = cache.get(sourceCode);
  if (cached) {
    return cached;
  }

  const parsedLines = new ParsedLines(sourceCode.text);

  cache.set(sourceCode, parsedLines);
  return parsedLines;
}
