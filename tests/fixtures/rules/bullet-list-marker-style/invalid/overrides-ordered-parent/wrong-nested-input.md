# Overrides Ordered Parent Test

This tests overrides for unordered lists nested under ordered lists.

1. First ordered item
   * Nested unordered under ordered (override: asterisk)
   * Another nested unordered under ordered
2. Second ordered item
   - Nested unordered under ordered (should be asterisk)
   - Another nested unordered under ordered (should be asterisk)

- First unordered item
  - Nested unordered under unordered (default: asterisk)
  - Another nested unordered under unordered
- Second unordered item
  * Nested unordered under unordered (should be asterisk)
  * Another nested unordered under unordered (should be asterisk)
