# Parent Marker Override Wrong

This tests parent marker override configuration with wrong markers.

1. Level 1 with period
   1. Level 2 with period (should be parenthesis because parent uses period)
   2. Another level 2 with period (should be parenthesis)

1) Level 1 with parenthesis (different list, uses secondary marker)
   1) Level 2 with parenthesis (should be period because parent uses parenthesis)
   2) Another level 2 with parenthesis (should be period)

1. Level 1 with period (back to primary)
   1. Level 2 with period (should be parenthesis because parent uses period)
   2. Another level 2 with period (should be parenthesis)
