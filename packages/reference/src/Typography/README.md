# Typography

A neutral, semantic, **polymorphic** text primitive (modeled on MUI Typography). It sets type
_structure_ only — family, size, weight, line-height, alignment — and **never `color`** (colour is
inherited from the parent).

## Capabilities

- **Semantic + neutral variants** — `h1`–`h6`, `body1` (16px, default), `body2` (14px, compact),
  `caption`, `overline`, `label`, `inherit`. Each maps to a sensible default element, overridable per instance.
- **Polymorphic** — choose the rendered element with `as` (e.g. `as="span"`), or remap a whole
  variant with `variantMapping`. `as` wins over `variantMapping`.
- **`inherit` variant** — applies no type styles at all; the text inherits everything from its parent.
- **Capabilities** — `gutterBottom` (bottom margin), `noWrap` (single-line ellipsis), `align`.
- **Headless** — sets no colour; drop it into any context and it takes the surrounding `currentColor`.
- **Themeable** — per-variant size/weight/line-height come from the semantic `--typography-*` tokens.

## Import

```tsx
import { Typography } from '@fubaritico-ds/reference/Typography'
```

## Basic usage

```tsx
<Typography variant="h1">Page title</Typography>
<Typography>Body copy is the default variant.</Typography>
```

## Variants & options

```tsx
<Typography variant="h2">Section heading</Typography>
<Typography variant="overline">Section</Typography>
<Typography variant="caption">Helper text</Typography>
<Typography variant="body1">Default paragraph (16px).</Typography>
<Typography variant="body2" gutterBottom>Compact paragraph (14px) with a bottom gutter.</Typography>
<Typography variant="h3" align="center">Centered heading</Typography>
<Typography noWrap title="Full untruncated text…">Truncated on overflow…</Typography>
```

## Edge cases

```tsx
// Polymorphism — render the visual h2 as a real <h1> for document outline:
<Typography variant="h2" as="h1">Visually h2, semantically h1</Typography>

// Remap several variants at once:
<Typography variant="h1" variantMapping={{ h1: 'div' }}>Styled h1, rendered as div</Typography>

// `inherit` applies no type styles — it takes the parent's font entirely:
<h2><Typography variant="inherit">Matches the surrounding h2</Typography></h2>
```

## Props

| Prop             | Type                                                                                 | Default     | Description                                                     |
| ---------------- | ------------------------------------------------------------------------------------ | ----------- | --------------------------------------------------------------- |
| `variant`        | `'h1'…'h6' \| 'body1' \| 'body2' \| 'caption' \| 'overline' \| 'label' \| 'inherit'` | `'body1'`   | Visual type role. `inherit` applies no styles.                  |
| `as`             | `ElementType`                                                                        | from map    | Override the rendered element. Wins over `variantMapping`.      |
| `variantMapping` | `Partial<Record<TypographyVariant, ElementType>>`                                    | —           | Per-instance override of the default variant → element mapping. |
| `align`          | `'inherit' \| 'left' \| 'center' \| 'right' \| 'justify'`                            | `'inherit'` | Text alignment.                                                 |
| `gutterBottom`   | `boolean`                                                                            | `false`     | Adds a bottom margin.                                           |
| `noWrap`         | `boolean`                                                                            | `false`     | Truncates to a single line with an ellipsis.                    |

Plus all native attributes of the rendered element (`ComponentProps<C>`, including `ref` and
`className`). When `as="label"`, `htmlFor` is **required**.

## Accessibility

- Pick the variant for **style** and `as` for **semantics**: e.g. a visually-small `h2` that must be
  the page's first heading → `<Typography variant="h2" as="h1">`. Don't let the visual scale drive the
  document outline.
- `color` is inherited — ensure the inherited foreground meets **4.5:1** contrast against its
  background (smaller roles like `caption`/`overline` are normal-size text under WCAG, not large).

## Notes

> **Warning** — `variant="label"` renders a `<span>`, NOT a `<label>`. A `<label>` with no associated
> control is a WCAG 1.3.1 violation. To render a real form label, use `as="label"` — `htmlFor` is then
> **required** at compile time: `<Typography as="label" htmlFor="email">Email</Typography>`.

> **Note** — `noWrap` truncates with an ellipsis. Provide a `title` (or another accessible name) so the
> full text stays available when it's clipped.
