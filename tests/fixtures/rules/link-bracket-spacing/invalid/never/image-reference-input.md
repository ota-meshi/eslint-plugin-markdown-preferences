
- ![ foo ]
- ![foo]
- ![ foo]
- ![foo ]
- ![      foo     ]
- ![ foo ][]
- ![foo][]
- ![ foo][]
- ![foo ][]
- ![      foo     ][]
- ![ foo ][x]
- ![foo][x]
- ![ foo][x]
- ![foo ][x]
- ![      foo     ][x]
- ![foo][ x ]
- ![foo][x]
- ![foo][ x]
- ![foo][x ]
- ![foo][      x     ]
- Starts with `^`
    - ![ ^foo ][x]
    - ![^foo][x]
    - ![ ^foo ]
    - ![^foo]
    - ![ ^foo ][]
    - ![^foo][]
    - ![x][ ^foo ]
    - ![x][^foo]
- Multi lines
  - ![ foo
      bar ][x]
  - ![foo
      bar][x]
  - ![
      foo
      bar
    ][x]
  - ![  
      foo
      bar  
    ][x]
  - ![ foo
      bar ]
  - ![foo
      bar]
  - ![
      foo
      bar
    ]
  - ![  
      foo
      bar  
    ]
  - ![ foo
      bar ][]
  - ![foo
      bar][]
  - ![
      foo
      bar
    ][]
  - ![  
      foo
      bar  
    ][]
  - ![x][ foo
      bar ]
  - ![x][foo
      bar]
  - ![x][
      foo
      bar
    ]
  - ![x][  
      foo
      bar  
    ]
- Empty
  - ![][x]
  - ![ ][x]
  - ![      ][x]

[x]: /url
[foo]: /url
[ ^foo ]: /url
[foo bar]: /url
[^foo]: footnote
