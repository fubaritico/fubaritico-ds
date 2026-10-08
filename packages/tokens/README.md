# @fubaritico-ds/tokens

The design decisions of the fubaritico design system — colour, spacing, radius, typography, motion
— authored once in DTCG JSON and compiled by Style Dictionary into several outputs.

## Install

```bash
pnpm add @fubaritico-ds/tokens
```

## Use

```ts
import '@fubaritico-ds/tokens/css' // CSS custom properties on :root
```

That is what `@fubaritico-ds/styles` reads, and it is the only import most projects need. Also
available:

```ts
import { color, spacing } from '@fubaritico-ds/tokens' // the same values as a typed JS object
import '@fubaritico-ds/tokens/tailwind' // a Tailwind v4 @theme block, if your app uses Tailwind
```

The Tailwind output exists for **your** application; the design system itself uses none.

## Shape

- **Primitives** — the raw scales: `--color-primitive-neutral-0` … `-950`, `--spacing-0` … `-96`.
  Twenty steps of grey, because the DS default is neutral.
- **Semantic roles** — what a value is _for_: `--color-primary`, `--color-destructive`,
  `--color-foreground-muted`, `--color-border`.

Components read role tokens, roles read primitives. Redefine a role to re-theme broadly; redefine
a primitive to shift a whole scale.

## Note on naming

The CSS output dash-ifies dotted names: `spacing.0.5` becomes `--spacing-0-5`. The **Tailwind**
output keeps the dots (`--spacing-0.5`) to match Tailwind's own `p-0.5` convention. The two
outputs diverge on purpose.
