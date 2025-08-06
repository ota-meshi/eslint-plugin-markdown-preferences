# Code Blocks with Meta Information

## JavaScript with meta info

```javascript {highlight: [1, 3]}
console.log('Line 1');
const x = 1;
console.log('Line 3');
```

```jsx {.class #id}
const Component = () => <div>JSX with attributes</div>;
```

## TypeScript with meta info

```typescript {linenos=table}
const message: string = 'TypeScript with line numbers';
```

```tsx filename="Component.tsx"
const Component: React.FC = () => <div>TSX with filename</div>;
```

## Python with meta info

```python {.python-code startFrom="10"}
print("Python with class and line start")
```

## Shell with meta info

```bash {copy: false}
echo "Bash with copy disabled"
```

```shell {theme: "dark"}
echo "Shell with theme"
```

## YAML with meta info

```yml {collapse: true}
name: example
version: 1.0.0
```
