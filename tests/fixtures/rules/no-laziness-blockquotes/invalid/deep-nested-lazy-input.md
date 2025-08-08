# Invalid: Deeply nested with lazy continuation at various levels

> Level 1 start
> > Level 2 start  
> > > Level 3 start
Level 3 lazy line (missing > > >) - REPORTED
> > > Level 3 continues
Level 3 lazy line (missing > > >) - REPORTED (new violation sequence)
> > Level 3 lazy line (looks like level 2, but missing >) - REPORTED
Level 3 lazy line (missing > > >) - not reported (consecutive violation)
> Level 3 lazy line (looks like level 1, but missing > >) - not reported (consecutive violation)
