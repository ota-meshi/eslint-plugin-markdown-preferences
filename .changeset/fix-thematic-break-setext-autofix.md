---
"eslint-plugin-markdown-preferences": patch
---

fix(thematic-break-character-style): insert a blank line before the break when fixing to `---` right after a paragraph, so it stays a thematic break instead of becoming a setext heading underline (skipped inside list items, where a blank line would make the list loose)
