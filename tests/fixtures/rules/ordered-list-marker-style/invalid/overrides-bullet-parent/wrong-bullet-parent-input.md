# Bullet Parent Override Wrong

This tests override for ordered lists nested under bullet lists with wrong markers.

- Bullet list item
  1. Ordered list nested under bullet (should use parenthesis override)
  2. Another ordered item (should use parenthesis)
- Another bullet item
  1. Another ordered list under bullet (should use parenthesis override)
  2. Another ordered item (should use parenthesis)

1. Top-level ordered list (uses correct default period)
   1. Nested ordered list under ordered parent (uses correct default period)
   2. Another nested ordered item
2. Another top-level ordered item
