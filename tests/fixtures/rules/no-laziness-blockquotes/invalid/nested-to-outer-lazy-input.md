# Invalid: Lazy transition from nested to outer blockquote

> A
> > B
C

> First outer line  
> > Nested content
> > More nested content
> Back to outer level (but lazy for nested level)

> Another example
> > Deep nested
> > > Even deeper
> > Back to second level (but lazy for deeper level)
> Back to first level (but lazy for deeper level)
