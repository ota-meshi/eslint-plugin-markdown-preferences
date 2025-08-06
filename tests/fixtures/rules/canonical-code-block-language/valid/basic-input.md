# Valid Code Blocks

## Already Canonical

```js
console.log('This is already canonical');
```

```ts
const message: string = 'Already canonical';
```

```py
print("Already canonical")
```

## No Language Specified

```text
This has no language specified, so it's ignored by our rule
```

## Unmapped Language

```rs
// This language is not mapped, so it's allowed
fn main() {
    println!("Hello, Rust!");
}
```
