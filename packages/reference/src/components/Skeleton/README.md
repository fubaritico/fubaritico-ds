# Skeleton

A **loading placeholder** — a tinted block with a shimmer sweep that stands in for content while it
loads. Presentational only, no state of its own; you size it to match the content it replaces.

## Capabilities

- **Shapes** — `rectangle` (default), `circle`, `line`. Each only changes the corner radius.
- **Sizing** — `width` / `height` accept any CSS length (`'200px'`, `'100%'`, `'3rem'`); `aspectRatio`
  (`'16 / 9'`, `'1 / 1'`) sets a ratio. All three are applied as inline styles, so the block has **no
  intrinsic size** — give it a width/height (or an aspect ratio with one dimension) to make it visible.
- **Corner control** — `rounded` (default `true`) rounds `rectangle`/`line`; `rounded={false}` squares
  them off. `circle` is always fully round and ignores `rounded`.
- **Themable shimmer (white-label)** — background, radius, shimmer colour and speed are the
  overridable `--ui-skeleton-*` component variables.
- **Reduced-motion aware** — under `prefers-reduced-motion: reduce` the shimmer is **removed** (the
  block alone conveys "loading"), unlike the Spinner whose motion is essential and only slows.
- **Native div** — forwards every `<div>` attribute (`id`, `aria-*`, `data-*`, `ref`, `className`,
  `style`, …).

## Import

```tsx
import { Skeleton } from '@fubaritico-ds/reference/Skeleton'
```

## Basic usage

```tsx
<Skeleton width="200px" height="1rem" />
```

## Variants & options

```tsx
// Shapes:
<Skeleton variant="rectangle" width="240px" height="120px" />
<Skeleton variant="circle" width="48px" height="48px" />
<Skeleton variant="line" width="100%" height="0.75rem" />

// Squared corners:
<Skeleton variant="rectangle" rounded={false} width="240px" height="120px" />

// Sized by aspect ratio (one dimension + a ratio):
<Skeleton width="100%" aspectRatio="16 / 9" />
```

## Edge cases

```tsx
// A multi-line text placeholder — repeat the line shape:
<div style={{ display: 'grid', gap: 8 }}>
  <Skeleton variant="line" width="100%" height="0.75rem" />
  <Skeleton variant="line" width="80%" height="0.75rem" />
  <Skeleton variant="line" width="60%" height="0.75rem" />
</div>

// An avatar + name block:
<div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
  <Skeleton variant="circle" width="40px" height="40px" />
  <Skeleton variant="line" width="120px" height="0.875rem" />
</div>

// Surgical re-skin via the component variables:
<Skeleton
  width="100%"
  height="1rem"
  style={{ '--ui-skeleton-bg': 'var(--color-secondary)' }}
/>
```

## Props

| Prop          | Type                                | Default       | Description                                                       |
| ------------- | ----------------------------------- | ------------- | ----------------------------------------------------------------- |
| `variant`     | `'rectangle' \| 'circle' \| 'line'` | `'rectangle'` | Shape — controls the corner radius only.                          |
| `width`       | `string`                            | —             | Inline size as any CSS length (e.g. `'200px'`, `'100%'`).         |
| `height`      | `string`                            | —             | Block size as any CSS length (e.g. `'1rem'`, `'40px'`).           |
| `aspectRatio` | `string`                            | —             | Aspect ratio (e.g. `'16 / 9'`, `'1 / 1'`).                        |
| `rounded`     | `boolean`                           | `true`        | Round the corners (`rectangle`/`line`); `circle` is always round. |

Plus all native `<div>` attributes (`ComponentProps<'div'>`, including `ref`, `className`, `style`).

## Accessibility

- The Skeleton is **presentational** — it renders a plain `<div>` with **no role**. It does not
  announce anything on its own.
- Put the busy semantics on the **region being loaded**, not on each placeholder: wrap the loading
  area in `aria-busy="true"` (and a `role="status"`/live region if you want an announcement), then
  swap the skeletons for content once loaded.
- Hide purely decorative placeholders from assistive tech with `aria-hidden="true"` when the busy
  region already conveys the loading state.

## Notes

> **Note** — the Skeleton has **no intrinsic size**. Pass `width`/`height` (or `aspectRatio` with one
> dimension); otherwise the block collapses to 0 and is invisible.

> **Note** — `width`/`height` are **CSS length values** (`'100%'`, `'200px'`), not utility classes.
> They map to the logical `inline-size`/`block-size`, so they follow the writing direction.

> **Warning** — don't leave a Skeleton mounted as permanent decoration. It represents content that is
> _loading_; replace it with the real content as soon as that content is available.
