# Checkbox

An accessible, presentational checkbox control — a visually-hidden native `<input type="checkbox">`
skinned with a painted box, an optional label and an optional error message.

## Capabilities

- **States** — unchecked, checked, **indeterminate** (mixed), disabled, error. Every visual state is
  read straight from the native input by the skin (`:has(input:checked)`, `:indeterminate`,
  `:disabled`, `:focus-visible`), so the control behaves identically **controlled or uncontrolled** —
  the DOM is the single source of truth.
- **Keyboard & focus** — fully native: `Tab` to focus, `Space` to toggle. Keyboard focus shows a ring
  on the box (`:focus-visible`); pointer clicks do not.
- **Accessibility** — exposes a real checkbox to the a11y tree; the label is the accessible name
  (override with `aria-label`). Errors set `aria-invalid` and a `role="alert"` message prefixed by an
  icon, so the error is never conveyed by colour alone (WCAG 1.4.1).
- **Size API** — `sm` (16px box) / `md` (20px box, default).
- **Native props** — extends `<input>`, so `checked`, `onChange` (event), `disabled`, `name`, `value`,
  `defaultChecked`, … all pass through. Wires directly onto event handlers such as TanStack Table's
  `getToggleSelectedHandler()`.

## Import

```tsx
import { Checkbox } from '@fubaritico-ds/reference/Checkbox'
```

## Basic usage

```tsx
const [checked, setChecked] = useState(false)

<Checkbox
  checked={checked}
  onChange={(e) => setChecked(e.target.checked)}
  label="Accept the terms"
/>
```

## Variants & options

```tsx
{/* Sizes */}
<Checkbox size="sm" checked onChange={onChange} label="Small" />
<Checkbox size="md" checked onChange={onChange} label="Medium (default)" />

{/* Indeterminate (mixed) — e.g. a "select all" header when some rows are selected */}
<Checkbox checked={false} indeterminate onChange={onChange} label="Select all" />

{/* Disabled */}
<Checkbox checked disabled onChange={onChange} label="Locked" />

{/* Error */}
<Checkbox checked={false} onChange={onChange} error="This field is required" />
```

## Edge cases

```tsx
{
  /* Uncontrolled */
}
;<Checkbox defaultChecked />

{
  /* No label — provide an accessible name */
}
;<Checkbox checked onChange={onChange} aria-label="Select row 42" />

{
  /* In a form */
}
;<Checkbox name="agree" value="yes" onChange={onChange} label="I agree" />
```

## Props / API

| Prop            | Type                                   | Default | Description                                                            |
| --------------- | -------------------------------------- | ------- | ---------------------------------------------------------------------- |
| `size`          | `'sm' \| 'md'`                         | `'md'`  | Box size (the native `size` attribute is intentionally repurposed).    |
| `label`         | `string`                               | —       | Text next to the box; also the accessible name unless `aria-label`.    |
| `error`         | `string`                               | —       | Error message below the row; sets `aria-invalid` + destructive border. |
| `indeterminate` | `boolean`                              | `false` | Shows the mixed state; set on the native input via a ref.              |
| `checked`       | `boolean`                              | —       | Controlled checked state (native).                                     |
| `onChange`      | `ChangeEventHandler<HTMLInputElement>` | —       | Native change handler (`e.target.checked`).                            |
| …native         | `ComponentProps<'input'>`              | —       | `disabled`, `name`, `value`, `defaultChecked`, `aria-*`, …             |

## Accessibility

- Role `checkbox` is provided by the native input; `Space` toggles it.
- Accessible name comes from `label`, overridden by `aria-label`.
- Error: `aria-invalid="true"` + `aria-describedby` → a `role="alert"` message with a leading icon.
- The painted box and glyph are `aria-hidden` (purely decorative); the input carries all semantics.

## Notes

> **Note** — `onChange` is the **native** change event, not a `(checked: boolean)` callback. Read the
> value from `e.target.checked`.

> **Note** — `indeterminate` is a visual/ARIA state only; it does not change `checked`. Clicking an
> indeterminate checkbox fires `onChange` with the input's resulting `checked` value — own the
> transition in your handler (e.g. a "select all" that goes indeterminate → all).

> **Warning** — without a `label`, provide an `aria-label`, otherwise the checkbox has no accessible
> name.
