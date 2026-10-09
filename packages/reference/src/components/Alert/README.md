# Alert

A standing message block: an intent glyph, an optional title, the message, and an optional dismiss
control. Presentational and stateless.

## Capabilities

- **Four intents** — `info` (neutral default), `success`, `warning`, `error`.
- **Not colour-only** — each intent has its own glyph, so the meaning survives for a reader who
  cannot distinguish the hues.
- **Full text contrast** — the intent colours the border and the glyph, never the surface, so the
  message always sits on a neutral background.
- **Politeness follows intent** — `error` / `warning` render `role="alert"` (interrupting),
  `info` / `success` render `role="status"` (polite). Overridable with `role`.
- **Optional title** — a heading above the message.
- **Optional dismiss** — `onDismiss` adds a labelled close button.
- **Swappable glyph** — pass your own, or `null` for none.
- **Composable** — extends `<div>`, so `className`, `id`, `data-*` reach the root.

> **N/A — self-dismissal.** Pressing the close button calls `onDismiss`; the Alert never removes
> itself. Visibility belongs to the consumer.

## Import

```tsx
import { Alert } from '@fubaritico/react/Alert'
```

## Basic usage

```tsx
<Alert>Your changes were saved.</Alert>
```

## Variants & options

The four intents:

```tsx
<Alert variant="info">A new version is available.</Alert>
<Alert variant="success">Your changes were saved.</Alert>
<Alert variant="warning">Your storage is nearly full.</Alert>
<Alert variant="error">We could not save your changes.</Alert>
```

With a title:

```tsx
<Alert variant="error" title="Upload failed">
  The file exceeds the 25 MB limit.
</Alert>
```

Dismissible — you own the visibility:

```tsx
const [visible, setVisible] = useState(true)

{
  visible ? (
    <Alert variant="success" onDismiss={() => setVisible(false)}>
      Your changes were saved.
    </Alert>
  ) : null
}
```

A custom dismiss label, for a localised or more specific name:

```tsx
<Alert onDismiss={hide} dismissLabel="Dismiss the storage warning">
  Your storage is nearly full.
</Alert>
```

Custom or absent glyph:

```tsx
<Alert icon={<Icon name="Bookmark" size={20} aria-hidden="true" />}>Saved to your list.</Alert>
<Alert icon={null}>A message with no glyph at all.</Alert>
```

Forcing the politeness — a page-load banner should not interrupt:

```tsx
<Alert variant="error" role="status">
  Two invoices failed to sync last night.
</Alert>
```

## Edge cases

```tsx
{
  /* Title only, no message */
}
;<Alert title="Heads up" />

{
  /* Rich content in both slots */
}
;<Alert title={<strong>Quota</strong>}>
  <em>Almost full</em>
</Alert>

{
  /* Long unbroken strings wrap instead of stretching the block */
}
```

## Props

| Name                     | Type                                          | Default      | Description                              |
| ------------------------ | --------------------------------------------- | ------------ | ---------------------------------------- |
| `variant`                | `'info' \| 'success' \| 'warning' \| 'error'` | `'info'`     | Message intent.                          |
| `title`                  | `ReactNode`                                   | —            | Optional heading above the message.      |
| `icon`                   | `ReactNode`                                   | intent glyph | Custom glyph; `null` renders none.       |
| `onDismiss`              | `() => void`                                  | —            | Shows the dismiss button and handles it. |
| `dismissLabel`           | `string`                                      | `'Dismiss'`  | Accessible name of that button.          |
| `children`               | `ReactNode`                                   | —            | The message.                             |
| `role`                   | `string`                                      | per intent   | Overrides the live-region politeness.    |
| …`ComponentProps<'div'>` | —                                             | —            | Everything else lands on the root.       |

## Accessibility

- The root is a **live region**: `role="alert"` for `error` / `warning`, `role="status"` for
  `info` / `success`. A live region announces _changes_, so an Alert rendered on page load is not
  read out — mount it in response to the event it describes for it to be heard.
- The intent glyph is `aria-hidden`: it duplicates what the text already says.
- Intent is never conveyed by colour alone — the glyph changes with it (WCAG 1.4.1).
- The surface stays neutral so the message keeps full foreground contrast (WCAG 1.4.3), rather than
  the tinted panel + tinted text that commonly fails it.
- The dismiss button carries an accessible name (`'Dismiss'` by default).

## Notes

> **Warning** — `role="alert"` **interrupts** a screen-reader user mid-sentence. That is right for a
> failure, wrong for a banner that is simply present on the page. Pass `role="status"` for anything
> that is not urgent, whatever its colour.

> **Note** — the Alert does not remove itself. `onDismiss` only tells you the button was pressed;
> render it conditionally to make it disappear.

> **Note** — the `warning` intent reads from the primitive amber scale, as no semantic warning
> token exists yet. That follows the project convention (role variables wire to the value scale);
> override `--ui-alert-accent` / `--ui-alert-border-color` to re-skin it.

> **Note** — if you pass a custom `icon`, mark it `aria-hidden` unless it carries information the
> text does not. A decorative glyph announced twice is noise.
