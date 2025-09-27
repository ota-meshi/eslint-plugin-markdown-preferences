# Copilot Instructions for `eslint-plugin-markdown-preferences`

This document provides guidelines for AI coding agents to work efficiently in this repository.

Refer to [`CONTRIBUTING.md`] for additional details.

## Communication Guidelines

The maintainer is Japanese and may communicate with you in Japanese, but source code and documentation should be written in **English**.
If you are addressed in Japanese, please conduct the conversation in Japanese.

## Project Overview

`eslint-plugin-markdown-preferences` is an ESLint plugin designed to enforce consistent style and formatting in Markdown files. Key features include:

- Automatic formatting and style consistency for Markdown
- Conversion of specific words into inline code or links
- Flexible configuration options

## Proposing New Rules

- Provide a clear description of the rule, its purpose, and any specific requirements.
- Note that this project focuses on rules related to Markdown preferences. Ensure your proposed rule aligns with this scope.
  - Rules that already exist in [`@eslint/markdown`] are not accepted.
  - Rules that might be accepted by [`@eslint/markdown`] should be proposed there first. If not accepted, they may be added to this package.
- Please carefully check the existing rules in this plugin and do not propose rules that already exist.

## Development Workflow

### Adding a New Rule

1. Use `npm run new -- <rule-name>` to generate a template for the new rule.
2. Edit the following files to implement the rule:
   - Implementation: `src/rules/<rule-name>.ts`
   - Tests: `tests/src/rules/<rule-name>.ts`
   - Test fixtures: `tests/fixtures/rules/<rule-name>/`
   - Documentation: `docs/rules/<rule-name>.md`

When editing files, please note the following:

- Do not use the `any` type when implementing rules.
- Please use the provided utilities as much as possible when implementing rules.
- Respect the format of the initially generated documentation.
  - In particular, ensure that sample code and the order of sections are consistent with other documents.

### Rule Testing

#### Creating Test Fixtures

Test fixtures for rules should be organized as follows:

```plaintext
tests/fixtures/rules/<rule-name>/
├── invalid/             # Invalid cases
│   ├── xxx-input.md
│   ├── yyy-input.md
│   └── ...
└── valid/               # Valid cases
    ├── xxx-input.md
    ├── yyy-input.md
    └── ...
```

- Name input files descriptively, e.g., `multiple-heading-input.md`, `setext-heading-input.md`, etc.
- Place configuration files as `_config.json` in the same directory. You may also use `xxx-config.json` for input-specific (`xxx-input.md`) configs.
- **Configuration File Format:** All rule configuration files must follow the ESLint format with an `options` array:
  ```json
  {
    "options": [{ "mode": "fixed-line-length", "length": 30 }]
  }
  ```
  For complex configurations:
  ```json
  {
    "options": [
      {
        "listItems": {
          "first": 4,
          "rest": 2
        }
      }
    ]
  }
  ```
  **Important:** Do not use the direct format like `{ "mode": "fixed-line-length" }` as it will result in "Unexpected key" configuration errors during testing.
- You may create subdirectories such as `multiline/` or `spaces/` for different test cases.

  **Example:**

  ```plaintext
  tests/fixtures/rules/<rule-name>/
  ├── invalid/
  │   ├── multiline/
  │   │   ├── _config.json
  │   │   ├── xxx-input.md
  │   │   └── ...
  │   ├── yyy-input.md
  │   └── ...
  └── valid/
      ├── spaces/
      │   ├── _config.json
      │   ├── xxx-input.md
      │   └── ...
      ├── yyy-input.md
      └── ...
  ```

- If possible, it is recommended to add a level 1 heading at the beginning of each test case to describe the fixture.

#### Running Tests

Run tests with:

```sh
npm test
```

To update snapshot files, run:

```sh
npm run test:update
```

Ensure that snapshot files reflect the correct results.

#### Important: Snapshot Test Validation

**Critical:** When creating or modifying test fixtures in the `invalid/` directories, ensure that they actually produce ESLint errors. Test fixtures that result in "No errors" in snapshot files indicate incorrect test cases that don't properly exercise the rule.

- **Invalid fixtures must produce errors:** All files in `tests/fixtures/rules/<rule-name>/invalid/` should trigger the rule and produce lint errors.
- **Check snapshots after updates:** After running `npm run test:update`, review the generated snapshot files (`.eslintsnap`) to ensure:
  - No "No errors" entries exist for invalid test cases
  - Error messages are meaningful and match expected violations
  - Fixes (when applicable) are correctly applied
- **Common causes of "No errors":**
  - Markdown syntax that isn't recognized by the parser (e.g., `text>` instead of `> text`)
  - Test fixtures that don't actually violate the rule being tested
  - Configuration issues in test setup

If you encounter "No errors" in snapshots for invalid test cases, review and fix the test fixtures to ensure they contain valid Markdown that violates the specific rule being tested.

#### Updating Rule Lists and Metadata

The rule list, metadata, and type definition files can be automatically generated. After adding or modifying rules, always run:

```sh
npm run update
```

This command will automatically update the rule list, metadata, and type definitions.

### Modifying Existing Rules

- When modifying existing rules, always update tests and documentation as needed.
- For rule testing, see the `Rule Testing` section.
- If you change rule metadata, be sure to run `npm run update` to update the lists and type definitions.

## Important Scripts

Below are the main npm scripts useful for development:

| Script Name           | Description                    |
| :-------------------- | :----------------------------- |
| `npm run new`         | Generate a new rule template   |
| `npm run test`        | Run tests                      |
| `npm run cover`       | Generate test coverage report  |
| `npm run test:update` | Update snapshot tests          |
| `npm run update`      | Update metadata and rule lists |

Refer to [`CONTRIBUTING.md`] for more details.

[`@eslint/markdown`]: https://github.com/eslint/markdown
[`CONTRIBUTING.md`]: ../CONTRIBUTING.md
