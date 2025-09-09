# Destination styles

## Links

- [foo](/bare-url)
- [foo](/bare-url 'with title')

### Empty

- [foo]()

### Bare destination with special characters

- [foo](/bare-url/with-last-backslash\ 'with title')
- [foo](/bare-url/with-last-backslashs\\ 'with title')
- [foo](/bare-url/with-last-backslashs\\\ 'with title')

### Pointy bracketed destination with special characters

- [foo](</pointy-bracketed-url/ with whitespaces>)
<!-- - [foo](</pointy-bracketed-url/with-balanced-parentheses()>) -->
- [foo](</pointy-bracketed-url/with-single-opening-paren(>)
- [foo](</pointy-bracketed-url/with-single-closing-paren)>)
<!-- - [foo](</pointy-bracketed-url/with-balanced-(parentheses)()>) -->
<!-- - [foo](</pointy-bracketed-url/with-(balanced-(parentheses)())>) -->
- [foo](</pointy-bracketed-url/with-(unbalanced-(parentheses)>)
- [foo](</pointy-bracketed-url/with-(unbalanced))-(parentheses))>)

## Images

- ![foo](/bare-url)
- ![foo](/bare-url 'with title')

### Empty

- ![foo]()

### Bare destination with special characters

- ![foo](/bare-url/with-last-backslash\ 'with title')
- ![foo](/bare-url/with-last-backslashs\\ 'with title')
- ![foo](/bare-url/with-last-backslashs\\\ 'with title')

### Pointy bracketed destination with special characters

- ![foo](</pointy-bracketed-url/ with whitespaces>)
<!-- - ![foo](</pointy-bracketed-url/with-balanced-parentheses()>) -->
- ![foo](</pointy-bracketed-url/with-single-opening-paren(>)
- ![foo](</pointy-bracketed-url/with-single-closing-paren)>)
<!-- - ![foo](</pointy-bracketed-url/with-balanced-(parentheses)()>) -->
<!-- - ![foo](</pointy-bracketed-url/with-(balanced-(parentheses)())>) -->
- ![foo](</pointy-bracketed-url/with-(unbalanced-(parentheses)>)
- ![foo](</pointy-bracketed-url/with-(unbalanced))-(parentheses))>)

## Definitions

[a]: /bare-url
[b]: /bare-url 'with title'

### Empty

[empty]: <>

### Bare definitions destination with special characters

[e]: /bare-url/with-last-backslash\ 'with title'
[f]: /bare-url/with-last-backslashs\\ 'with title'
[g]: /bare-url/with-last-backslashs\\\ 'with title'

### Pointy bracketed destination with special characters

[h]: </pointy-bracketed-url/ with whitespaces>
<!-- [i]: </pointy-bracketed-url/with-balanced-parentheses()> -->
[j]: </pointy-bracketed-url/with-single-opening-paren(>
[k]: </pointy-bracketed-url/with-single-closing-paren)>
<!-- [l]: </pointy-bracketed-url/with-balanced-(parentheses)()> -->
<!-- [m]: </pointy-bracketed-url/with-(balanced-(parentheses)())> -->
[n]: </pointy-bracketed-url/with-(unbalanced-(parentheses)>
[o]: </pointy-bracketed-url/with-(unbalanced))-(parentheses))>
