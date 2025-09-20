import type { DefaultTheme, UserConfig } from "vitepress";
import { defineConfig } from "vitepress";
import path from "path";
import { fileURLToPath } from "url";
import eslint4b from "vite-plugin-eslint4b";
import type { RuleModule } from "../../src/types.js";
import { transformerTwoslash } from "@shikijs/vitepress-twoslash";
import { createTwoslasher as createTwoslasherESLint } from "twoslash-eslint";
import eslintMarkdown from "@eslint/markdown";
import { compareCategories } from "../../tools/lib/categories.ts";

const dirname = path.dirname(fileURLToPath(import.meta.url));

function ruleToSidebarItem({
  meta: {
    docs: { ruleId, ruleName },
  },
}: RuleModule): DefaultTheme.SidebarItem {
  return {
    text: ruleId,
    link: `/rules/${ruleName}`,
  };
}

export default async (): Promise<UserConfig<DefaultTheme.Config>> => {
  const { rules } = (await import("../../src/utils/rules.js")) as {
    rules: RuleModule[];
  };

  const categories = [
    ...new Set<string>(
      rules
        .filter((rule) => !rule.meta.deprecated)
        .map((rule) => rule.meta.docs.listCategory),
    ),
  ].sort(compareCategories);

  const plugin = await import("../../src/index.js").then((m) => m.default || m);
  return defineConfig({
    base: "/eslint-plugin-markdown-preferences/",
    title: "eslint-plugin-markdown-preferences",
    outDir: path.join(dirname, "./dist/eslint-plugin-markdown-preferences"),
    description: "ESLint plugin that enforces our markdown preferences.",
    head: [],

    vite: {
      plugins: [eslint4b()],
      define: {
        "process.env.NODE_DEBUG": "false",
      },
    },
    markdown: {
      codeTransformers: [
        transformerTwoslash({
          explicitTrigger: false, // Required for v-menu to work.
          langs: ["md"],
          filter(lang, code) {
            if (lang.startsWith("md")) {
              return code.includes("eslint");
            }
            return false;
          },
          errorRendering: "hover",
          twoslasher: createTwoslasherESLint({
            eslintConfig: [
              {
                files: [
                  "*",
                  "**/*",
                  ...["md"].flatMap((ext) => [`*.${ext}`, `**/*.${ext}`]),
                ],
                plugins: {
                  markdown: eslintMarkdown,
                  "markdown-preferences": plugin,
                },
                language: "markdown-preferences/extended-syntax",
                languageOptions: {
                  frontmatter: "yaml", // Or pass `"toml"` or `"json"` to enable TOML or JSON front matter parsing.
                },
              },
            ],
          }),
        }) as never,
      ],
    },

    lastUpdated: true,
    themeConfig: {
      logo: "/logo.svg",
      search: {
        provider: "local",
        options: {
          detailedView: true,
        },
      },
      editLink: {
        pattern:
          "https://github.com/ota-meshi/eslint-plugin-markdown-preferences/edit/main/docs/:path",
      },
      nav: [
        { text: "Introduction", link: "/" },
        { text: "User Guide", link: "/user-guide/" },
        { text: "Rules", link: "/rules/" },
        {
          text: "Playground",
          link: "https://eslint-online-playground.netlify.app/#eslint-plugin-markdown-preferences",
        },
      ],
      socialLinks: [
        {
          icon: "github",
          link: "https://github.com/ota-meshi/eslint-plugin-markdown-preferences",
        },
      ],
      sidebar: {
        "/rules/": [
          {
            text: "Rules",
            items: [{ text: "Available Rules", link: "/rules/" }],
          },
          ...categories.map((category) => ({
            text: `${category} Rules`,
            collapsed: false,
            items: rules
              .filter(
                (rule) =>
                  !rule.meta.deprecated &&
                  rule.meta.docs.listCategory === category,
              )
              .map(ruleToSidebarItem),
          })),

          // Rules in no category.
          ...(rules.some((rule) => rule.meta.deprecated)
            ? [
                {
                  text: "Deprecated",
                  collapsed: false,
                  items: rules
                    .filter((rule) => rule.meta.deprecated)
                    .map(ruleToSidebarItem),
                },
              ]
            : []),
        ],
        "/appendix/": [
          {
            text: "Appendix",
            items: [
              {
                text: "Comparison With markdownlint Rules",
                link: "/appendix/comparison-with-markdownlint-rules",
              },
            ],
          },
        ],
        "/": [
          {
            text: "Guide",
            items: [
              { text: "Introduction", link: "/" },
              { text: "User Guide", link: "/user-guide/" },
              { text: "Rules", link: "/rules/" },
              { text: "Appendix", link: "/appendix/" },
            ],
          },
        ],
      },
    },
  });
};
