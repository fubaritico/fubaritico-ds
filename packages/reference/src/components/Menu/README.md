# Menu

A keyboard-navigable popup list. `Menu` owns the ARIA and keyboard model; the look comes from the
`Listbox` primitives it composes.

## Capabilities

- **Full keyboard model** — Arrow Up / Down (wrapping), Home, End, Enter / Space to select, Escape
  to close. Disabled items are skipped by traversal.
- **Virtual cursor** — the list itself holds focus and points at the active item through
  `aria-activedescendant`, so focus never leaves the list while arrowing.
- **Visible focus** — the focused list draws a `:focus-visible` ring from the skin.
- **Self-registering items** — `Menu.Item` publishes itself to the parent on mount, so traversal
  follows the declared `index` and never reaches an unmounted entry.
- **Scroll-into-view** — the active item keeps itself visible inside the scrollable list.
- **Selection highlight** — `selectedValue` marks one item `aria-selected`, distinct from the cursor.
- **Two colour schemes** — `variant="light"` (default) or `"dark"`, forwarded to the list AND items.
- **Composition guard** — `Menu.Item` throws outside a `<Menu>`.

> **N/A — positioning.** `Menu` is the list only; it does not place itself. Use `Dropdown`, which
> composes a trigger and a positioned surface around it.

## Import

```tsx
import { Menu } from '@fubaritico-ds/reference/Menu'
```

## Basic usage

```tsx
<Menu onSelect={(value) => console.warn(value)} aria-label="Actions">
  <Menu.Item index={0} value="edit">
    Edit
  </Menu.Item>
  <Menu.Item index={1} value="duplicate">
    Duplicate
  </Menu.Item>
  <Menu.Item index={2} value="delete">
    Delete
  </Menu.Item>
</Menu>
```

## Variants & options

A persistently selected entry:

```tsx
const [selected, setSelected] = useState('newest')

<Menu selectedValue={selected} onSelect={setSelected} aria-label="Sort by">
  <Menu.Item index={0} value="newest">Newest first</Menu.Item>
  <Menu.Item index={1} value="oldest">Oldest first</Menu.Item>
</Menu>
```

Dark surface:

```tsx
<Menu variant="dark" onSelect={handleSelect} aria-label="Actions">
  <Menu.Item index={0} value="edit">
    Edit
  </Menu.Item>
</Menu>
```

Disabled entries — kept in the DOM, skipped by the keyboard:

```tsx
<Menu onSelect={handleSelect} aria-label="Actions">
  <Menu.Item index={0} value="edit">
    Edit
  </Menu.Item>
  <Menu.Item index={1} value="archive" disabled>
    Archive
  </Menu.Item>
  <Menu.Item index={2} value="delete">
    Delete
  </Menu.Item>
</Menu>
```

Closing on Escape:

```tsx
<Menu
  onSelect={handleSelect}
  onClose={() => setOpen(false)}
  aria-label="Actions"
>
  <Menu.Item index={0} value="edit">
    Edit
  </Menu.Item>
</Menu>
```

## Edge cases

```tsx
{
  /* An empty menu renders the surface and simply ignores every key */
}
;<Menu aria-label="No actions" />

{
  /* Every item disabled — arrow keys are no-ops, nothing becomes active */
}
;<Menu aria-label="Nothing available">
  <Menu.Item index={0} value="a" disabled>
    Unavailable
  </Menu.Item>
</Menu>

{
  /* Rich item content: the value is what travels to onSelect, not the label */
}
;<Menu onSelect={handleSelect} aria-label="Actions">
  <Menu.Item index={0} value="edit">
    <Icon name="Pencil" size={16} /> Edit
  </Menu.Item>
</Menu>
```

## Props

### `Menu`

| Name            | Type                      | Default   | Description                                          |
| --------------- | ------------------------- | --------- | ---------------------------------------------------- |
| `selectedValue` | `string`                  | —         | Value of the persistently selected item.             |
| `variant`       | `'light' \| 'dark'`       | `'light'` | Colour scheme, forwarded to the list and every item. |
| `onSelect`      | `(value: string) => void` | —         | Called on click or Enter / Space.                    |
| `onClose`       | `() => void`              | —         | Called when Escape is pressed.                       |
| …`ListboxList`  | —                         | —         | Everything else lands on the `<ul>`.                 |

### `Menu.Item`

| Name       | Type        | Default | Description                                      |
| ---------- | ----------- | ------- | ------------------------------------------------ |
| `value`    | `string`    | —       | Value handed to `onSelect`. **Required.**        |
| `index`    | `number`    | —       | Position in the keyboard order. **Required.**    |
| `disabled` | `boolean`   | `false` | Non-interactive; skipped by arrow-key traversal. |
| `children` | `ReactNode` | —       | Item content.                                    |

## Accessibility

- The `<ul>` is `role="listbox"` with `tabIndex={0}`; items are `role="option"`. The cursor is
  published through `aria-activedescendant`, which is why focus stays on the list.
- **Give the menu an accessible name** — pass `aria-label`, or `aria-labelledby` pointing at your
  trigger. Nothing is inferred.
- `aria-selected` reflects `selectedValue`, not the keyboard cursor; the two are deliberately
  distinct states and are styled differently by the skin.
- Disabled items carry `aria-disabled` and stay in the DOM, so the list's length is stable for
  screen-reader users.
- The focus ring comes from the skin's `.ui-listbox:focus-visible`; it is keyboard-only.

## Notes

> **Warning** — `index` is yours to assign and must match the visual order. It is not derived from
> the children, so a wrong or duplicated `index` silently breaks arrow-key traversal.

> **Warning** — `Menu.Item` **throws** outside a `<Menu>`. It is not a standalone list row; for one,
> use `ListboxItem` directly.

> **Note** — `Menu` does not position itself and does not manage open/closed state. Both belong to
> the composer (see `Dropdown`). `onClose` only reports the Escape key.

> **Note** — every keypress re-renders all items, because the cursor lives in one context. That is
> fine for menu-sized lists; for hundreds of entries, prefer a virtualised list.
