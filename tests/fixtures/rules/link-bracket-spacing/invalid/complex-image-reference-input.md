# Complex Image Reference Cases for Coverage

## Cases that should trigger link-bracket-spacing violations

![alt text with spaces][]

![ alt text with leading space][]

![alt text with trailing space ][]

![ alt text with both spaces ][]

![  multiple   spaces  ][]

![valid alt text][ reference with spaces ]

![valid alt text][reference with spaces ]

![ valid alt text ][reference]

![complex alt text][ complex reference ]

[alt text with spaces]: http://example.com
[alt text with leading space]: http://example.com
[alt text with trailing space]: http://example.com
[alt text with both spaces]: http://example.com
[multiple spaces]: http://example.com
[reference with spaces]: http://example.com
[complex reference]: http://example.com
[reference]: http://example.com
