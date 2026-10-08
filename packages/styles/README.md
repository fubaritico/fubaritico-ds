# @fubaritico-ds/styles

The portable native skin of the fubaritico design system: **plain CSS**, no framework, no build
step on your side.

## Install

```bash
pnpm add @fubaritico-ds/styles @fubaritico-ds/tokens
```

`@fubaritico-ds/tokens` is a peer: this sheet reads its custom properties and renders unstyled
without it.

## Use

```ts
import '@fubaritico-ds/tokens/css' // first: the variables
import '@fubaritico-ds/styles' // then: the skin
```

That is the whole integration. The React components in `@fubaritico-ds/reference` emit the class
names this sheet defines; they import no CSS of their own, so loading it is your explicit choice.

## How it is built

- **BEM** — one block per component (`.ui-button`, `.ui-drawer`), elements with `__`, modifiers
  with `--`. Flat, single-class selectors; no nesting, no `!important`.
- **`@layer ui.components`** — the entire skin is layered, so **any unlayered rule you write beats
  it**, with no specificity war.
- **Component variables** — each block exposes `--ui-<block>-*` properties (colours, spacing,
  radius, motion). Redefining one re-skins that component surgically.
- **Logical properties** — `inline-size`, `inset-inline-start`, `padding-block`… so every component
  works in right-to-left without a second stylesheet.
- **Tokens only** — no hard-coded colour or dimension; everything resolves through
  `@fubaritico-ds/tokens`.

## Overriding, from narrowest to broadest

```css
/* one instance — set the component variable inline or in a scoped rule */
.checkout-progress {
  --ui-progress-bar-indicator-color: rebeccapurple;
}

/* one theme — redefine a token, every consumer follows */
:root {
  --color-primary: #1d4ed8;
}

/* anything — your rule is unlayered, so it wins */
.ui-button {
  letter-spacing: 0.02em;
}
```

## Note

The DS ships **no global reset**. Each block declares its own `font-family` and box model so it
survives in a host with no reset, but loose text outside a component uses your application's base
styles. Set a base font on your app shell.
