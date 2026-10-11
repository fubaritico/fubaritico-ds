# Dropdown

A select-like control: a trigger button that opens a floating menu of options. Composes the DS
`Button` (trigger) and `Menu` (options) — the keyboard model and option semantics come from `Menu`.

## Capabilities

- **Open/close** — click the trigger to toggle; opening moves focus into the menu. Closes on
  selection, outside-click and `Escape` (returning focus to the trigger), and when focus leaves it
  (Tab away).
- **Top layer** — the menu is a native `popover` rendered in place, in the browser's top layer:
  above every `z-index`, never clipped by an `overflow: hidden` ancestor, and usable **inside a
  `Modal`**. Anchored to the control in CSS, it opens below and **flips above** when there is no room;
  it is at least as wide as the control and aligns to its start or end edge (`position`).
- **Keyboard** — Arrow keys / Enter / Escape, inherited from the composed `Menu`. Inside a `Modal`,
  `Escape` closes the menu only, never the dialog.
- **Rich options** — per-option `disabled`, a leading colour `dot` (any CSS colour), a leading DS
  `icon`, a `dividerBefore` separator, and `destructive` (red) styling.
- **Customisation** — `trigger` replaces the default button content; `renderItem` replaces the default
  option content.

## Import

```tsx
import { Dropdown } from '@fubaritico/react/Dropdown'
```

## Basic usage

```tsx
const [value, setValue] = useState('newest')

<Dropdown
  label="Sort by"
  selectedValue={value}
  onSelect={setValue}
  options={[
    { value: 'newest', label: 'Newest' },
    { value: 'oldest', label: 'Oldest' },
    { value: 'az', label: 'A → Z' },
  ]}
/>
```

## Variants & options

```tsx
{
  /* Trigger button variant + size (forwarded to Button) */
}
;<Dropdown buttonVariant="secondary" buttonSize="sm" /* … */ />

{
  /* Menu aligned to the end edge of the trigger */
}
;<Dropdown position="right" /* … */ />

{
  /* Colour dots, icons, divider, destructive */
}
;<Dropdown
  selectedValue={value}
  onSelect={setValue}
  options={[
    { value: 'active', label: 'Active', color: 'green' },
    { value: 'paused', label: 'Paused', color: 'orange' },
    {
      value: 'archive',
      label: 'Archive',
      icon: 'Bookmark',
      dividerBefore: true,
    },
    { value: 'delete', label: 'Delete', destructive: true },
  ]}
/>
```

## Edge cases

```tsx
{
  /* Inside a Modal, in a clipping Card: nothing to do — the menu is in the top layer */
}
;<Modal isOpen={open} onClose={close} aria-label="New polity">
  <Card>
    <Card.Body>
      <Dropdown aria-label="Kind" /* … */ />
    </Card.Body>
  </Card>
</Modal>

{
  /* Custom trigger content */
}
;<Dropdown
  trigger={({ isOpen, selectedLabel }) => (
    <>
      {selectedLabel} {isOpen ? '▲' : '▼'}
    </>
  )}
  /* … */
/>

{
  /* Custom item rendering */
}
;<Dropdown
  renderItem={(o, { isSelected }) => (
    <span>
      {isSelected ? '✓ ' : ''}
      {o.label}
    </span>
  )} /* … */
/>
```

## Props / API

| Prop              | Type                                          | Default     | Description                                          |
| ----------------- | --------------------------------------------- | ----------- | ---------------------------------------------------- |
| `options`         | `readonly DropdownOption[]`                   | —           | Selectable options.                                  |
| `selectedValue`   | `string`                                      | —           | Currently selected value.                            |
| `onSelect`        | `(value: string) => void`                     | —           | Selection callback.                                  |
| `label`           | `string`                                      | —           | Text before the trigger.                             |
| `withPortal`      | `boolean`                                     | `false`     | Mount the menu at the end of `body` (rarely needed). |
| `position`        | `'left' \| 'right'`                           | `'left'`    | Menu edge alignment.                                 |
| `buttonVariant`   | `ButtonVariant`                               | `'outline'` | Trigger button variant.                              |
| `buttonSize`      | `ButtonSize`                                  | `'md'`      | Trigger button size.                                 |
| `buttonFullWidth` | `boolean`                                     | `!trigger`  | Trigger takes full width.                            |
| `trigger`         | `(p: { isOpen, selectedLabel }) => ReactNode` | —           | Custom trigger content.                              |
| `renderItem`      | `(o, { isSelected }) => ReactNode`            | —           | Custom item content.                                 |
| `aria-label`      | `string`                                      | —           | Trigger accessible name (defaults to label + value). |
| `menuAriaLabel`   | `string`                                      | —           | Menu accessible name.                                |

### `DropdownOption`

`value` · `label` · `disabled?` · `dividerBefore?` · `destructive?` · `color?` (CSS colour) ·
`icon?` (DS `IconName`).

## Accessibility

The pattern is a **button that opens a listbox** (`aria-haspopup="listbox"`), not a
`role="combobox"`: a screen reader announces a button, then a listbox, rather than a native select.

- Trigger: `aria-haspopup="listbox"`, `aria-expanded`, and `aria-controls` while the menu is open.
  Give it a name with `label` or `aria-label`.
- The listbox is named after the trigger, unless you pass `menuAriaLabel`.
- Opening (click, Enter, Space, Arrow Down / Up) moves focus to the listbox. The active option, carried by `aria-activedescendant`, starts on the selected option, or on the first enabled one.

| Key             | On the trigger                       | In the menu                                   |
| --------------- | ------------------------------------ | --------------------------------------------- |
| Enter / Space   | Opens                                | Selects the active option, focus to trigger   |
| Arrow Down / Up | Opens (back into the menu when open) | Moves the active option (wraps)               |
| Home / End      | —                                    | First / last enabled option                   |
| Escape          | Closes, while open                   | Closes, focus back to the trigger             |
| Tab             | —                                    | Leaves the menu and closes it, focus moves on |

- **Inside a `Modal`**, Escape is consumed while the menu is open: it closes the menu, never the
  dialog. The next Escape is the dialog's.
- Type-ahead (jumping to an option by typing its first letters) is not supported yet.

## Notes

> **Note** — `option.icon` must be a DS `IconName` (the original third-party icon set is not bundled).
> `option.color` is any CSS colour string (e.g. `'green'`, `'#0a7'`) rendered as a leading dot.

> **Note** — The mobile bottom-sheet presentation from the source component was **dropped**; the
> floating menu is used at all viewport widths. Re-add a responsive bottom-sheet once `BottomSheet`
> exists.

> **Warning** — `withPortal` is no longer needed to escape `overflow: hidden` or a `z-index`: the
> menu is in the top layer either way. Do not use it inside a `Modal` or a `Popover` — a menu mounted on
> `body` leaves their subtree: the dialog makes it inert, and a click in it light-dismisses the
> popover.

> **Note** — The menu is placed with CSS anchor positioning (Baseline 2026). In a browser without it,
> the menu opens centred in the viewport: still on top and usable, just not against the trigger.

> **Note** — The menu stays a DOM child of `.ui-dropdown`, so the `--ui-dropdown-*` vars you set
> there still reach it. `--ui-dropdown-z` is gone: the top layer ignores `z-index`.

> **Note** — The composed `Menu` is not yet on the native skin (it ships later in the migration);
> until then the menu surface inherits `Menu`'s current styling while the Dropdown glue is skinned.
