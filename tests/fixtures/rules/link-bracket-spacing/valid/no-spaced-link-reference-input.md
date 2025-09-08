
- [foo]
- [foo][]
- [foo][x]
- Starts with `^`
    - [ ^foo ][x]
    - [^foo][x]
    - [ ^foo ]
    - [^foo]
    - [ ^foo ][]
    - [^foo][]
    - [x][^foo]
- Image link
  - [![x](x.png)][x]
  - [![x]][x]
- Multi lines
  - [foo
      bar][x]
  - [
      foo
      bar
    ][x]
  - [  
      foo
      bar  
    ][x]
  - [foo
      bar]
  - [
      foo
      bar
    ]
  - [  
      foo
      bar  
    ]
  - [foo
      bar][]
  - [
      foo
      bar
    ][]
  - [  
      foo
      bar  
    ][]
  - [x][foo
      bar]
  - [x][
      foo
      bar
    ]
  - [x][  
      foo
      bar  
    ]

[x]: /url
[foo]: /url
[ ^foo ]: /url
[foo bar]: /url
[^foo]: footnote
