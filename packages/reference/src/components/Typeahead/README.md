# Typeahead

A search field with a suggestion dropdown — the ARIA combobox pattern, as a compound component. You
own the data; `Typeahead` owns the interaction.

## Capabilities

- **Combobox semantics** — `role="combobox"` on the field, `role="listbox"` on the dropdown,
  `aria-expanded` / `aria-controls` / `aria-activedescendant` kept in sync.
- **Full keyboard model** — Arrow Down (opens, then moves), Arrow Up, Home, End, Enter to select,
  Escape to dismiss. Disabled suggestions are skipped.
- **Virtual cursor** — focus never leaves the input; the active option is pointed at by id.
- **Debounced search** — `debounceMs` throttles `onSearch`; the pending call is cancelled on unmount.
- **Minimum query length** — `minChars` (default `2`) gates both the search and the dropdown.
- **Click-outside dismissal** — including when the menu is portalled.
- **Top layer** — the dropdown is a native `popover` rendered in place, in the browser's top layer:
  above every `z-index`, never clipped by an `overflow: hidden` ancestor, and usable **inside a
  `Modal`** (Escape closes the dropdown, never the dialog). Anchored to the field in CSS: as wide as
  it, below, flipped above when there is no room. `portal` mounts it on `body` instead (rarely
  needed).
- **Match highlighting** — `Typeahead.Highlight` marks the matched substring by **weight**, not
  colour, so it survives a monochrome theme.
- **Empty state** — `Typeahead.Empty` renders a non-selectable row that keeps the listbox valid.
- **Two colour schemes** — `variant="light"` (default) or `"dark"`.
- **Composition guards** — every `Typeahead.*` part throws outside a `<Typeahead>`.

> **N/A — data fetching.** The component never fetches. `onSearch` tells you what to load; you
> render the results as children.

## Import

```tsx
import { Typeahead } from '@fubaritico/react/Typeahead'
```

## Basic usage

```tsx
const [results, setResults] = useState<Item[]>([])

<Typeahead onSearch={search} onSelect={pick} debounceMs={300}>
  <Typeahead.Input placeholder="Search…" icon="MagnifyingGlass" aria-label="Search products" />
  <Typeahead.Menu>
    {results.map((item, i) => (
      <Typeahead.Item key={item.id} value={item.id} index={i}>
        <Typeahead.Highlight>{item.label}</Typeahead.Highlight>
      </Typeahead.Item>
    ))}
  </Typeahead.Menu>
</Typeahead>
```

## Variants & options

An empty state when the query returns nothing:

```tsx
<Typeahead.Menu>
  {results.length > 0 ? (
    results.map((item, i) => (
      <Typeahead.Item key={item.id} value={item.id} index={i}>
        {item.label}
      </Typeahead.Item>
    ))
  ) : (
    <Typeahead.Empty>No results</Typeahead.Empty>
  )}
</Typeahead.Menu>
```

Inside a Modal, in a clipping Card — nothing to do, the dropdown is in the top layer:

```tsx
<Modal isOpen={open} onClose={close} aria-label="Find a polity">
  <Card>
    <Card.Body>
      <Typeahead onSearch={search} onSelect={pick}>
        …
      </Typeahead>
    </Card.Body>
  </Card>
</Modal>
```

Keeping the chosen label in the field instead of clearing it:

```tsx
<Typeahead clearOnSelect={false} onSearch={search} onSelect={pick}>
  …
</Typeahead>
```

Searching from the first character:

```tsx
<Typeahead minChars={1} onSearch={search} onSelect={pick}>
  …
</Typeahead>
```

Dark dropdown:

```tsx
<Typeahead variant="dark" onSearch={search} onSelect={pick}>
  …
</Typeahead>
```

## Edge cases

```tsx
{
  /* Disabled suggestions stay listed but are skipped by the keyboard and ignore clicks */
}
;<Typeahead.Item value="out-of-stock" index={2} disabled>
  Out of stock
</Typeahead.Item>

{
  /* A query shorter than minChars closes the menu and fires onSearch('') so you can clear results */
}

{
  /* Regex metacharacters in the query are escaped — typing "C++" does not throw */
}
```

## Props

### `Typeahead`

| Name                     | Type                      | Default   | Description                                                            |
| ------------------------ | ------------------------- | --------- | ---------------------------------------------------------------------- |
| `onSearch`               | `(value: string) => void` | —         | Called with the query, debounced; `''` when it drops below `minChars`. |
| `onSelect`               | `(value: string) => void` | —         | Called with the chosen item's `value`.                                 |
| `debounceMs`             | `number`                  | `0`       | Delay before `onSearch`; `0` fires immediately.                        |
| `minChars`               | `number`                  | `2`       | Minimum query length before searching and opening.                     |
| `clearOnSelect`          | `boolean`                 | `true`    | Clear the field after a selection.                                     |
| `portal`                 | `boolean`                 | `false`   | Mount the dropdown at the end of `body` (rarely needed).               |
| `variant`                | `'light' \| 'dark'`       | `'light'` | Colour scheme of the dropdown.                                         |
| …`ComponentProps<'div'>` | —                         | —         | Everything else lands on the root wrapper.                             |

### `Typeahead.Item`

| Name       | Type      | Default | Description                                   |
| ---------- | --------- | ------- | --------------------------------------------- |
| `value`    | `string`  | —       | Value handed to `onSelect`. **Required.**     |
| `index`    | `number`  | —       | Position in the keyboard order. **Required.** |
| `disabled` | `boolean` | `false` | Listed but not selectable.                    |

`Typeahead.Input` takes the `Input` props except `value`, `onChange` and `role`.
`Typeahead.Menu` takes the `ListboxList` props except `variant`.
`Typeahead.Empty` takes the `<li>` props except `role`.
`Typeahead.Highlight` takes `children: string` and `className`.

## Accessibility

- The field is `role="combobox"` with `aria-autocomplete="list"`; the dropdown is a `listbox` linked
  through `aria-controls`, and the active option through `aria-activedescendant`. Focus stays in the
  input throughout, which is what the pattern requires.
- **Give the input an accessible name** — pass `aria-label` or `label` to `Typeahead.Input`.
  Nothing is inferred from the placeholder.
- **Name the list too** — pass `aria-label` to `Typeahead.Menu` (e.g. "Suggestions"); a nameless
  listbox is flagged by audits. It is not derived from the input: the input's own name is its typed
  value when referenced.
- A press on a suggestion keeps focus in the input; Tab out of the field closes the list. Escape
  closes it while open — inside a `Modal`, the dialog only on the next Escape.
- `Typeahead.Empty` is `aria-disabled` and `aria-selected={false}`, so the row is announced but
  never presented as a choice.
- The match highlight uses font weight, not colour, so it does not rely on hue alone (WCAG 1.4.1).
- `aria-expanded` reflects the real open state, so a screen-reader user is told when suggestions
  appeared.

## Notes

> **Warning** — `index` is yours to assign and must match the rendered order, starting at `0`. It is
> not derived from the children, so a gap or a duplicate silently breaks arrow-key traversal.

> **Warning** — every `Typeahead.*` part **throws** outside a `<Typeahead>`. They are not
> general-purpose list pieces; for those, use `Listbox` directly.

> **Note** — `onSearch` is also called with an empty string when the query falls below `minChars`.
> Treat that as "clear the results", not as a search for nothing.

> **Warning** — `portal` is no longer needed to escape `overflow: hidden` or a `z-index`: the
> dropdown is in the top layer either way. Do not use it inside a `Modal` or a `Popover` — a list on
> `body` leaves their subtree: the dialog makes it inert, and a click in it light-dismisses the
> popover.

> **Note** — the dropdown is placed with CSS anchor positioning (Baseline 2026). In a browser
> without it, the list opens centred in the viewport: still on top and usable. `--ui-typeahead-menu-z-index`
> is gone: the top layer ignores `z-index`.

> **Note** — every keystroke re-renders all suggestions, because the cursor lives in one context.
> That is fine for a typical result set; for hundreds of rows, virtualise the list.
