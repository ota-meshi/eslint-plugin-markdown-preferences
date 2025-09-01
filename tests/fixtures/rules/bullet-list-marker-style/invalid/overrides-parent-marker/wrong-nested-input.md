# Overrides Parent Marker Test

This tests overrides based on parent marker.

- First level with dash
  + Nested under dash (override: plus)
  + Another nested under dash
- Another first level with dash
  * Nested under dash (should be plus)
  * Another nested under dash (should be plus)

* First level with asterisk
  - Nested under dash (default: dash)
  - Another nested under dash
* Another first level with asterisk
  * Nested under asterisk (should be dash)
  * Another nested under asterisk (should be dash)
