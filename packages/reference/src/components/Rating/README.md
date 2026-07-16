# Rating

A display-only, grayscale score readout: a presentational primitive that renders a numeric score as a
progress ring or a row of stars — no interaction, no state.

## Capabilities

- **Two looks**: `circle` (an SVG progress ring with a centred value) and `stars` (five stars filled to
  the score fraction, with a trailing value).
- **Sizes**: `sm` / `md` (default) / `lg` — drives the visual dimensions and the value font-size.
- **Score handling**: `value` is clamped to `[0, max]`; `max` defaults to `10` (a TMDB-style score), and
  `max={100}` switches the readout to a percentage (ring) or a `/10` score (stars).
- **Grayscale by design**: the fill is the DS emphasis (neutral.900), the empty/track is a light grey.
  There is **no traffic-light** threshold — the score is read from the fill proportion AND the number.
- **Accessibility wired in**: `role="img"` with a computed accessible name announced even when the
  number is hidden; the visual is decorative (`aria-hidden`).
- **White-label**: re-skin via the `--ui-rating-*` component vars (or the `--color-rating-*` tokens) —
  e.g. set `--ui-rating-indicator-color: gold` to bring back golden stars.

## Import

```tsx
import { Rating } from '@fubaritico-ds/reference/Rating'
```

## Basic usage

```tsx
<Rating value={7.5} />
```

## Variants & options

```tsx
// Looks
<Rating value={7.5} variant="circle" /> // default
<Rating value={7.5} variant="stars" />

// Sizes
<Rating value={7.5} size="sm" />
<Rating value={7.5} size="md" /> // default
<Rating value={7.5} size="lg" />

// Percentage scale (ring shows 75, stars show 7.5)
<Rating value={75} max={100} />
<Rating value={75} max={100} variant="stars" />

// Hide the number (the accessible name is kept)
<Rating value={7.5} showValue={false} />
```

## Edge cases

```tsx
// Out-of-range values are clamped to [0, max]
<Rating value={15} max={10} /> // shows 10.0
<Rating value={-5} max={10} /> // shows 0.0

// Boundaries
<Rating value={0} />          // empty
<Rating value={10} max={10} /> // full

// Localise / override the accessible name
<Rating value={7.5} aria-label="Note : 7,5 sur 10" />
```

## Props / API

| Prop         | Type                                  | Default    | Description                                                  |
| ------------ | ------------------------------------- | ---------- | ------------------------------------------------------------ |
| `value`      | `number`                              | _required_ | The score; clamped to `[0, max]`.                            |
| `max`        | `number`                              | `10`       | Maximum value; `100` switches to a percentage/`÷10` read.    |
| `variant`    | `'circle' \| 'stars'`                 | `'circle'` | Visual look.                                                 |
| `size`       | `'sm' \| 'md' \| 'lg'`                | `'md'`     | Size (visual dimensions + value font-size).                  |
| `showValue`  | `boolean`                             | `true`     | Render the numeric value.                                    |
| `aria-label` | `string`                              | computed   | Accessible name; defaults to `Rating: <value> out of <max>`. |
| _...rest_    | `Omit<ComponentProps<'div'>, 'role'>` | —          | Native `<div>` attributes (forwarded); `role` is locked.     |

## Accessibility

- The root is `role="img"` with an accessible name — by default `Rating: <value> out of <max>` — so the
  score is announced even when `showValue` is `false`.
- The visual (the SVG ring or the star icons) is **decorative** (`aria-hidden`); it never carries the
  name itself.
- The score is conveyed by the **fill proportion + the number**, never by colour alone (WCAG 1.4.1) —
  so the grayscale palette loses no information versus a coloured one.

## Notes

> **Note** — Rating is **display-only**: it has no click/keyboard interaction and does not collect
> input. For a user-settable rating, compose a dedicated interactive control instead.

> **Note** — with `max={100}` the **ring** shows a whole percentage (e.g. `75`) while the **stars** show
> the equivalent `/10` score (e.g. `7.5`). Pick the look that matches the scale you want to communicate.

> **Note** — the palette is grayscale by default. To theme it (e.g. brand-coloured stars, or a
> traffic-light ring), override `--ui-rating-indicator-color` / `--ui-rating-track-color` — no prop needed.

> **Warning** — the default accessible name (`"Rating: <value> out of <max>"`) is **English**. For a
> non-English product, always pass a localised `aria-label` (e.g. `aria-label="Note : 7,5 sur 10"`).
