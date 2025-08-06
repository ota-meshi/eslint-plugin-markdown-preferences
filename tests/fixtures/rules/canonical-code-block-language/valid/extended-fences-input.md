# Code Blocks with Extended Fences (Valid)

## JavaScript with 4 backticks (canonical)

````js
```js
console.log('nested code block');
```
````

````js {.example}
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

## TypeScript with 5 backticks (canonical)

`````ts {highlight: true}
const example = `
````markdown
# Nested markdown
````
`;
`````

`````ts filename="example.tsx"
const Component = () => (
  <pre>
    ````js
    console.log('hello');
    ````
  </pre>
);
`````

## Python with 4 backticks (canonical)

````py {.python}
def example():
    markdown = """
    ```python
    print("nested")
    ```
    """
    return markdown
````

## Shell with extended fences (canonical)

````sh {copy: false}
cat << 'EOF'
```shell
echo "nested command"
```
EOF
````

````sh {theme: "dark"}
# Script with nested markdown
cat > README.md << 'EOF'
```bash
./script.sh
```
EOF
````

## YAML with extended fences (canonical)

````yaml {collapse: true}
documentation: |
  Example with code:
  ```yaml
  key: value
  ```
````
