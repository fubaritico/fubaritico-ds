# Dropdown

A select-like control: a trigger button that opens a floating menu of options. Composes the DS
`Button` (trigger) and `Menu` (options) — the keyboard model and option semantics come from `Menu`.

## Capabilities

- **Open/close** — click the trigger to toggle; closes on outside-click and `Escape`, returning focus
  to the trigger.
- **Floating menu** — opens below the trigger and **auto-flips above** when there isn't room; can
  render in a `Portal` (`withPortal`) to escape `overflow:hidden` ancestors; aligns to the trigger's
  left or right edge (`position`).
- **Keyboard** — Arrow keys / Enter / Escape, inherited from the composed `Menu`.
- **Rich options** — per-option `disabled`, a leading colour `dot` (any CSS colour), a leading DS
  `icon`, a `dividerBefore` separator, and `destructive` (red) styling.
- **Customisation** — `trigger` replaces the default button content; `renderItem` replaces the default
  option content.

## Import

```tsx
import { Dropdown } from '@fubaritico-ds/reference/Dropdown'
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
  /* Right-aligned menu, rendered in a Portal */
}
;<Dropdown position="right" withPortal /* … */ />

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
| `withPortal`      | `boolean`                                     | `false`     | Render the menu in a Portal.                         |
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

- Trigger: `aria-haspopup="listbox"`, `aria-expanded`, `aria-controls` (when open).
- Provide a meaningful `aria-label` (or `label`) so the trigger has a clear accessible name.
- The menu and its keyboard model are provided by `Menu` (focus stays managed; `Escape` closes).

## Notes

> **Note** — `option.icon` must be a DS `IconName` (the original third-party icon set is not bundled).
> `option.color` is any CSS colour string (e.g. `'green'`, `'#0a7'`) rendered as a leading dot.

> **Note** — The mobile bottom-sheet presentation from the source component was **dropped**; the
> floating menu is used at all viewport widths. Re-add a responsive bottom-sheet once `BottomSheet`
> exists.

> **Note** — The composed `Menu` is not yet on the native skin (it ships later in the migration);
> until then the menu surface inherits `Menu`'s current styling while the Dropdown glue is skinned.
