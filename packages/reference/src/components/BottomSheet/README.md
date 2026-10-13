# BottomSheet

A bottom sheet: a native `<dialog>` pinned to the bottom edge, in the browser's top layer. Slides up
on first open, then holds still while its content changes.

## Capabilities

- **Top layer** — rendered in place but drawn above everything: no ancestor's `overflow`,
  `transform` or `z-index` can clip or mis-stack it, and it stays usable when opened from a `Modal`
  (a portal would land in the part of the page the dialog makes inert).
- **Three ways to close** — the built-in close button, Escape, and a click outside the sheet
  (the backdrop when `overlay` is on; a plain click-outside when it is not, so an overlay-less sheet
  is never dismissable by keyboard alone). Opened from a `Modal`, Escape closes the sheet only.
- **Entrance only** — the slide plays on the first open; updating the content of an open sheet does
  not replay it.
- **Modal or not** — with `overlay` the sheet is a real modal (`showModal()`): a dimmed
  `::backdrop`, focus trapped inside, the rest of the page inert. Without it the page stays usable
  behind the sheet.
- **Two colour schemes** — `variant="light"` (default) or `"dark"`; the close button follows.
- **Two regions** — `BottomSheet.Header` (fixed title bar) and `BottomSheet.Body` (scrolls on overflow).
- **Height-capped** — never grows past 60vh, so the page stays reachable behind it.
- **Motion-aware** — the slide is dropped under `prefers-reduced-motion`.
- **Composition guard** — the regions throw outside a `<BottomSheet>`.

## Import

```tsx
import { BottomSheet } from '@fubaritico/react/BottomSheet'
```

## Basic usage

```tsx
const [isOpen, setIsOpen] = useState(false)

<BottomSheet aria-label="Filters" open={isOpen} onClose={() => setIsOpen(false)}>
  <BottomSheet.Header>
    <Typography variant="h6">Filters</Typography>
  </BottomSheet.Header>
  <BottomSheet.Body>
    <FilterList />
  </BottomSheet.Body>
</BottomSheet>
```

## Variants & options

Modal, with a dimmed backdrop — focus is trapped and the page is inert until it closes:

```tsx
<BottomSheet aria-label="Filters" open={isOpen} onClose={close} overlay>
  <BottomSheet.Header>Results</BottomSheet.Header>
  <BottomSheet.Body>{results}</BottomSheet.Body>
</BottomSheet>
```

Dark surface — the close button switches to its on-dark variant automatically:

```tsx
<BottomSheet aria-label="Filters" open={isOpen} onClose={close} variant="dark">
  <BottomSheet.Header>Playback settings</BottomSheet.Header>
  <BottomSheet.Body>{settings}</BottomSheet.Body>
</BottomSheet>
```

Header without a close affordance of your own — one is always provided:

```tsx
<BottomSheet aria-label="Filters" open={isOpen} onClose={close}>
  <BottomSheet.Header /> {/* empty title, close button still rendered */}
  <BottomSheet.Body>{content}</BottomSheet.Body>
</BottomSheet>
```

Raising the height cap for one instance:

```tsx
<BottomSheet
  aria-label="Filters"
  open={isOpen}
  onClose={close}
  style={{ '--ui-bottom-sheet-max-block-size': '85vh' } as CSSProperties}
>
  …
</BottomSheet>
```

## Edge cases

```tsx
{
  /* Closed renders nothing at all — not a hidden node */
}
;<BottomSheet aria-label="Filters" open={false} onClose={close}>
  …
</BottomSheet>

{
  /* Body-only: the header is optional */
}
;<BottomSheet aria-label="Filters" open onClose={close}>
  <BottomSheet.Body>{content}</BottomSheet.Body>
</BottomSheet>

{
  /* Long content scrolls inside the body; the header stays put */
}
```

## Props

### `BottomSheet`

| Name                        | Type                | Default   | Description                                                           |
| --------------------------- | ------------------- | --------- | --------------------------------------------------------------------- |
| `open`                      | `boolean`           | —         | Whether the sheet is mounted. **Required.**                           |
| `onClose`                   | `() => void`        | —         | Called by the close button, Escape and a click outside. **Required.** |
| `variant`                   | `'light' \| 'dark'` | `'light'` | Colour scheme.                                                        |
| `overlay`                   | `boolean`           | `false`   | Make the sheet modal, with a dimmed backdrop.                         |
| `children`                  | `ReactNode`         | —         | `BottomSheet.Header` and / or `BottomSheet.Body`.                     |
| …`ComponentProps<'dialog'>` | —                   | —         | Everything else lands on the `<dialog>` (`ref` included).             |

`BottomSheet.Header` and `BottomSheet.Body` both take plain `<div>` props.

## Accessibility

- The panel is a `<dialog>`. With `overlay` it is opened with `showModal()`: focus moves into it,
  stays trapped there, and returns to where it was on close; the page behind is inert. Without
  `overlay` it is non-modal — focus is not moved, and the page stays reachable.
- **`aria-label` is required** — a `<dialog>` has no name of its own, and nothing is inferred from
  the header's content.
- The close button ships a built-in `aria-label="Close"`.
- The entrance slide is removed under `prefers-reduced-motion` (WCAG 2.3.3).

## Notes

> **Note** — the scrim is the dialog's `::backdrop`: re-skin it with
> `--ui-bottom-sheet-backdrop-color` / `--ui-bottom-sheet-backdrop-opacity` on the sheet. The former
> `.ui-bottom-sheet__overlay` element and `--ui-bottom-sheet-z-index` are gone (the top layer
> ignores `z-index`).

> **Warning** — without `overlay`, a press outside the sheet closes it — the sheet's own trigger
> included. Make the trigger **open** the sheet (`setOpen(true)`), not toggle it, or the press closes
> it and the click reopens it. Presses and Escape inside another layer opened above the sheet (a
> `Modal`, a menu) are left to that layer.

> **Note** — without `overlay`, opening does not move focus: the page stays usable and the sheet is
> reached with Tab. Use `overlay` when the user must deal with the sheet first.

> **Warning** — never set `display` on the sheet (class or `style`): the browser hides a closed
> dialog with `display: none`, and your value would override it.

> **Warning** — `onClose` is yours to honour. Escape and a click outside only _call_ it; the sheet does
> not close itself, so ignoring the callback leaves it open.

> **Note** — `open={false}` unmounts the content entirely. State held inside the sheet is lost on
> close; lift anything that must survive.

> **Note** — the dark surface re-points the same role variables at the inverse colour roles
> (`--color-surface-inverse`, `--color-text-on-inverse`), so a theme recolours it. Override `--ui-bottom-sheet-bg` / `-fg` /
> `-border-color` to re-skin either scheme.
