# Multiple Overrides Wrong

This tests multiple level overrides with wrong markers.

1. Level 1 (period - correct)
   1. Level 2 (period - should be parenthesis per override)
      1) Level 3 (parenthesis - should be period per override)
         1) Level 4 (parenthesis - should be period, inherits from default)
      2) Another level 3 (parenthesis - should be period per override)
   2. Another level 2 (period - should be parenthesis per override)
      1) Level 3 (parenthesis - should be period per override)
      2) Another level 3 (parenthesis - should be period per override)
2. Another level 1 (period - correct)
