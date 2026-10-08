# Drawer

A bottom sheet, portalled above the page. Slides up on first open, then holds still while its
content changes.

## Capabilities

- **Portalled** — rendered outside the subtree, so no ancestor's `overflow` or `transform` can clip
  or mis-stack it.
- **Three ways to close** — the built-in close button, Escape, and the overlay (when enabled).
- **Entrance only** — the slide plays on the first open; updating the content of an open sheet does
  not replay it.
- **Optional scrim** — `overlay` dims the page and makes the sheet modal (`aria-modal`).
- **Two colour schemes** — `variant="light"` (default) or `"dark"`; the close button follows.
- **Two regions** — `Drawer.Header` (fixed title bar) and `Drawer.Body` (scrolls on overflow).
- **Height-capped** — never grows past 60vh, so the page stays reachable behind it.
- **Motion-aware** — the slide is dropped under `prefers-reduced-motion`.
- **Composition guard** — the regions throw outside a `<Drawer>`.

> **N/A — focus trapping.** The sheet does **not** trap focus, even with `overlay`. See the warning
> in Notes before using it for a true modal flow.

## Import

```tsx
import { Drawer } from '@fubaritico-ds/reference/Drawer'
```

## Basic usage

```tsx
const [isOpen, setIsOpen] = useState(false)

<Drawer open={isOpen} onClose={() => setIsOpen(false)}>
  <Drawer.Header>
    <Typography variant="h6">Filters</Typography>
  </Drawer.Header>
  <Drawer.Body>
    <FilterList />
  </Drawer.Body>
</Drawer>
```

## Variants & options

With a scrim, which also marks the sheet modal:

```tsx
<Drawer open={isOpen} onClose={close} overlay>
  <Drawer.Header>Results</Drawer.Header>
  <Drawer.Body>{results}</Drawer.Body>
</Drawer>
```

Dark surface — the close button switches to its on-dark variant automatically:

```tsx
<Drawer open={isOpen} onClose={close} variant="dark">
  <Drawer.Header>Playback settings</Drawer.Header>
  <Drawer.Body>{settings}</Drawer.Body>
</Drawer>
```

Header without a close affordance of your own — one is always provided:

```tsx
<Drawer open={isOpen} onClose={close}>
  <Drawer.Header /> {/* empty title, close button still rendered */}
  <Drawer.Body>{content}</Drawer.Body>
</Drawer>
```

Raising the height cap for one instance:

```tsx
<Drawer
  open={isOpen}
  onClose={close}
  style={{ '--ui-drawer-max-block-size': '85vh' } as CSSProperties}
>
  …
</Drawer>
```

## Edge cases

```tsx
{
  /* Closed renders nothing at all — not a hidden node */
}
;<Drawer open={false} onClose={close}>
  …
</Drawer>

{
  /* Body-only: the header is optional */
}
;<Drawer open onClose={close}>
  <Drawer.Body>{content}</Drawer.Body>
</Drawer>

{
  /* Long content scrolls inside the body; the header stays put */
}
```

## Props

### `Drawer`

| Name                     | Type                | Default   | Description                                                       |
| ------------------------ | ------------------- | --------- | ----------------------------------------------------------------- |
| `open`                   | `boolean`           | —         | Whether the sheet is mounted. **Required.**                       |
| `onClose`                | `() => void`        | —         | Called by the close button, Escape and the overlay. **Required.** |
| `variant`                | `'light' \| 'dark'` | `'light'` | Colour scheme.                                                    |
| `overlay`                | `boolean`           | `false`   | Dim the page behind and set `aria-modal`.                         |
| `children`               | `ReactNode`         | —         | `Drawer.Header` and / or `Drawer.Body`.                           |
| …`ComponentProps<'div'>` | —                   | —         | Everything else lands on the panel.                               |

`Drawer.Header` and `Drawer.Body` both take plain `<div>` props.

## Accessibility

- The panel is `role="dialog"`, with `aria-modal` reflecting `overlay` — it claims modality only
  when a scrim actually blocks the page.
- **Give the sheet an accessible name** — pass `aria-label`, or `aria-labelledby` pointing at your
  header title. Nothing is inferred from the header's content.
- The close button ships a built-in `aria-label="Close"`.
- The overlay is `aria-hidden`: it is a pointer affordance, which is why Escape stays available.
- The entrance slide is removed under `prefers-reduced-motion` (WCAG 2.3.3).

## Notes

> **Warning** — the Drawer does **not** trap focus and does not make the page inert, even with
> `overlay`. A keyboard or screen-reader user can Tab straight out into the content behind it. For a
> flow that genuinely must be modal, use `Modal`, which gets trapping and inertness from the native
> `<dialog>`.

> **Warning** — `onClose` is yours to honour. Escape and the overlay only _call_ it; the sheet does
> not close itself, so ignoring the callback leaves it open.

> **Note** — `open={false}` unmounts the content entirely. State held inside the sheet is lost on
> close; lift anything that must survive.

> **Note** — the dark surface re-points the same role variables at the dark end of the neutral
> scale rather than using a separate on-dark token family. Override `--ui-drawer-bg` / `-fg` /
> `-border-color` to re-skin either scheme.
