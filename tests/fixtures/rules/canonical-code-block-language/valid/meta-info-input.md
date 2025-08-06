# Code Blocks with Meta Information (Valid)

## JavaScript with meta info (canonical)

```js {highlight: [1, 3]}
console.log('Line 1');
const x = 1;
console.log('Line 3');
```

## TypeScript with meta info (canonical)

```ts {linenos=table}
const message: string = 'TypeScript with line numbers';
```

## Python with meta info (canonical)

```py {.python-code startFrom="10"}
print("Python with class and line start")
```

## Shell with meta info (canonical)

```sh {copy: false}
echo "Bash with copy disabled"
```

## YAML with meta info (canonical)

```yaml {collapse: true}
name: example
version: 1.0.0
```
