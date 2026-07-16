# Card

A presentational **surface container** — a flex-column box wearing the native skin. It owns only the
**chrome** (background, border, shadow, radius); **spacing** is delegated to its slots. Composition,
not props, is how you build richer cards (the Open/Closed principle).

## Capabilities

- **Surface variants** — `default`, `outline`, `elevated`, `ghost` (chrome only: background / border /
  shadow). The border is always 1px (transparent by default) so switching variants causes no layout shift.
- **Padded slots** — `Card.Header` (title column), `Card.Body` (content, grows), `Card.Footer` (action
  row). They carry the padding; the root has none. Regions are grouped by **spacing alone** — no
  dividers. **Each slot throws if used outside `<Card>`.**
- **Edge-to-edge media** — a direct child (e.g. an `<img>`) sits flush against the edges and is clipped
  to the rounded corners (`overflow: hidden`). That is how you get a "cover image" card — no prop needed.
- **Composition over configuration** — there is no `title`/`image`/`href` prop. A media-and-text card is
  `<img>` + `Card.Body`; a clickable card is a _separate_ component composing this surface.
- **Block element** — renders a `<div>` and forwards every `<div>` attribute (`id`, `aria-*`, `onClick`,
  `ref`, `className`, …); same for each slot.
- **Headless skin** — the variant resolves to a BEM class via `@fubaritico-ds/variants`; colours,
  paddings and radii come from the overridable `--ui-card-*` component variables.

## Import

```tsx
import { Card } from '@fubaritico-ds/reference/Card'
// Compose with the DS text primitive for the content (otherwise text falls back to the browser serif):
import { Typography } from '@fubaritico-ds/reference/Typography'
```

## Basic usage

```tsx
<Card variant="outline">
  <Card.Body>Anything goes here.</Card.Body>
</Card>
```

## Variants & options

```tsx
<Card variant="default">…</Card>   {/* background + light shadow (sm) */}
<Card variant="outline">…</Card>   {/* border, no shadow */}
<Card variant="elevated">…</Card>  {/* background + a slightly stronger shadow (md) */}
<Card variant="ghost">…</Card>     {/* no chrome — a bare flex container */}

{/* All three slots: header (title) + body (grows) + footer (action row) — grouped by spacing, no dividers */}
<Card variant="outline">
  <Card.Header>
    <Typography variant="h6">Title</Typography>
  </Card.Header>
  <Card.Body>
    <Typography variant="body2">Description text.</Typography>
  </Card.Body>
  <Card.Footer>
    <button type="button">Action</button>
  </Card.Footer>
</Card>
```

## Edge cases

```tsx
// Cover image — direct child, clipped to the radius, edge-to-edge; the text below is padded:
<Card variant="elevated" style={{ inlineSize: '280px' }}>
  <img src="cover.jpg" alt="Mountain lake at dawn" style={{ inlineSize: '100%', display: 'block' }} />
  <Card.Body>
    <Typography variant="h6">Photo title</Typography>
    <Typography variant="caption">A short caption.</Typography>
  </Card.Body>
</Card>

// Bare content — intentionally UNPADDED (the text touches the edges); wrap it in Card.Body for padding:
<Card>Unpadded text</Card>

// Merge a consumer className (appended after the skin classes):
<Card className="my-utility">…</Card>
```

## Props

### `Card`

| Prop      | Type                                              | Default     | Description                           |
| --------- | ------------------------------------------------- | ----------- | ------------------------------------- |
| `variant` | `'default' \| 'outline' \| 'elevated' \| 'ghost'` | `'default'` | Visual surface variant (chrome only). |

Plus all native `<div>` attributes (`ComponentProps<'div'>`, including `ref` and `className`).

### `Card.Header` · `Card.Body` · `Card.Footer`

Each accepts the standard `<div>` props (`CardSlotProps = ComponentProps<'div'>`, including `ref` and
`className`). They take no variant of their own — appearance is fixed by the skin.

## Accessibility

- The Card is a **generic container** (`<div>`, no role). It is **not interactive**: don't wire `onClick`
  on it as a substitute for a button/link — keyboard and screen-reader users won't reach it. A clickable
  card is a separate component built on a real control.
- A **cover image** is content: give it a meaningful `alt` (or `alt=""` if purely decorative).
- The card draws **no dividers** between regions — structure is conveyed by spacing only. Carry the
  meaning in **semantic content** (e.g. a heading via `Typography` inside `Card.Header`), not by layout.

## Notes

> **Warning** — `Card.Header`, `Card.Body` and `Card.Footer` **throw** if rendered outside a `<Card>`.
> They are not general-purpose padded boxes; they only exist as slots of this surface.

> **Note** — a bare `<Card>text</Card>` has **no padding** (the text touches the edges). This is
> deliberate: padding lives in the slots so media can go edge-to-edge. Wrap content in `Card.Body`.

> **Note** — to re-skin a single card, override the `--ui-card-*` variables (e.g.
> `--ui-card-radius`, `--ui-card-shadow`, `--ui-card-body-padding`); to re-skin all of them, override a
> token (e.g. `--color-card`, `--color-border`).
