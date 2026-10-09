# Popover

A surface anchored to a trigger, displayed above everything on the page — a non-modal dialog for
pickers, details, small forms. A thin React adapter over `PopoverService` from
`@fubaritico/behaviors`, built on the platform's `popover` attribute.

## Capabilities

- **Above everything, no portal** — the browser renders the surface in the **top layer**: no
  `z-index`, no `overflow: hidden` ancestor and no stacking context can cover or clip it.
- **Anchored** — CSS anchor positioning places it below its trigger, start-aligned, and flips it
  above / to the other side (or to the side with the most room) when it would overflow.
- **Native dismissal** — Escape, a click outside and the trigger close it; focus returns to the
  trigger.
- **Focus** — on open, focus moves to the first focusable element inside (or to the surface).
- **Controlled or not** — `open` + `onOpenChange`, or `defaultOpen`; a controlled parent may refuse a
  change. Injectable `service` to open it from outside the tree.
- **Fade** — a short opacity transition, removed under `prefers-reduced-motion`.

## Import

```tsx
import { Popover } from '@fubaritico/react/Popover'
```

## Basic usage

```tsx
<Popover label="Details">
  <Popover.Trigger className="ui-button ui-button--outline">
    Details
  </Popover.Trigger>
  <Popover.Content>The details.</Popover.Content>
</Popover>
```

## Variants & options

Controlled:

```tsx
import { useState } from 'react'

import { Popover } from '@fubaritico/react/Popover'

export function ControlledPopover() {
  const [open, setOpen] = useState(false)
  return (
    <Popover label="Filters" open={open} onOpenChange={setOpen}>
      <Popover.Trigger>Filters</Popover.Trigger>
      <Popover.Content>…</Popover.Content>
    </Popover>
  )
}
```

Opened from outside the tree — inject the service:

```tsx
import { createPopoverService } from '@fubaritico/behaviors'
import { Popover } from '@fubaritico/react/Popover'

const help = createPopoverService({ uid: 'help', label: 'Help' })

export function WithShortcut() {
  return (
    <>
      <Popover service={help}>
        <Popover.Trigger>?</Popover.Trigger>
        <Popover.Content>Keyboard shortcuts…</Popover.Content>
      </Popover>
      <button type="button" onClick={() => help.setOpen(true)}>
        Show help
      </button>
    </>
  )
}
```

## Edge cases

Inside a clipped, z-indexed container — still on top, not clipped:

```tsx
<div
  style={{
    overflow: 'hidden',
    position: 'relative',
    zIndex: 1,
    blockSize: '3rem',
  }}
>
  <Popover label="Menu">
    <Popover.Trigger>Open</Popover.Trigger>
    <Popover.Content>Not clipped.</Popover.Content>
  </Popover>
</div>
```

Inside a modal dialog (itself in the top layer) — the popover opens above it and takes input:

```tsx
import { Modal } from '@fubaritico/react/Modal'
import { Popover } from '@fubaritico/react/Popover'

export function InDialog({ onClose }: Readonly<{ onClose: () => void }>) {
  return (
    <Modal isOpen onClose={onClose} aria-label="Settings">
      <Popover label="Details">
        <Popover.Trigger>Details</Popover.Trigger>
        <Popover.Content>Above the dialog.</Popover.Content>
      </Popover>
    </Modal>
  )
}
```

## Props

### `Popover`

| Name           | Type                      | Default | Description                                                                          |
| -------------- | ------------------------- | ------- | ------------------------------------------------------------------------------------ |
| `children`     | `ReactNode`               | —       | The trigger and the content. **Required.**                                           |
| `open`         | `boolean`                 | —       | Controlled open state.                                                               |
| `defaultOpen`  | `boolean`                 | `false` | Initial open state when uncontrolled.                                                |
| `onOpenChange` | `(open: boolean) => void` | —       | Every open / close, Escape and click outside too.                                    |
| `label`        | `string`                  | —       | Accessible name of the surface (a `dialog`).                                         |
| `service`      | `PopoverService`          | created | Injected service; read once at mount, keeps its own options unless a prop is passed. |

The root renders no element.

### `Popover.Trigger`

| Name        | Type             | Default | Description                                                                |
| ----------- | ---------------- | ------- | -------------------------------------------------------------------------- |
| `children`  | `ReactNode`      | —       | The button's content; give the button a name (text or `aria-label`).       |
| `...button` | `<button>` props | —       | Except `type`, `popoverTarget`, `aria-expanded/controls/haspopup` (owned). |

### `Popover.Content`

| Name       | Type          | Default | Description                                         |
| ---------- | ------------- | ------- | --------------------------------------------------- |
| `children` | `ReactNode`   | —       | The surface's content.                              |
| `...div`   | `<div>` props | —       | Except `id`, `role`, `popover`, `tabIndex` (owned). |

## Accessibility

- The trigger has `aria-haspopup="dialog"`, `aria-expanded` and `aria-controls`; give it a name.
- The surface is a non-modal `role="dialog"` named by `label` — or by a heading inside it, linked with
  `aria-labelledby` on `Popover.Content`.
- Escape closes it and returns focus to the trigger; Tab moves through its content in DOM order (it
  sits right after the trigger in the DOM).

## Notes

> **Note** — no portal: the surface stays next to its trigger in the DOM (good reading order) and the
> top layer puts it above everything. Do not wrap it in a portal.

> **Warning** — a portal would break it inside a modal dialog: `showModal()` makes everything outside
> the dialog inert, so a surface moved to `<body>` could not be clicked. Left in place, it opens
> above the dialog (opened later, higher in the top layer) and Escape closes it before the dialog.

> **Warning** — never set `display` on `.ui-popover` from your own CSS or `style`: it would override
> the browser rule that hides a closed popover, and leave it visible while closed.

> **Note** — anchor positioning needs Chrome 125, Safari 26 or Firefox 147. In an older browser the
> surface is centred in the viewport instead of next to its trigger — still on top and usable.
