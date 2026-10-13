# @fubaritico/tokens

The design decisions of the fubaritico design system — colour, spacing, radius, typography, motion
— authored once in DTCG JSON and compiled by Style Dictionary into several outputs.

## Install

```bash
pnpm add @fubaritico/tokens
```

## Use

```ts
import '@fubaritico/tokens/css' // CSS custom properties on :root
```

That is what `@fubaritico/styles` reads, and it is the only import most projects need. Also
available:

```ts
import { color, spacing } from '@fubaritico/tokens' // the same values as a typed JS object
import '@fubaritico/tokens/tailwind' // a Tailwind v4 @theme block, if your app uses Tailwind
```

The Tailwind output exists for **your** application; the design system itself uses none.

## Shape

- **Primitives** — the raw scales: `--color-primitive-neutral-0` … `-950`, `--spacing-0` … `-96`.
  Twenty steps of grey, because the DS default is neutral.
- **Colour roles** — what a colour paints (`tokens/color/roles.json`). Named
  `--color-<what it paints>-<role>[-<state>]`:

  | Family | Roles |
  | --- | --- |
  | Surfaces | `surface`, `surface-raised`, `surface-sunken`, `overlay` |
  | Inverse panels (`dark` variants) | `surface-inverse`, `-hover`, `-pressed`, `-selected`, `text-on-inverse`, `-strong`, `-secondary`, `fill-on-inverse`, `-hover`, `border-on-inverse` |
  | Fills and states | `fill`, `fill-hover`, `hover`, `pressed`, `selected`, `track` |
  | Text | `text`, `text-secondary`, `text-placeholder`, `text-disabled`, `text-on-primary`, `text-on-destructive`, `text-on-success`, `text-destructive` |
  | Borders and focus | `border`, `border-strong`, `border-strong-hover`, `focus` |
  | Action and status | `primary`, `primary-hover`, `destructive`, `destructive-hover`, `success`, `success-hover`, `warning` |
  | Component-specific | `table-header-text`, `rating-filled`, `rating-empty`, `skeleton-shimmer` |
  | Theme-invariant | `white` (legacy Tailwind) |

The skin reads roles only (the colour picker's invariant chrome aside), roles read primitives. A
theme redefines the roles; it never redefines the grey scale, so `neutral-0` always means white.

## Note on naming

The CSS output dash-ifies dotted names: `spacing.0.5` becomes `--spacing-0-5`. The **Tailwind**
output keeps the dots (`--spacing-0.5`) to match Tailwind's own `p-0.5` convention. The two
outputs diverge on purpose.
