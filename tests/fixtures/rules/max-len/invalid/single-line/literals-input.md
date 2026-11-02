# Literal contents must not be rewritten

A multiline `code
span` stays unchanged.

A multiline $math
span$ stays unchanged.

A [link](https://example.com
"multiline title") stays unchanged.

A [link](https://example.com "a title
with a newline") stays unchanged.

An ![image
description](image.png) stays unchanged.

A <span title="a
multiline attribute">tag</span> stays unchanged.

Text <!-- eslint markdown-preferences/heading-casing: off -->
must not move across a directive.

A safe paragraph
after the literals.
