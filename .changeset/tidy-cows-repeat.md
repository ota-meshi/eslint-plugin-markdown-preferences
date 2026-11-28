---
"eslint-plugin-markdown-preferences": patch
---

fix: crash in `indent` rule when `listItems.relativeTo` is not `"taskListMarkerEnd"`

The `markdown-preferences/indent` rule threw `RangeError: Invalid count value` on task list items whenever `listItems.relativeTo` was set to `"markerStart"`, `"markerEnd"`, or `"taskListMarkerStart"`, because the indentation was always measured from the end of the task list marker regardless of the configured reference point.

`"taskListMarkerStart"` is now also implemented (previously it was accepted by the schema but behaved like `"markerEnd"`) and documented, and the documented default is corrected to `"taskListMarkerEnd"`.
