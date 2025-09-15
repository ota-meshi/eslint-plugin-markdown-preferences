# Contributing Guide

Thank you for your interest in this project! Contributions are welcome. Please follow the guidelines below.

## Getting Started

- For bug reports and feature requests, please use [Issues](https://github.com/ota-meshi/eslint-plugin-markdown-preferences/issues).
  - Documentation improvements and suggestions are welcome, but general questions are not supported.
- Pull requests are welcome. Opening an Issue before submitting a PR is recommended for smooth collaboration.

## Proposing New Rules

- If you have an idea for a new rule, please open an Issue first to discuss it.
  - Please use the issue template <https://github.com/ota-meshi/eslint-plugin-markdown-preferences/issues/new?template=new_rule_request.yml>
- Provide a clear description of the rule, its purpose, and any specific requirements.
- Note that this project is focused on rules related to Markdown preferences, so please ensure your proposed rule aligns with this scope.\
  They may not accept rules specifically regarding common errors.\
  For example, the following rule is unacceptable:
  - Rules that exist in [`@eslint/markdown`].
  - New rules that may be accepted by [`@eslint/markdown`].\
    Please try proposing it in the [`@eslint/markdown`] repository first, and if it's not accepted there, we might add the rule to this package.

## Setting up the Development Environment

1. Fork the repository and clone it locally.
2. Install dependencies:

   ```sh
   npm install
   ```

3. Build the project:

   ```sh
   npm run build
   ```

## Adding a New Rule

- To add a new rule, use `npm run new -- <rule-name>` to generate a template, and make sure to do all of the following:
  - Add the implementation file to `src/rules/<rule-name>.ts`
  - Add the test to `tests/src/rules/<rule-name>.ts`
  - Add test fixture files to `tests/fixtures/rules/<rule-name>/invalid/` and `tests/fixtures/rules/<rule-name>/valid/`
  - Write documentation to `docs/rules/<rule-name>.md`

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
- Place configuration files as `_config.json` in the same directory. You may also use `xxx-config.json` for input-specific configs.
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

#### Running Tests

Run tests with:

```sh
npm test
```

To update snapshot files, run:

```sh
npm run test:update
```

Be sure to check that snapshot files reflect the correct results.

### Updating Rule Lists and Metadata

The rule list, metadata, and type definition files can be automatically generated. After adding or modifying rules, always run:

```sh
npm run update
```

This command will automatically update the rule list, metadata, and type definitions.

## Modifying Existing Rules

- When modifying existing rules, always update tests and documentation as needed.
- For rule testing, see the [Rule Testing](#rule-testing) section.
- If you change rule metadata, be sure to run `npm run update` to update the lists and type definitions.

## Testing

- After making changes, always add or update tests and ensure all tests pass.

```sh
npm test
```

## Documentation

- When adding new rules or features, update the relevant documentation under `docs/`.

## About `npm scripts`

This project provides various npm scripts to streamline development and release tasks. The main scripts are listed below:

| Script            | Description                                                |
| :---------------- | :--------------------------------------------------------- |
| build             | Build everything (including metadata and type definitions) |
| build:meta        | Generate rule metadata (for release)                       |
| build:tsdown      | Generate artifacts using tsdown                            |
| lint              | Run ESLint for code checks                                 |
| eslint-fix        | Run ESLint with auto-fix                                   |
| tsc               | TypeScript build (type check only)                         |
| test              | Run tests with Mocha                                       |
| cover             | Measure test coverage                                      |
| test:update       | Update snapshot tests                                      |
| update            | Run all code generation and formatting scripts             |
| new               | Generate a new rule template                               |
| docs:watch        | Preview documentation site locally                         |
| docs:build        | Build documentation site                                   |
| generate:version  | Generate version info (for release)                        |
| changeset:version | Run changelog and versioning tasks (for release)           |
| changeset:publish | Publish the package (for release)                          |

For more details, see the `scripts` section in package.json.

## Pull Request Process

1. Work on a branch created from `main`.
2. Describe your changes and reference related Issues in the PR description.
3. Make sure CI passes.
4. If needed, create a changeset file and describe the release note content.
   - Run `npm run changeset` to create a new changeset.
   - Choose the appropriate version type (major/minor/patch) based on your changes.
   - When including rule names in the changeset file, specify them accurately:
     - OK: `markdown-preferences/rule-name`
     - NG: `rule-name` (no prefix rule name is not allowed)

## Commit Messages

- Please follow [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/) for commit messages.
  - Example: `feat(rule): add new rule`, `fix: fix a bug`, etc.

## CI/CD & Automated Checks

- The following checks run automatically on PR creation and updates:
  - Lint (ESLint)
  - Type checking (TypeScript)
  - Unit tests (Mocha)
  - Build
- If any check fails, please review and fix the errors.

## FAQ & Troubleshooting

### Using ESLint in VSCode

This project's ESLint configuration includes rules from this package itself. You must run `npm run build` beforehand to ensure the rules are available for linting.

---

Thank you for your cooperation!

[`@eslint/markdown`]: https://github.com/eslint/markdown
