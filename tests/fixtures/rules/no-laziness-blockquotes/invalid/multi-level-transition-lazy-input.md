# Invalid: Multiple level transitions with lazy lines

> Level 1 start
> > Level 2 start
> > > Level 3 content
> > Level 3 lazy line (looks like level 2, but missing >) - REPORTED
Level 3 lazy line (missing > > >) - not reported (consecutive violation)

> Another test
> > Second level
> > > Third level  
> > > More third level
Level 3 lazy line (missing > > >) - REPORTED
> Back to first level properly
