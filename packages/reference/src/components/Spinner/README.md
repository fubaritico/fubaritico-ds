# Spinner

A **headless loading indicator** — a single spinning ring that inherits `currentColor`, so it adopts
the surrounding text colour wherever you drop it. Presentational only, no state of its own.

## Capabilities

- **Sizes** — `sm`, `md`, `lg`. The ring thickness scales with the size.
- **Colour-inheriting (headless)** — the ring uses `currentColor`; set `color` on (or above) the
  spinner to recolour it, or override the `--ui-spinner-*` component variables for a surgical re-skin.
- **Accessible by default** — renders `role="status"` with a `Loading` accessible name; pass
  `aria-label` to localise it.
- **Reduced-motion aware** — under `prefers-reduced-motion: reduce` the skin slows the spin right
  down instead of removing the only loading affordance.
- **Native div** — forwards every `<div>` attribute (`id`, `aria-*`, `data-*`, `ref`, `className`, …).

## Import

```tsx
import { Spinner } from '@fubaritico-ds/reference/Spinner'
```

## Basic usage

```tsx
<Spinner />
```

## Variants & options

```tsx
<Spinner size="sm" />
<Spinner size="md" />
<Spinner size="lg" />

// Recolour by setting the inherited text colour:
<div style={{ color: 'var(--color-primary)' }}>
  <Spinner />
</div>

// Localise the accessible name:
<Spinner aria-label="Chargement" />
```

## Edge cases

```tsx
// Inside a button — the spinner inherits the button's text colour automatically:
<button disabled>
  <Spinner size="sm" /> Saving…
</button>

// Surgical re-skin via the component variables:
<Spinner style={{ '--ui-spinner-indicator': 'var(--color-primary)' }} />
```

## Props

| Prop   | Type                   | Default | Description   |
| ------ | ---------------------- | ------- | ------------- |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'`  | Spinner size. |

Plus all native `<div>` attributes (`ComponentProps<'div'>`, including `ref`, `className`, and
`aria-label`).

## Accessibility

- Renders `role="status"`, an ARIA **live region** (`aria-live="polite"`): when it appears, assistive
  tech announces its accessible name. Keep that name meaningful — the default is `Loading`; localise
  it with `aria-label`.
- The spinner conveys "busy" **visually**; pair it with text (or the live-region announcement) so the
  state isn't colour/motion-only.
- Motion is reduced (slowed) automatically under `prefers-reduced-motion`.

## Notes

> **Note** — the ring colour is `currentColor`. To recolour it, set `color` on an ancestor (or the
> spinner itself), or override `--ui-spinner-indicator`. On a dark surface, set a light `color` so the
> ring stays visible.

> **Warning** — don't render a permanently-mounted Spinner as decoration: as a `role="status"` live
> region it will announce on mount. Mount it only while something is genuinely loading.
