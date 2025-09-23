<!-- ✓ GOOD -->

::: info
This is an info box.
:::

::: code-group

```js [config.js]
export default {/* ... */}
```

```ts [config.ts]
const config: UserConfig = {
  // ...
}
export default config
```

:::

<!-- ✗ BAD -->

::: info

This is an info box.

:::

::: code-group
```js [config.js]
export default {/* ... */}
```

```ts [config.ts]
const config: UserConfig = {
  // ...
}
export default config
```
:::
