# Listbox

Two **presentational primitives** for listbox-style popups — `ListboxList` (the scrollable `<ul>`
surface) and `ListboxItem` (a `<li role="option">`). They own the **look only**: positioning, ARIA
wiring and keyboard handling belong to the composer (`Menu`, `Typeahead`).

## Capabilities

- **Surface** — `ListboxList` renders the popover card: border, radius, shadow, inner padding, capped
  height with vertical scroll.
- **Item states** — `ListboxItem` shows **idle** (hoverable), **active** (the keyboard/hover cursor),
  **selected** (the persistent current choice, bolded) and **disabled** (dimmed, non-interactive).
  `isActive` wins over `isSelected`; a `disabled` item shows neither highlight, only the dimming.
- **Colour schemes** — `variant="light"` (default) and `variant="dark"`, for menus on light or dark
  surfaces.
- **Headless skin** — states resolve to BEM classes via `@fubaritico-ds/variants`; colours/paddings
  come from the overridable `--ui-listbox-*` component variables. States are **neutral greys** (dark
  text on progressively stronger greys), never colour-only.
- **Composable, ARIA-agnostic** — both forward every native attribute (`id`, `aria-*`, `ref`, event
  handlers). The consumer supplies `role="listbox"`, `aria-activedescendant`, ids and key handling.

## Import

```tsx
import { ListboxList, ListboxItem } from '@fubaritico-ds/reference/Listbox'
```

## Basic usage

```tsx
<ListboxList aria-label="Rows per page">
  <ListboxItem>10</ListboxItem>
  <ListboxItem isSelected>20</ListboxItem>
  <ListboxItem>30</ListboxItem>
</ListboxList>
```

## Variants & options

```tsx
// Item states:
<ListboxItem>Idle</ListboxItem>
<ListboxItem isActive>Active (keyboard cursor)</ListboxItem>
<ListboxItem isSelected>Selected (current choice)</ListboxItem>
<ListboxItem disabled>Disabled</ListboxItem>

// Dark scheme (pass variant to BOTH the list and its items):
<ListboxList variant="dark">
  <ListboxItem variant="dark" isActive>On a dark surface</ListboxItem>
</ListboxList>
```

## Edge cases

```tsx
// isActive wins over isSelected — the cursor highlight takes over:
<ListboxItem isActive isSelected>Focused while selected</ListboxItem>

// A disabled item ignores active/selected — only the dimming shows:
<ListboxItem disabled isActive isSelected>Unavailable</ListboxItem>

// Empty surface:
<ListboxList aria-label="No options" />
```

## Props

### `ListboxList` (extends `ComponentProps<'ul'>`)

| Prop      | Type                | Default   | Description                   |
| --------- | ------------------- | --------- | ----------------------------- |
| `variant` | `'light' \| 'dark'` | `'light'` | Colour scheme of the surface. |

### `ListboxItem` (extends `Omit<ComponentProps<'li'>, 'children'>`)

| Prop         | Type                | Default   | Description                                     |
| ------------ | ------------------- | --------- | ----------------------------------------------- |
| `variant`    | `'light' \| 'dark'` | `'light'` | Colour scheme.                                  |
| `isActive`   | `boolean`           | `false`   | Keyboard/hover cursor highlight.                |
| `isSelected` | `boolean`           | `false`   | Persistent selected highlight (bolded).         |
| `disabled`   | `boolean`           | `false`   | Non-interactive + dimmed; sets `aria-disabled`. |
| `children`   | `ReactNode`         | —         | Item content (required).                        |

## Accessibility

- `ListboxItem` renders `role="option"` and sets `aria-disabled` when `disabled`. The **consumer** must
  provide the surrounding `role="listbox"` (on the list or a parent), `aria-activedescendant` pointing
  at the active option's `id`, unique `id`s, and the keyboard model (arrows, Enter, Escape).
- States are conveyed by **contrast + weight**, not hue alone (WCAG 1.4.1). The active/selected greys
  are dark-text-on-grey and clear AA.

## Notes

> **Note** — these are **visual primitives**, not a full listbox widget. They carry no keyboard,
> focus or `aria-activedescendant` logic — compose them inside `Menu` / `Typeahead` (which own that),
> or wire the ARIA/keyboard yourself.

> **Note** — pass `variant` to **both** `ListboxList` and each `ListboxItem`. The list styles the
> surface; each item styles itself — they don't inherit the scheme from one another.

> **Note** — the dark scheme reaches into the primitive neutral scale (no semantic on-dark tokens
> yet); it will repoint to `--color-on-dark-*` tokens when the Drawer/bottom-sheet work mints them.
