# Button

The design-system plain `<button>` wearing the native skin — a **framework-free presentational
primitive** (zero routing/data coupling). For navigation, use the separate `LinkButton` /
`NextLinkButton` siblings, which wear the same skin via a thin routing adapter.

## Capabilities

- **Visual variants** — `primary`, `secondary`, `destructive`, `outline`, `ghost`.
- **Sizes** — `sm`, `md`, `lg`. The icon size tracks the button size automatically.
- **Optional icon** — `icon` (an `IconName`) with `iconPosition` `left` / `right`; the side flip is
  handled by the skin, not by reordering the DOM.
- **Native button behaviour** — forwards every `<button>` attribute (`type`, `disabled`, `onClick`,
  `form`, `aria-*`, `ref`, …). `disabled` and `:focus-visible` are styled by the skin.
- **Headless skin** — variant/size resolve to BEM classes via `@fubaritico-ds/variants`; colours are
  driven by the overridable `--ui-button-*` component variables.

## Import

```tsx
import { Button } from '@fubaritico-ds/reference/Button'
```

## Basic usage

```tsx
<Button onClick={handleSave}>Save</Button>
```

## Variants & options

```tsx
<Button variant="primary">Primary</Button>
<Button variant="secondary">Secondary</Button>
<Button variant="destructive">Delete</Button>
<Button variant="outline">Outline</Button>
<Button variant="ghost">Ghost</Button>

<Button size="sm">Small</Button>
<Button size="md">Medium</Button>
<Button size="lg">Large</Button>

<Button icon="Plus">Add item</Button>
<Button icon="ArrowRight" iconPosition="right">Next</Button>

<Button disabled>Disabled</Button>
```

## Edge cases

```tsx
// Submit a form (native type):
<form onSubmit={onSubmit}>
  <Button type="submit">Submit</Button>
</form>

// Icon-only is NOT this component — use IconButton so the control keeps an accessible name.

// Merge a consumer className (appended after the skin classes):
<Button className="my-utility">Themed</Button>
```

## Props

| Prop           | Type                                                                | Default     | Description                            |
| -------------- | ------------------------------------------------------------------- | ----------- | -------------------------------------- |
| `variant`      | `'primary' \| 'secondary' \| 'destructive' \| 'outline' \| 'ghost'` | `'primary'` | Visual variant.                        |
| `size`         | `'sm' \| 'md' \| 'lg'`                                              | `'md'`      | Button size; the icon size follows it. |
| `icon`         | `IconName`                                                          | —           | Optional leading/trailing icon.        |
| `iconPosition` | `'left' \| 'right'`                                                 | `'left'`    | Icon side relative to the label.       |

Plus all native `<button>` attributes (`ComponentProps<'button'>`, including `ref`, `type`,
`disabled`, `onClick`, and `className`).

## Accessibility

- The button's **accessible name comes from its `children`** — always give text content. For an
  icon-only control use `IconButton` (which requires an `aria-label`), not `Button` with only an `icon`.
- `disabled` removes the button from the tab order and blocks activation. If you need a disabled-looking
  but still-focusable control (e.g. to show a tooltip explaining why), use `aria-disabled` + your own
  guard instead.
- Default `type` is the native `submit` inside a `<form>` — set `type="button"` for non-submitting
  actions to avoid accidental form submission.

## Notes

> **Note** — `Button` is intentionally **framework-free**: it does not render an anchor and pulls no
> router. For navigation use `LinkButton` (React Router) or `NextLinkButton` (Next.js) — same skin,
> separately importable, so a plain button never drags a routing dependency.

> **Warning** — `icon` without visible `children` produces a button with **no accessible name**.
> Reach for `IconButton` instead; it makes the `aria-label` mandatory.
