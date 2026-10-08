# @fubaritico-ds/variants

Framework-agnostic resolvers that turn a component's props into the BEM class names of
`@fubaritico-ds/styles`.

**Pure TypeScript: no React, no DOM.** That is the point — the React reference, and later the Web
Component, Angular and Vue packages, all consume the same resolvers, so the variant-to-class
mapping exists once.

## Install

```bash
pnpm add @fubaritico-ds/variants
```

You rarely need it directly: `@fubaritico-ds/reference` depends on it. Install it when you render
the markup yourself — in another framework, in a server template, anywhere.

## Use

```ts
import { buttonVariants, PROGRESS_BAR_TRACK_CLASS } from '@fubaritico-ds/variants'

buttonVariants({ variant: 'primary', size: 'lg' })
// → 'ui-button ui-button--lg'
```

Two kinds of export:

- **Resolvers** (`buttonVariants`, `drawerVariants`, …) — CVA functions taking the variant axes and
  returning a class string. A default value emits **no** modifier, so the base class alone is the
  default look.
- **Class constants** (`PROGRESS_BAR_TRACK_CLASS`, `DRAWER_HEADER_CLASS`, …) — the element classes
  that have no axis to vary. Use them rather than retyping the strings: they are what keeps the
  markup and the skin from drifting.

The only dependency is `class-variance-authority`.
