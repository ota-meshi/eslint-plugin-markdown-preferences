import fs from "fs";
import path from "path";
import type { RuleTester } from "eslint";
import { fileURLToPath } from "url";
import eslintMarkdown from "@eslint/markdown";

const dirname = path.dirname(fileURLToPath(import.meta.url));
/**
 * Prevents leading spaces in a multiline template literal from appearing in the resulting string
 */
export function unIndent(strings: readonly string[]): string {
  const templateValue = strings[0];
  const lines = templateValue.split("\n");
  const minLineIndent = getMinIndent(lines);

  return lines.map((line) => line.slice(minLineIndent)).join("\n");
}

/**
 * for `code` and `output`
 */
export function unIndentCodeAndOutput([code]: readonly string[]): (
  args: readonly string[],
) => {
  code: string;
  output: string;
} {
  const codeLines = code.split("\n");
  const codeMinLineIndent = getMinIndent(codeLines);

  return ([output]: readonly string[]) => {
    const outputLines = output.split("\n");
    const minLineIndent = Math.min(
      getMinIndent(outputLines),
      codeMinLineIndent,
    );

    return {
      code: codeLines.map((line) => line.slice(minLineIndent)).join("\n"),
      output: outputLines.map((line) => line.slice(minLineIndent)).join("\n"),
    };
  };
}

/**
 * Get number of minimum indent
 */
function getMinIndent(lines: string[]) {
  const lineIndents = lines
    .filter((line) => line.trim())
    .map((line) => / */u.exec(line)![0].length);
  return Math.min(...lineIndents);
}

/**
 * Load test cases
 */
export async function loadTestCases(
  ruleName: string,
  _options?: any,
  additionals?: {
    valid?: (RuleTester.ValidTestCase | string)[];
    invalid?: RuleTester.InvalidTestCase[];
  },
): Promise<{
  valid: RuleTester.ValidTestCase[];
  invalid: RuleTester.InvalidTestCase[];
}> {
  const validFixtureRoot = path.resolve(
    dirname,
    `../fixtures/rules/${ruleName}/valid/`,
  );
  const invalidFixtureRoot = path.resolve(
    dirname,
    `../fixtures/rules/${ruleName}/invalid/`,
  );

  const valid = await Promise.all(
    listupInput(validFixtureRoot).map((inputFile) => getConfig(inputFile)),
  );

  const invalid = await Promise.all(
    listupInput(invalidFixtureRoot).map((inputFile) => getConfig(inputFile)),
  );

  if (additionals) {
    if (additionals.valid) {
      valid.push(...additionals.valid);
    }
    if (additionals.invalid) {
      invalid.push(...additionals.invalid);
    }
  }
  for (const test of valid) {
    if (!test.code) {
      throw new Error(`Empty code: ${test.filename}`);
    }
  }
  for (const test of invalid) {
    if (!test.code) {
      throw new Error(`Empty code: ${test.filename}`);
    }
  }
  return {
    valid,
    invalid,
  };
}

function listupInput(rootDir: string) {
  return [...itrListupInput(rootDir)];
}

function* itrListupInput(rootDir: string): IterableIterator<string> {
  for (const filename of fs.readdirSync(rootDir)) {
    if (filename.startsWith("_")) {
      // ignore
      continue;
    }
    const abs = path.join(rootDir, filename);
    if (/input\.(?:[cm]?[jt]s|vue|md)$/u.test(filename)) {
      yield abs;
    } else if (fs.statSync(abs).isDirectory()) {
      yield* itrListupInput(abs);
    }
  }
}

async function getConfig(inputFile: string) {
  const filename = path.relative(process.cwd(), inputFile);
  const code0 = fs.readFileSync(inputFile, "utf8");
  let code, config;
  let configFile: string = inputFile.replace(
    /input\.(?:[cm]?[jt]s|vue|md)$/u,
    "config.json",
  );
  if (!fs.existsSync(configFile)) {
    configFile = path.join(path.dirname(inputFile), "_config.json");
  }
  if (fs.existsSync(configFile)) {
    config = JSON.parse(fs.readFileSync(configFile, "utf8"));
  }
  if (config && typeof config === "object") {
    code = `/* ${filename} */\n${code0}`;
    return { ...(await adjustConfig(config, inputFile)), code, filename };
  }
  // inline config
  const configStr = /^\/\*(.*?)\*\//u.exec(code0);
  if (!configStr) {
    throw new Error("missing config");
  } else {
    code = code0.replace(/^\/\*(.*?)\*\//u, `/*${filename}*/`);
    try {
      config = configStr ? JSON.parse(configStr[1]) : {};
    } catch (e: any) {
      throw new Error(`${e.message} in @ ${inputFile}`);
    }
  }

  return { ...(await adjustConfig(config, inputFile)), code, filename };
}

async function adjustConfig(
  config: {
    languageOptions?: { parser: unknown };
    plugins?: Record<string, unknown>;
    language?: string;
  },
  inputFile: string,
): Promise<any> {
  const result = { ...config };
  if (result.languageOptions && result.languageOptions.parser) {
    const parser = result.languageOptions.parser;
    if (typeof parser === "string") {
      result.languageOptions = {
        ...result.languageOptions,
        parser: await import(parser).then((m) => m.default || m),
      };
    }
  }
  if (inputFile.endsWith(".md")) {
    result.plugins = {
      markdown: eslintMarkdown,
      ...result.plugins,
    };
    if (!result.language) {
      result.language = "markdown/commonmark";
    }
  }
  return result;
}
