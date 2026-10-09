# Drawer

An edge-anchored panel built on a native `<dialog>`. It fills the edge it is attached to and is
genuinely modal.

## Capabilities

- **Truly modal, for free** — `showModal()` grants the top layer, a **focus trap**, inertness of
  the rest of the page, and the Escape key. None of it is reimplemented in JavaScript.
- **Three edges** — `side="start" | "end" | "top"`, **logical**: `start` is the left edge in
  English and the right edge in Arabic. The entrance slide follows.
- **Fills its edge** — full height when lateral, full width when anchored to the top.
- **Three sizes** — `sm` / `md` / `lg`, the extent _across_ the anchored edge.
- **Two colour schemes** — `light` (default) or `dark`; the close button follows.
- **Three regions** — `Drawer.Header` (with a built-in close button), `Drawer.Body` (scrolls) and
  `Drawer.Footer` (pinned action bar).
- **Backdrop click** — closes by default; `onOverlayClick` overrides it. A click on the panel's
  own background never closes it: a `<dialog>` reports itself as the target for backdrop clicks
  too, so the two are told apart against the panel's box.
- **Scroll lock** — the page is locked while open and its previous value **restored**, not blanked.
- **Required accessible name** — `aria-label` is mandatory at compile time.
- **Motion-aware** — the slide is dropped under `prefers-reduced-motion`.

> **Not a bottom sheet.** A bottom-anchored panel is a different component: see `BottomSheet`,
> which floats a partial-height card over the page. `side="bottom"` deliberately does not exist.

## Import

```tsx
import { Drawer } from '@fubaritico/react/Drawer'
```

## Basic usage

```tsx
const [isOpen, setIsOpen] = useState(false)

<Drawer
  open={isOpen}
  onClose={() => setIsOpen(false)}
  aria-label="Filters"
  aria-labelledby="filters-title"
>
  <Drawer.Header>
    <Typography variant="h6" id="filters-title">Filters</Typography>
  </Drawer.Header>
  <Drawer.Body>
    <FilterList />
  </Drawer.Body>
  <Drawer.Footer>
    <Button variant="outline" onClick={reset}>Reset</Button>
    <Button onClick={apply}>Apply</Button>
  </Drawer.Footer>
</Drawer>
```

## Variants & options

The three edges:

```tsx
<Drawer open={isOpen} onClose={close} side="start" aria-label="Navigation">…</Drawer>
<Drawer open={isOpen} onClose={close} side="end" aria-label="Details">…</Drawer>
<Drawer open={isOpen} onClose={close} side="top" aria-label="Search">…</Drawer>
```

Sizes — the extent across the anchored edge:

```tsx
<Drawer open={isOpen} onClose={close} size="sm" aria-label="Compact">…</Drawer>
<Drawer open={isOpen} onClose={close} size="lg" aria-label="Roomy">…</Drawer>
```

Dark surface — the close button switches to its on-dark variant automatically:

```tsx
<Drawer open={isOpen} onClose={close} variant="dark" aria-label="Playback">
  …
</Drawer>
```

Guarding against losing unsaved work:

```tsx
<Drawer
  open={isOpen}
  onClose={close}
  onOverlayClick={() => flashUnsavedWarning()}
  aria-label="Edit profile"
>
  …
</Drawer>
```

Resizing one instance beyond the scale:

```tsx
<Drawer
  open={isOpen}
  onClose={close}
  aria-label="Wide"
  style={{ '--ui-drawer-size': '40rem' } as CSSProperties}
>
  …
</Drawer>
```

## Edge cases

```tsx
{
  /* An empty drawer is valid — useful as a bare modal surface */
}
;<Drawer open onClose={close} aria-label="Loading" />

{
  /* Without a header there is no close button: provide your own affordance */
}
;<Drawer open onClose={close} aria-label="Filters">
  <Drawer.Body>{content}</Drawer.Body>
</Drawer>

{
  /* A long body scrolls; the header and footer stay put */
}
```

## Props

### `Drawer`

| Name                        | Type                        | Default   | Description                                                        |
| --------------------------- | --------------------------- | --------- | ------------------------------------------------------------------ |
| `open`                      | `boolean`                   | —         | Whether the panel is shown. **Required.**                          |
| `onClose`                   | `() => void`                | —         | Called on Escape, the close button, or the backdrop. **Required.** |
| `aria-label`                | `string`                    | —         | Accessible name of the panel. **Required.**                        |
| `side`                      | `'start' \| 'end' \| 'top'` | `'start'` | Anchored edge; logical, so it flips in RTL.                        |
| `size`                      | `'sm' \| 'md' \| 'lg'`      | `'md'`    | Extent across that edge.                                           |
| `variant`                   | `'light' \| 'dark'`         | `'light'` | Colour scheme.                                                     |
| `onOverlayClick`            | `() => void`                | —         | Replaces `onClose` for backdrop clicks only.                       |
| …`ComponentProps<'dialog'>` | —                           | —         | Everything else lands on the `<dialog>`.                           |

### `Drawer.Header`

| Name         | Type     | Default   | Description                          |
| ------------ | -------- | --------- | ------------------------------------ |
| `closeLabel` | `string` | `'Close'` | Accessible name of the close button. |

`Drawer.Body` and `Drawer.Footer` take plain `<div>` props.

## Accessibility

- The panel is a real `<dialog>` with `aria-modal="true"`. The focus trap, the inertness of the
  page behind it and the Escape key come from the platform, not from code we wrote — this is the
  reason the component is a `<dialog>` and not a portalled `<div>`.
- **`aria-label` is required and type-checked** — a `<dialog>` has no implicit accessible name.
  When the panel shows a **visible title**, give that title an `id` and pass `aria-labelledby` too:
  ARIA gives it precedence, and the name a screen reader hears then cannot drift from the one on
  screen. `aria-label` remains the fallback.
- Focus moves into the panel on open and returns to the invoker on close: browser behaviour.
- The close button carries an accessible name (`'Close'` by default, renameable for localisation).
- The backdrop is `::backdrop`, not in the accessibility tree; a backdrop click is a pointer-only
  affordance, which is why Escape stays available.
- The entrance slide is removed under `prefers-reduced-motion` (WCAG 2.3.3).

## Notes

> **Warning** — a backdrop click closes by default. For a panel holding unsaved work, pass
> `onOverlayClick` to intercept it.

> **Note** — `side` is **logical**. `start` is not "left": it is the inline-start edge, which is
> the right in a right-to-left document. Use it rather than hard-coding a direction.

> **Note** — `open` drives `showModal()` / `close()` imperatively; the native `open` attribute is
> omitted from the props because, on its own, it grants no top layer, no focus trap and no
> backdrop.

> **Warning** — combining `onOverlayClick` (which cancels backdrop-closing) with **no**
> `Drawer.Header` (which removes the close button) leaves **Escape as the only way out**. That is a
> dead end for touch-only users, who have no Escape key. If you opt out of backdrop-closing, render
> a close affordance — a header, or your own button wired to `onClose`.

> **Note** — the scroll lock reads and restores `document.body.style.overflow`. Two stacked
> drawers would have the inner one restore the outer one's value on close; stack with care.
