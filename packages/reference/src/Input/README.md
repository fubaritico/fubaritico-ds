# Input

An accessible text-field primitive: an `<input>` control with an optional label, a decorative
trailing icon and a helper/error message — a presentational, framework-agnostic form atom.

## Capabilities

- **Three render layers, composed on demand**: the bare control alone; wrapped in an affix when an
  icon is present; wrapped in a field layer when a `label` and/or `message` is present.
- **Sizes**: `sm` / `md` (default) / `lg` — one size axis drives the control geometry, the icon inset
  and the label/message font sizes together.
- **States**: native `disabled`; an **error** state (`messageType="error"` + a `message`) that recolours
  the border + focus ring and the message, and prefixes the message with an error icon.
- **Accessibility wired in**: the label is linked via `htmlFor`; the message via `aria-describedby`;
  an error sets `aria-invalid` on the control, `role="alert"` on the message, and shows a leading icon
  so the error state is never conveyed by colour alone.
- **Decorative icon**: trailing, non-interactive (`aria-hidden`, `pointer-events: none`), muted.
- **Native passthrough**: every `<input>` attribute (`type`, `name`, `required`, `value`, `onChange`,
  …) is forwarded; `className` lands on the control.

## Import

```tsx
import { Input } from '@fubaritico-ds/reference/Input'
```

## Basic usage

```tsx
<Input placeholder="Enter text" />
```

## Variants & options

```tsx
// Sizes
<Input size="sm" placeholder="Small" />
<Input size="md" placeholder="Medium (default)" />
<Input size="lg" placeholder="Large" />

// Trailing icon (decorative)
<Input icon="MagnifyingGlass" placeholder="Search" />

// Label (linked to the control)
<Input label="Email" type="email" placeholder="you@example.com" />

// Info message
<Input label="Username" message="Pick a unique handle." />

// Error message (recolours border/ring + message, sets aria-invalid + role="alert")
<Input
  label="Password"
  type="password"
  message="Password is required."
  messageType="error"
/>

// Disabled
<Input disabled placeholder="Can't touch this" />
```

## Edge cases

```tsx
// Field with only a message, no label
<Input message="Hint only" />

// Everything at once
<Input
  label="Search"
  icon="MagnifyingGlass"
  message="No results found"
  messageType="error"
/>

// messageType="error" with NO message → no error styling, no aria-invalid
<Input messageType="error" />

// Controlled input
<Input value={value} onChange={(e) => setValue(e.target.value)} />
```

## Props / API

| Prop          | Type                                    | Default  | Description                                                   |
| ------------- | --------------------------------------- | -------- | ------------------------------------------------------------- |
| `size`        | `'sm' \| 'md' \| 'lg'`                  | `'md'`   | Control size (geometry + icon inset + label/message font).    |
| `icon`        | `IconName`                              | —        | Optional decorative trailing icon (heroicons subset).         |
| `label`       | `string`                                | —        | Label above the control, linked via `htmlFor`.                |
| `message`     | `string`                                | —        | Helper/error message below the control.                       |
| `messageType` | `'info' \| 'error'`                     | `'info'` | Semantic of `message`: drives colour, `aria-invalid`, `role`. |
| `id`          | `string`                                | auto     | Falls back to a `useId()` value if omitted.                   |
| _...rest_     | `Omit<ComponentProps<'input'>, 'size'>` | —        | All native `<input>` attributes except `size` (forwarded).    |

## Accessibility

- **Label**: rendered as a real `<label htmlFor>` and exposed via `getByLabelText`.
- **Message**: linked to the control with `aria-describedby="<id>-message"`.
- **Error**: sets `aria-invalid="true"` on the control, `role="alert"` on the message (so it is
  announced), and prepends a leading icon — so the error state is conveyed by **icon + text**, never by
  colour alone (WCAG 1.4.1).
- **Icon**: both the trailing `icon` and the error icon are `aria-hidden` and non-interactive —
  decoration only, never a control.

## Notes

> **Note** — `id` is optional: when omitted, a stable `useId()` value is generated and used for both
> the label association and the `aria-describedby` link. Pass `id` only when you need a known value.

> **Warning** — `messageType="error"` alone does **nothing**: the error state (styling +
> `aria-invalid` + `role="alert"`) only activates when a non-empty `message` is also provided.

> **Note** — the trailing `icon` is decorative only. For an interactive affordance (e.g. clear /
> reveal-password), don't use `icon`; compose a real button next to the Input instead.

> **Note** — `size` is the design-system size axis (`sm`/`md`/`lg`), not the native HTML `size`
> attribute (character width), which is intentionally omitted. Control the width via CSS / a container.
