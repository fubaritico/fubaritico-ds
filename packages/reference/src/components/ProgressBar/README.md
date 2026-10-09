# ProgressBar

A determinate progress readout: a neutral track filled in proportion to a value, with an optional
legend line underneath. Purely presentational — it holds no state and runs no timer.

## Capabilities

- **Determinate progress** — `value` against `max` (default `100`), clamped to `[0, max]`.
- **Required accessible name** — `aria-label` is mandatory at compile time; add `aria-labelledby`
  when a visible label exists (ARIA gives it precedence).
- **Announced value** — `aria-valuenow` / `aria-valuemin` / `aria-valuemax` on the track, plus an
  optional `valueText` for a human-readable reading (`aria-valuetext`).
- **Colour intent** — a closed `variant` axis: `default` (neutral), `success`, `destructive`.
- **Three thicknesses** — `size`: `sm`, `md` (default), `lg`.
- **Legend slots** — `metaStart` / `metaEnd` render under the bar, pinned to each inline edge.
- **RTL-correct** — the fill grows from the inline-start edge and flips with the writing direction.
- **Motion-aware** — the fill transition is dropped under `prefers-reduced-motion`.
- **Composable** — extends `<div>`, so `className`, `id`, `data-*` and friends reach the root.

> **N/A — interaction & keyboard.** A progress bar is a live region readout, not a control: it is
> not focusable and has no keyboard model. For a user-settable value, use a slider instead.

## Import

```tsx
import { ProgressBar } from '@fubaritico/react/ProgressBar'
```

## Basic usage

```tsx
<ProgressBar value={62} aria-label="Upload progress" />
```

## Variants & options

Colour intent — neutral by default, semantic colour is opt-in:

```tsx
<ProgressBar value={62} aria-label="Upload" />
<ProgressBar value={100} variant="success" aria-label="Backup" />
<ProgressBar value={85} variant="destructive" aria-label="Disk usage" />
```

Thickness:

```tsx
<ProgressBar value={40} size="sm" aria-label="Thin" />
<ProgressBar value={40} size="md" aria-label="Default" />
<ProgressBar value={40} size="lg" aria-label="Thick" />
```

A custom scale, with a readable announcement:

```tsx
<ProgressBar
  value={3}
  max={7}
  valueText="step 3 of 7"
  aria-label="Setup wizard"
/>
```

The legend line:

```tsx
<ProgressBar
  value={62}
  aria-label="Upload"
  metaStart="62%"
  metaEnd="3 days left"
/>
```

Labelled by visible text on the page — `aria-labelledby` wins, `aria-label` stays the fallback:

```tsx
<>
  <span id="quota-label">Storage quota</span>
  <ProgressBar
    value={1.2}
    max={4}
    valueText="1.2 GB of 4 GB"
    aria-label="Storage quota"
    aria-labelledby="quota-label"
  />
</>
```

Re-skinning one instance without touching the theme:

```tsx
<ProgressBar
  value={62}
  aria-label="Brand"
  style={
    { '--ui-progress-bar-indicator-color': 'rebeccapurple' } as CSSProperties
  }
/>
```

## Edge cases

```tsx
{/* Out-of-range values are clamped, never overflow the track */}
<ProgressBar value={150} aria-label="Clamped to full" />
<ProgressBar value={-20} aria-label="Clamped to empty" />

{/* A non-positive max cannot define a ratio — the bar renders empty rather than NaN */}
<ProgressBar value={5} max={0} aria-label="No range" />

{/* A single legend slot keeps its own edge */}
<ProgressBar value={10} aria-label="Starting" metaEnd="almost there" />

{/* Legend slots take nodes, not just strings */}
<ProgressBar value={10} aria-label="Rich" metaStart={<strong>10%</strong>} />
```

## Props

| Name                     | Type                                      | Default     | Description                                                       |
| ------------------------ | ----------------------------------------- | ----------- | ----------------------------------------------------------------- |
| `value`                  | `number`                                  | —           | Current value. Clamped to `[0, max]`. **Required.**               |
| `max`                    | `number`                                  | `100`       | Maximum value. A non-positive value renders an empty bar.         |
| `variant`                | `'default' \| 'success' \| 'destructive'` | `'default'` | Colour intent of the indicator.                                   |
| `size`                   | `'sm' \| 'md' \| 'lg'`                    | `'md'`      | Track thickness.                                                  |
| `valueText`              | `string`                                  | —           | Human-readable value, mapped to `aria-valuetext`.                 |
| `metaStart`              | `ReactNode`                               | —           | Legend content at the inline-start edge.                          |
| `metaEnd`                | `ReactNode`                               | —           | Legend content at the inline-end edge.                            |
| `aria-label`             | `string`                                  | —           | Accessible name. **Required.**                                    |
| `aria-labelledby`        | `string`                                  | —           | Id of the labelling element; takes precedence over `aria-label`.  |
| …`ComponentProps<'div'>` | —                                         | —           | Everything else lands on the root element.                        |

## Accessibility

- `role="progressbar"` sits on the **track**, carrying `aria-valuenow`, `aria-valuemin` and
  `aria-valuemax`. The root is a plain wrapper so the legend text is not swallowed by the role.
- **The accessible name is mandatory and type-checked**: `aria-label` is a required prop, so an
  unnamed bar fails to compile. When the label is already visible on screen, add `aria-labelledby`
  pointing at it — ARIA gives it precedence and `aria-label` remains the fallback.
- Assistive technology derives a percentage from `value`/`max`. When the number the user sees is not
  that percentage, pass `valueText` — the announcement becomes "step 3 of 7" instead of "43%".
- Colour is never the only channel: the filled proportion carries the meaning, and `variant` only
  changes the hue of a bar that already reads by length.
- The fill transition is removed under `prefers-reduced-motion` (WCAG 2.3.3).
- A non-positive `max` collapses the announced maximum to `0`, so `aria-valuemax` is never published
  below `aria-valuemin`.

## Notes

> **Warning** — there is no `color` prop. The `variant` axis is a closed set; anything else is a
> deliberate override of `--ui-progress-bar-indicator-color` on the instance or in your theme. An
> open colour name could not be type-checked and silently produced a transparent bar when the token
> did not exist.

> **Note** — this is the **determinate** bar only. There is no indeterminate (unknown-duration) mode
> and no buffered second segment yet. For an unknown-duration wait, use `Spinner`.

> **Note** — the component stretches to its container's inline size and has no intrinsic width.
> Constrain the parent, or set `inline-size` on the root through `className` / `style`.

> **Note** — `metaStart` / `metaEnd` are named for the **logical** edges, not physical ones. In a
> right-to-left context `metaStart` renders on the right, matching the direction the bar fills.

> **Warning** — the legend slots are decorative text, not part of the accessible name. If the legend
> carries the only readable statement of progress, mirror it into `valueText`.

> **Warning** — `role="progressbar"` is **not a live region**: screen readers do not proactively
> announce `aria-valuenow` / `aria-valuetext` changes while the bar is unfocused. For a bar that
> updates on its own (an upload, a long job), pair it with your own visually-hidden
> `aria-live="polite"` region announcing milestones or completion — this is the consumer's job,
> deliberately, because the component holds no state and cannot know when an announcement is wanted.
> See [WCAG technique ARIA25](https://www.w3.org/WAI/WCAG22/Techniques/aria/ARIA25).
