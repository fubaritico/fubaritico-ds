# @fubaritico-ds/reference

The React components of the fubaritico design system. Tailwind-free: the look comes from
`@fubaritico-ds/styles`, a plain-CSS BEM skin driven by design tokens.

## Install

```bash
pnpm add @fubaritico-ds/reference @fubaritico-ds/styles @fubaritico-ds/tokens
```

`react` and `react-dom` are peers. `react-router-dom` and `next` are **optional** peers, needed
only by `LinkButton` and `NextLinkButton` respectively.

## Use

```ts
// once, at your application entry — the components import no CSS themselves
import '@fubaritico-ds/tokens/css'
import '@fubaritico-ds/styles'
```

```tsx
import { Button } from '@fubaritico-ds/reference/Button'
```

Import by subpath (`/Button`) or from the barrel — both work, the subpath keeps the bundle tighter.

## What is in here

27 components, each with its own README next to its build output:

```
dist/components/<Name>/README.md
```

Those READMEs are the real documentation: identity, capabilities, every variant, edge cases, a
props table, accessibility, and a **Notes** section listing the traps. Read the Notes — several
behaviours that look like bugs are documented decisions.

Atoms and molecules: Alert, Avatar, Badge, Button, Card, Checkbox, Dropdown, IconButton, Image,
Input, LinkButton, Listbox, NextLinkButton, Pagination, ProgressBar, Rating, Skeleton, Spinner,
Tooltip, Typography.
Overlays: BottomSheet, Drawer, Modal.
Composites: DataTable, Menu, Tabs, Typeahead.

Not shipped yet: `Carousel` and the `next/*` adapters (still on Tailwind, in the migration queue),
`DatePicker` and `Toast` (not written).

## Theming

Three levels: the `--ui-<block>-*` custom properties for one instance, the tokens for a whole
theme, and — because the skin sits in `@layer ui.components` — any unlayered rule of yours wins
outright.

Full guide, including the traps: see `INTEGRATION.md` at the repository root.
