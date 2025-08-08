# Example of complex nested lazy blockquotes

> Level 1 start
> > Level 2 start
> > > Level 3 start
> > This looks like level 2 text but is actually lazy for level 3
> > > Level 3 continues
> This looks like level 1 text but is actually lazy for level 3
> > This looks like level 2 text but is actually lazy for level 3
> This looks like level 1 text but is actually lazy for level 3.
> However, this level 1-looking content will not be reported
> because the previous line's intent (level 2 vs level 3) is ambiguous and cannot be correctly determined.
> If the previous line intended level 2, this content might be level 1 or level 2.
> But if the previous line intended level 3, this content might be level 1 or level 3.
