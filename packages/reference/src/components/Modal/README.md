# Modal

A native `<dialog>` opened in the browser's top layer. It is a transparent, full-viewport **shell**:
the visible panel is yours to compose inside.

## Capabilities

- **Top layer** — opened with `showModal()`, so it paints above every stacking context. No
  `z-index`, and immune to a host's `overflow: hidden` or `transform` traps.
- **Focus trap, free** — the browser confines Tab to the dialog and makes the rest of the page inert.
- **Escape, free** — the browser closes the dialog; `onClose` mirrors it back into your state.
- **Backdrop click** — closes by default; `onOverlayClick` overrides that behaviour.
- **Scroll lock** — the page is locked while open and the previous value is **restored**, not blanked.
- **Required accessible name** — `aria-label` is mandatory at compile time.
- **Composable** — extends `<dialog>`, so `id`, `data-*` and friends reach the element.

> **N/A — visual chrome.** The dialog deliberately has no panel, padding, border or radius of its
> own. Compose a `Card` (or your own markup) inside it.

## Import

```tsx
import { Modal } from '@fubaritico-ds/reference/Modal'
```

## Basic usage

```tsx
const [isOpen, setIsOpen] = useState(false)

<Modal isOpen={isOpen} onClose={() => setIsOpen(false)} aria-label="Confirm deletion">
  <Card>
    <Card.Header>
      <Typography variant="h6">Delete this item?</Typography>
    </Card.Header>
    <Card.Body>
      <Typography variant="body2">This cannot be undone.</Typography>
    </Card.Body>
    <Card.Footer>
      <Button variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
      <Button variant="destructive" onClick={confirm}>Delete</Button>
    </Card.Footer>
  </Card>
</Modal>
```

## Variants & options

Opt out of click-outside closing — useful for a destructive or unsaved-work dialog:

```tsx
<Modal
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  onOverlayClick={() => flashUnsavedWarning()}
  aria-label="Unsaved changes"
>
  <Card>…</Card>
</Modal>
```

Centring the panel — the shell fills the viewport, so position with your own layout:

```tsx
<Modal
  isOpen={isOpen}
  onClose={close}
  aria-label="Settings"
  className="my-centered-shell"
>
  <Card>…</Card>
</Modal>
```

```css
.my-centered-shell {
  display: grid;
  place-items: center;
}
```

Re-skinning the backdrop on one instance:

```tsx
<Modal
  isOpen={isOpen}
  onClose={close}
  aria-label="Light backdrop"
  style={{ '--ui-modal-backdrop-opacity': 0.35 } as CSSProperties}
>
  <Card>…</Card>
</Modal>
```

## Edge cases

```tsx
{
  /* An empty dialog is valid — useful as a bare overlay */
}
;<Modal isOpen onClose={close} aria-label="Loading" />

{
  /* Rapid open/close cycles are safe: the scroll lock is restored each time */
}

{
  /* Unmounting while open restores the page scroll */
}
```

## Props

| Name                        | Type         | Default | Description                                         |
| --------------------------- | ------------ | ------- | --------------------------------------------------- |
| `isOpen`                    | `boolean`    | —       | Whether the dialog is shown. **Required.**          |
| `onClose`                   | `() => void` | —       | Called on Escape or a backdrop click. **Required.** |
| `aria-label`                | `string`     | —       | Accessible name of the dialog. **Required.**        |
| `onOverlayClick`            | `() => void` | —       | Replaces `onClose` for backdrop clicks only.        |
| `children`                  | `ReactNode`  | —       | The panel you compose inside the shell.             |
| …`ComponentProps<'dialog'>` | —            | —       | Everything else lands on the `<dialog>`.            |

## Accessibility

- The element is a real `<dialog>` with `aria-modal="true"`. Focus trapping, page inertness and the
  Escape key come from the platform, not from JavaScript we wrote.
- **`aria-label` is required and type-checked** — a `<dialog>` has no implicit accessible name, and
  the content is yours, so nothing can be inferred. Use a label that states the dialog's purpose.
- Focus moves into the dialog on open and returns to the invoker on close — browser behaviour.
- The backdrop is `::backdrop`, which is not in the accessibility tree; a backdrop click is a
  pointer-only affordance, which is why Escape must stay available (it does).

## Notes

> **Warning** — a backdrop click closes by default. For a dialog holding unsaved work, pass
> `onOverlayClick` to intercept it; leaving the default is a known way to lose user input.

> **Note** — the dialog is a transparent full-viewport shell on purpose. If your panel looks
> unstyled, you forgot to compose something inside it — the Modal itself draws only the backdrop.

> **Note** — `isOpen` drives `showModal()` / `close()` imperatively; do not also set the native
> `open` attribute (it is omitted from the props for that reason). The `open` attribute alone gives
> no top layer, no focus trap and no backdrop.

> **Note** — the scroll lock reads and restores `document.body.style.overflow`. Two Modals open at
> once would have the inner one restore the outer one's value on close; stack dialogs with care.
