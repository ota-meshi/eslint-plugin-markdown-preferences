# Code Blocks with Extended Fences

## JavaScript with 4 backticks

````javascript
```js
console.log('nested code block');
```
````

````jsx {.example}
const Component = () => {
  return (
    <div>
      ```
      Some markdown in JSX
      ```
    </div>
  );
};
````

## TypeScript with 5 backticks

`````typescript {highlight: true}
const example = `
````markdown
# Nested markdown
````
`;
`````

`````tsx filename="example.tsx"
const Component = () => (
  <pre>
    ````js
    console.log('hello');
    ````
  </pre>
);
`````

## Python with 4 backticks

````python {.python}
def example():
    markdown = """
    ```python
    print("nested")
    ```
    """
    return markdown
````

## Shell with extended fences

````bash {copy: false}
cat << 'EOF'
```shell
echo "nested command"
```
EOF
````

````shell {theme: "dark"}
# Script with nested markdown
cat > README.md << 'EOF'
```bash
./script.sh
```
EOF
````

## YAML with extended fences

````yml {collapse: true}
documentation: |
  Example with code:
  ```yaml
  key: value
  ```
````
