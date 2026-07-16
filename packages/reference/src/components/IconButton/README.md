# IconButton

A circular, **icon-only** control — an **extension of `Button` by composition** (Open/Closed): it
renders a `Button` to reuse every variant, hover, focus and disabled behaviour, then layers on the
icon-fitting shape. `Button` itself is never modified.

## Capabilities

- **Reuses Button's variants** — `primary`, `secondary`, `outline`, `ghost` resolve to the exact same
  colours as `Button` (no duplicated recipe), plus the IconButton-only **`ghost-dark`** on-dark variant
  for dark surfaces (e.g. a dark drawer header).
- **Sizes** — `sm`, `md`, `lg` → a square 32 / 40 / 48 px button; the icon size tracks it automatically
  (reuses Button's icon-size map: 16 / 20 / 24 px).
- **Circular icon-fitting shape** — square box, `border-radius: full`, zero padding, centered glyph,
  added via `@fubaritico-ds/variants` (`.ui-icon-button`) **mixed onto** `.ui-button`.
- **Native button behaviour** — forwards every `<button>` attribute (`type`, `disabled`, `onClick`,
  `form`, `ref`, …). `disabled` and `:focus-visible` are styled by the reused Button skin.
- **Required accessible name** — `aria-label` is mandatory (the icon is decorative / `aria-hidden`).

## Import

```tsx
import { IconButton } from '@fubaritico-ds/reference/IconButton'
```

## Basic usage

```tsx
<IconButton icon="Heart" aria-label="Like" onClick={handleLike} />
```

## Variants & options

```tsx
<IconButton icon="Plus" aria-label="Add" variant="primary" />
<IconButton icon="Plus" aria-label="Add" variant="secondary" />
<IconButton icon="Plus" aria-label="Add" variant="outline" />
<IconButton icon="Plus" aria-label="Add" variant="ghost" />   {/* default */}

{/* on-dark — for dark surfaces only */}
<div style={{ background: '#171717' }}>
  <IconButton icon="XMark" aria-label="Close" variant="ghost-dark" />
</div>

<IconButton icon="Heart" aria-label="Like" size="sm" />
<IconButton icon="Heart" aria-label="Like" size="md" />
<IconButton icon="Heart" aria-label="Like" size="lg" />

<IconButton icon="XMark" aria-label="Close" disabled />
```

## Edge cases

```tsx
// Button stays closed: ghost-dark is an IconButton-only extension, NOT a Button variant.
<IconButton icon="ChevronLeft" aria-label="Previous" variant="ghost-dark" />

// Merge a consumer className (appended after the skin classes):
<IconButton icon="Star" aria-label="Favorite" className="my-utility" />

// Ref-as-prop (React 19) is forwarded to the underlying <button>:
<IconButton icon="Play" aria-label="Play" ref={buttonRef} />
```

## Props

| Prop         | Type                                                               | Default   | Description                                             |
| ------------ | ------------------------------------------------------------------ | --------- | ------------------------------------------------------- |
| `icon`       | `IconName`                                                         | —         | **Required.** The icon to render, centered.             |
| `variant`    | `'primary' \| 'secondary' \| 'outline' \| 'ghost' \| 'ghost-dark'` | `'ghost'` | Visual variant; reuses Button's, plus on-dark.          |
| `size`       | `'sm' \| 'md' \| 'lg'`                                             | `'md'`    | Square button size; the icon size follows it.           |
| `aria-label` | `string`                                                           | —         | **Required.** The accessible name (icon is decorative). |

Plus all native `<button>` attributes (`ComponentProps<'button'>`, including `ref`, `type`,
`disabled`, `onClick`, and `className`), minus `iconPosition` / `children` (icon-only).

## Accessibility

- The icon is **decorative** (`aria-hidden`); the button's accessible name comes **solely from
  `aria-label`**, which is therefore **required at compile time**.
- `disabled` removes the button from the tab order and blocks activation.
- For a button **with** a visible text label, use `Button` (with an `icon`), not `IconButton`.

## Notes

> **Warning** — `aria-label` is mandatory. An icon-only button with no label is invisible to screen
> readers; the type makes it a compile error to omit it.

> **Note** — `variant="ghost-dark"` is meant for **dark surfaces only** (it uses light-on-dark
> colours). On a light background its low-contrast text will be hard to read.

> **Note** — IconButton extends `Button` without modifying it (Open/Closed). It deliberately does **not**
> accept `iconPosition` or `children` — it is icon-only by design.
