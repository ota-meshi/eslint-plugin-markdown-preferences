# Invalid: Lazy consecutive nested transitions

> A
> > B
C (lazy for level 2)
> > D
E (lazy for level 2)

> First
> > Second  
> > > Third
> > Fourth (lazy for level 3)
Fifth (lazy for level 3)
> Sixth (lazy for level 3)

> Start
> > Nested
Continue (lazy for level 2)
> > Nested again
Final (lazy for level 2)
