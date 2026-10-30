# MultiSelect

A field that holds several choices as removable badges, with a search over a list of options — a
multi-select combobox. The behaviour (selection, search, keyboard, focus, announcements, ARIA) is the
framework-agnostic `MultiSelectService` of `@fubaritico/behaviors`; this component renders it.

## Capabilities

- **Several choices, shown as badges** — each chosen option becomes a `Badge` in the field, with its
  own remove button. Many badges wrap the field onto several lines.
- **Search as you type** — the input filters the options, ignoring case and accents (« pele » finds
  « Pèlerinage »); the matched part is set in bold, by weight rather than colour.
- **The menu stays open** — choosing an option checks it and keeps the menu open for the next one;
  choosing a checked option removes it. The search empties after each choice.
- **Full keyboard model** — Arrow Down / Up open the menu and move through the options (wrapping,
  disabled ones skipped), Home / End jump while open, Enter chooses or removes, Escape closes the menu
  then clears the search, Backspace in an empty input removes the last badge. Each remove button is a
  native button: Tab reaches it, Enter or Space removes.
- **Focus is never lost** — removing a badge moves focus to the next badge's button, or to the input
  after the last one.
- **Announcements** — a polite live region says « Port added », « Port removed », and what a search
  left: « 3 results », « No results ».
- **Field layer, like `Input`** — a label (required), a help message, an error state (`aria-invalid`,
  `role="alert"`, an icon and a red boundary).
- **Top layer** — the menu is a native `popover`, anchored under the control in CSS, as wide, flipped
  above when there is no room; usable **inside a `Modal`** (Escape closes the menu, never the dialog).
- **Controlled or not** — `value` + `onChange`, or `defaultValue`. Works with Formik
  (`setFieldValue` / `setFieldTouched`) and in a native form (`name` → hidden inputs).
- **Variants** — `variant` `'light'` | `'dark'`, `size` `'sm'` | `'md'` | `'lg'`, `disabled`.
- **Translatable** — every sentence it says goes through `messages`.

## Import

```tsx
import { MultiSelect } from '@fubaritico/react/MultiSelect'
```

## Basic usage

```tsx
const [reasons, setReasons] = useState<string[]>([])

<MultiSelect
  label="Reasons"
  options={[
    { value: 'port', label: 'Port' },
    { value: 'pilgrimage', label: 'Pilgrimage' },
    { value: 'fair', label: 'Fair' },
  ]}
  value={reasons}
  onChange={setReasons}
/>
```

## Variants & options

Help and error messages:

```tsx
<MultiSelect label="Reasons" options={options} value={value} onChange={setValue} message="Why this place is a city." />

<MultiSelect
  label="Reasons"
  options={options}
  value={value}
  onChange={setValue}
  message="Pick at least one reason."
  messageType="error"
/>
```

On a dark panel (a dark admin):

```tsx
<MultiSelect
  variant="dark"
  label="Reasons"
  options={options}
  value={value}
  onChange={setValue}
/>
```

Sizes, disabled, uncontrolled:

```tsx
<MultiSelect size="sm" label="Reasons" options={options} defaultValue={['port']} />
<MultiSelect size="lg" label="Reasons" options={options} defaultValue={['port']} />
<MultiSelect disabled label="Reasons" options={options} defaultValue={['port']} />
```

In a French interface:

```tsx
<MultiSelect
  label="Raisons"
  options={options}
  value={value}
  onChange={setValue}
  placeholder="Choisir des raisons"
  messages={{
    remove: (label) => `Retirer ${label}`,
    added: (label) => `${label} ajouté`,
    removed: (label) => `${label} retiré`,
    results: (count) => (count === 1 ? '1 résultat' : `${count} résultats`),
    noResults: 'Aucun résultat',
  }}
/>
```

In a Formik form:

```tsx
<MultiSelect
  label="Raisons"
  name="reasons"
  options={options}
  value={values.reasons}
  onChange={(next) => void setFieldValue('reasons', next)}
  onBlur={() => void setFieldTouched('reasons', true)}
  message={
    touched.reasons && typeof errors.reasons === 'string'
      ? errors.reasons
      : undefined
  }
  messageType="error"
/>
```

## Edge cases

```tsx
{
  /* A disabled option stays listed, skipped by the keyboard, ignored by a click */
}
;<MultiSelect
  label="Reasons"
  options={[{ value: 'mint', label: 'Mint', disabled: true }]}
/>

{
  /* No option, or no match: a "No results" row (messages.noResults) */
}
;<MultiSelect label="Reasons" options={[]} />

{
  /* A value no option carries shows as a badge with the raw value — visibly wrong, never hidden */
}
;<MultiSelect label="Reasons" options={options} defaultValue={['ghost']} />

{
  /* A native form submits one hidden input per value: reasons=port&reasons=fair */
}
;<form>
  <MultiSelect
    label="Reasons"
    name="reasons"
    options={options}
    defaultValue={['port', 'fair']}
  />
</form>
```

## Props

| Name                     | Type                           | Default   | Description                                                                         |
| ------------------------ | ------------------------------ | --------- | ----------------------------------------------------------------------------------- |
| `label`                  | `string`                       | —         | The field's label; names the combobox and the listbox. **Required.**                |
| `options`                | `readonly MultiSelectOption[]` | —         | `{ value, label, disabled? }`, in display order. **Required.**                      |
| `value`                  | `readonly string[]`            | —         | Controlled selection, in the order it was made.                                     |
| `defaultValue`           | `readonly string[]`            | —         | Initial selection when uncontrolled.                                                |
| `onChange`               | `(value: string[]) => void`    | —         | The new list after a choice or a removal.                                           |
| `message`                | `string`                       | —         | Help or error message under the control.                                            |
| `messageType`            | `'info' \| 'error'`            | `'info'`  | `'error'` adds `aria-invalid`, `role="alert"`, the icon and red border.             |
| `placeholder`            | `string`                       | —         | Shown while nothing is chosen.                                                      |
| `size`                   | `'sm' \| 'md' \| 'lg'`         | `'md'`    | Control height, font size and badge size.                                           |
| `variant`                | `'light' \| 'dark'`            | `'light'` | Colour scheme; `'dark'` for an inverse panel.                                       |
| `disabled`               | `boolean`                      | `false`   | No menu, no choice, no removal.                                                     |
| `inputId`                | `string`                       | generated | DOM id of the search input.                                                         |
| `name`                   | `string`                       | —         | Name of the hidden inputs, for a native form.                                       |
| `messages`               | `Partial<MultiSelectMessages>` | English   | `remove`, `added`, `removed` (of the label), `results` (of the count), `noResults`. |
| `service`                | `MultiSelectService`           | created   | Inject a behaviour service (tests, a shared instance).                              |
| …`ComponentProps<'div'>` | —                              | —         | Everything else (`className`, `onBlur`…) lands on the root.                         |

## Accessibility

- The search input is `role="combobox"` (`aria-expanded`, `aria-controls`, `aria-autocomplete="list"`);
  the menu is a `listbox` with `aria-multiselectable="true"`, named by the label. Each option carries
  `aria-selected`; the option under the cursor is pointed at by `aria-activedescendant`, so focus stays
  in the input, as the pattern requires.
- Each remove button is a real `<button>` named « Remove <label> » (translatable), with a 24px hit area
  around its 16px glyph (WCAG 2.5.8). The badges are not themselves focusable.
- After a removal, focus goes to the next remove button or to the input — never to `<body>`.
- Choices, removals and search results are announced in a polite live region; a repeated sentence
  is still re-read. With the menu open and nothing to choose, Enter does nothing (no form submission).
- The error is told by text, icon and `aria-invalid`, not by the red border alone (WCAG 1.4.1). The
  dark error text uses red.400 (6.5:1 on the dark surface) and the dark boundary neutral.500 (3.4:1).
- The control's boundary and the focus ring meet 3:1 on both schemes (WCAG 1.4.11).

## Notes

> **Warning** — `label` is required: a combobox without a name cannot be used with a screen reader.
> There is no `aria-label` escape hatch; hide the label visually in your own CSS if the design needs it.

> **Note** — the sentences default to English. Pass `messages` in any other language — the remove
> buttons and the announcements are read aloud.

> **Note** — `onBlur` fires each time focus leaves the input or a remove button, including when it
> moves between them. Use it to mark the field touched (Formik), not to validate on « leaving the
> field ».

> **Warning** — option `value`s must be unique. A duplicate can never be told apart from the first; the
> service reports it through its `onWarn` option when you inject one.

> **Note** — every option is rendered at once. That is fine for dozens; for thousands, filter on the
> server and pass the matching options.

> **Note** — the menu is placed with CSS anchor positioning (Baseline 2026). In a browser without it,
> the list opens centred in the viewport: still on top and usable.
