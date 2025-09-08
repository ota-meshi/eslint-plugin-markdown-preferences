
- ![foo]
- ![foo][]
- ![foo][x]
- Starts with `^`
    - ![^foo][x]
    - ![^foo]
    - ![^foo][]
    - ![x][^foo]
- Multi lines
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

[x]: /url
[foo]: /url
[ ^foo ]: /url
[foo bar]: /url
[^foo]: footnote
