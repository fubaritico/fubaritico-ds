# BottomSheet

A bottom sheet, portalled above the page. Slides up on first open, then holds still while its
content changes.

## Capabilities

- **Portalled** — rendered outside the subtree, so no ancestor's `overflow` or `transform` can clip
  or mis-stack it.
- **Three ways to close** — the built-in close button, Escape, and a click outside the sheet
  (the scrim when `overlay` is on; a plain click-outside when it is not, so an overlay-less sheet
  is never dismissable by keyboard alone).
- **Entrance only** — the slide plays on the first open; updating the content of an open sheet does
  not replay it.
- **Optional scrim** — `overlay` dims the page and makes the sheet modal (`aria-modal`).
- **Two colour schemes** — `variant="light"` (default) or `"dark"`; the close button follows.
- **Two regions** — `BottomSheet.Header` (fixed title bar) and `BottomSheet.Body` (scrolls on overflow).
- **Height-capped** — never grows past 60vh, so the page stays reachable behind it.
- **Motion-aware** — the slide is dropped under `prefers-reduced-motion`.
- **Composition guard** — the regions throw outside a `<BottomSheet>`.

> **N/A — focus trapping.** The sheet does **not** trap focus, even with `overlay`. See the warning
> in Notes before using it for a true modal flow.

## Import

```tsx
import { BottomSheet } from '@fubaritico/react/BottomSheet'
```

## Basic usage

```tsx
const [isOpen, setIsOpen] = useState(false)

<BottomSheet open={isOpen} onClose={() => setIsOpen(false)}>
  <BottomSheet.Header>
    <Typography variant="h6">Filters</Typography>
  </BottomSheet.Header>
  <BottomSheet.Body>
    <FilterList />
  </BottomSheet.Body>
</BottomSheet>
```

## Variants & options

With a scrim, which also marks the sheet modal:

```tsx
<BottomSheet open={isOpen} onClose={close} overlay>
  <BottomSheet.Header>Results</BottomSheet.Header>
  <BottomSheet.Body>{results}</BottomSheet.Body>
</BottomSheet>
```

Dark surface — the close button switches to its on-dark variant automatically:

```tsx
<BottomSheet open={isOpen} onClose={close} variant="dark">
  <BottomSheet.Header>Playback settings</BottomSheet.Header>
  <BottomSheet.Body>{settings}</BottomSheet.Body>
</BottomSheet>
```

Header without a close affordance of your own — one is always provided:

```tsx
<BottomSheet open={isOpen} onClose={close}>
  <BottomSheet.Header /> {/* empty title, close button still rendered */}
  <BottomSheet.Body>{content}</BottomSheet.Body>
</BottomSheet>
```

Raising the height cap for one instance:

```tsx
<BottomSheet
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
;<BottomSheet open={false} onClose={close}>
  …
</BottomSheet>

{
  /* Body-only: the header is optional */
}
;<BottomSheet open onClose={close}>
  <BottomSheet.Body>{content}</BottomSheet.Body>
</BottomSheet>

{
  /* Long content scrolls inside the body; the header stays put */
}
```

## Props

### `BottomSheet`

| Name                     | Type                | Default   | Description                                                       |
| ------------------------ | ------------------- | --------- | ----------------------------------------------------------------- |
| `open`                   | `boolean`           | —         | Whether the sheet is mounted. **Required.**                       |
| `onClose`                | `() => void`        | —         | Called by the close button, Escape and the overlay. **Required.** |
| `variant`                | `'light' \| 'dark'` | `'light'` | Colour scheme.                                                    |
| `overlay`                | `boolean`           | `false`   | Dim the page behind and set `aria-modal`.                         |
| `children`               | `ReactNode`         | —         | `BottomSheet.Header` and / or `BottomSheet.Body`.                           |
| …`ComponentProps<'div'>` | —                   | —         | Everything else lands on the panel.                               |

`BottomSheet.Header` and `BottomSheet.Body` both take plain `<div>` props.

## Accessibility

- The panel is `role="dialog"`, with `aria-modal` reflecting `overlay` — it claims modality only
  when a scrim actually blocks the page.
- **Give the sheet an accessible name** — pass `aria-label`, or `aria-labelledby` pointing at your
  header title. Nothing is inferred from the header's content.
- The close button ships a built-in `aria-label="Close"`.
- The overlay is `aria-hidden`: it is a pointer affordance, which is why Escape stays available.
- The entrance slide is removed under `prefers-reduced-motion` (WCAG 2.3.3).

## Notes

> **Warning** — the BottomSheet does **not** trap focus and does not make the page inert, even with
> `overlay`. A keyboard or screen-reader user can Tab straight out into the content behind it. For a
> flow that genuinely must be modal, use `Modal`, which gets trapping and inertness from the native
> `<dialog>`.

> **Warning** — `onClose` is yours to honour. Escape and the overlay only _call_ it; the sheet does
> not close itself, so ignoring the callback leaves it open.

> **Note** — `open={false}` unmounts the content entirely. State held inside the sheet is lost on
> close; lift anything that must survive.

> **Note** — the dark surface re-points the same role variables at the dark end of the neutral
> scale rather than using a separate on-dark token family. Override `--ui-bottom-sheet-bg` / `-fg` /
> `-border-color` to re-skin either scheme.
