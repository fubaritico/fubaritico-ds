# Toast

The page's one stack of short notifications — a `<Toaster>` mounted once, fed by `toast()` from
anywhere. Headless at its core: the behaviour (limit, timers, pause, keyboard, announcements) is the
framework-agnostic toast machine of `@fubaritico/behaviors`; this package binds it to React.

## Capabilities

- **One stack per page** — even across micro-frontends: every bundle that calls `toast()` reaches the
  same stack (a shared slot on `globalThis`, checked by shape and contract version).
- **Five at most** — the sixth toast evicts the oldest (`max`).
- **Timed, and pausable (WCAG 2.2.1)** — 5 s by default (`duration`); the timers wait while the
  pointer is on the stack, focus is inside it, or the page is hidden. An `urgent` toast stays until
  it is dismissed.
- **Six positions** — `top-start`, `top-center`, `top-end`, `bottom-start`, `bottom-center`,
  `bottom-end`, logical (they follow the text direction). The newest toast sits nearest the screen
  centre: last at the top of the screen, first at the bottom.
- **Announced without taking focus (WCAG 4.1.3)** — a polite live region, and an assertive one for
  `urgent` toasts; two toasts in a row are both heard.
- **Keyboard** — F8 moves focus into the stack (`hotkey`); Tab moves between toasts; Escape closes
  the focused one.
- **Above a Modal** — while a modal `<dialog>` is open the stack renders inside it, so a toast stays
  clickable and focusable; Escape on a toast closes the toast, not the Modal.
- **Content** — a message (title, description, an intent glyph) or free content (`toast.custom`),
  an `Alert` included.
- **Intents** — `neutral` (default, no glyph), `info`, `success`, `warning`, `error`: the border and
  the glyph carry the intent, never the surface, so the text keeps full contrast.
- **Named** — each toast by its title (else its description, or the `label` of free content), each
  close button after its toast: « Close Saved », never five identical « Close ».

## Import

```tsx
import { Toaster, toast } from '@fubaritico/react/Toast'
```

## Basic usage

Mount the Toaster once, near the root of the page — in micro-frontends, in the host only:

```tsx
export function App() {
  return (
    <>
      <Routes />
      <Toaster />
    </>
  )
}
```

Then show toasts from anywhere — a handler, a `catch`, a utility outside React:

```tsx
toast('Saved')
```

## Variants & options

The intents:

```tsx
toast('Draft kept')
toast.info('A new version is available')
toast.success('Your changes were saved')
toast.warning('Your storage is nearly full')
toast.error('We could not save your changes')
```

A description under the title:

```tsx
toast.error('Upload failed', {
  description: 'The file exceeds the 25 MB limit.',
})
```

Another glyph than the intent's:

```tsx
toast('Bookmarked', { icon: 'Bookmark' })
```

A lifetime of its own, or none:

```tsx
toast('Copied', { duration: 2000 })
toast('Uploading…', { id: 'upload', duration: Infinity, dismissible: false })
```

Replace a toast in place — same `id`, new content, its timer restarts:

```tsx
toast('Saving…', { id: 'save', duration: Infinity })
// later
toast.success('Saved', { id: 'save' })
```

Urgent — it interrupts the screen reader, and stays until dismissed:

```tsx
toast.error('You are offline', { urgent: true })
```

Close one, or all:

```tsx
const id = toast('Processing', { duration: Infinity })
toast.dismiss(id)
toast.dismissAll()
```

Free content — any node; `bare` drops the toast's own surface for content that brings one:

```tsx
import { Alert } from '@fubaritico/react/Alert'

toast.custom(
  <Alert variant="success" title="Invoice sent">
    It reaches Acme within the hour.
  </Alert>,
  { bare: true, label: 'Invoice sent' }
)
```

The stack's position, limit, lifetime and words:

```tsx
<Toaster
  position="top-center"
  max={3}
  duration={8000}
  label="Notifications"
  closeLabel="Fermer"
  hotkey="F8"
/>
```

## Edge cases

A toast from inside a Modal — shown above it, and still read as the Modal closes:

```tsx
import { Button } from '@fubaritico/react/Button'
import { toast } from '@fubaritico/react/Toast'

export function SaveButton({ onSaved }: { onSaved: () => void }) {
  return (
    <Button
      onClick={() => {
        toast.success('Saved')
        onSaved() // closes the Modal
      }}
    >
      Save
    </Button>
  )
}
```

No title — the toast and its close button are named by the description:

```tsx
toast('', { description: 'Two files were skipped.' })
```

Several bundles on one page (micro-frontends) — each calls `toast()`, the page's one `<Toaster>` shows
them all; a bundle of another framework sends message toasts only:

```tsx
// in any bundle of the page
toast.warning('Your session ends in 5 minutes', { duration: Infinity })
```

A stack of its own — a test, a story, a page running untrusted scripts:

```tsx
import { createToaster } from '@fubaritico/behaviors'
import { Toaster, createToastApi } from '@fubaritico/react/Toast'

import type { ReactToastContent } from '@fubaritico/react/Toast'

const adminToaster = createToaster<ReactToastContent>({ uid: 'admin' })
export const adminToast = createToastApi(() => adminToaster)

export function AdminToaster() {
  return <Toaster toaster={adminToaster} />
}
```

## Props

`<Toaster>` — extends `<section>` (minus `children`, `role`, `popover`):

| Name         | Type               | Default           | Description                                                      |
| ------------ | ------------------ | ----------------- | ---------------------------------------------------------------- |
| `position`   | `ToasterPosition`  | `'bottom-end'`    | Where the stack sits — six logical positions.                    |
| `max`        | `number`           | `5`               | How many toasts are shown at once; the next evicts the oldest.   |
| `duration`   | `number`           | `5000`            | Default lifetime of a toast, in ms.                              |
| `label`      | `string`           | `'Notifications'` | Accessible name of the stack, its hotkey appended.               |
| `closeLabel` | `string`           | `'Close'`         | The close buttons' word, followed by the toast's name.           |
| `hotkey`     | `string`           | `'F8'`            | The key that moves focus into the stack.                         |
| `toaster`    | `ReactToaster`     | the page's one    | An injected toaster; read once, at mount (remount with a `key`). |
| `ref`        | `Ref<HTMLElement>` | —                 | Receives the stack's `<section>`.                                |

`toast(title, options)` and `toast.success / info / warning / error(title, options)`:

| Option        | Type                                                       | Default       | Description                                         |
| ------------- | ---------------------------------------------------------- | ------------- | --------------------------------------------------- |
| `description` | `string`                                                   | —             | The text under the title.                           |
| `variant`     | `'neutral' \| 'info' \| 'success' \| 'warning' \| 'error'` | `'neutral'`   | The intent (`toast()` only; the others fix it).     |
| `icon`        | `IconName`                                                 | intent glyph  | Another glyph of the design system's set.           |
| `id`          | `string`                                                   | generated     | Shown again while on screen, it replaces the toast. |
| `duration`    | `number`                                                   | the Toaster's | Lifetime in ms; `Infinity` until dismissed.         |
| `dismissible` | `boolean`                                                  | `true`        | A close button and Escape.                          |
| `urgent`      | `boolean`                                                  | `false`       | Assertive announcement; stays until dismissed.      |

`toast.custom(node, options)` — the same `id`, `duration`, `dismissible`, `urgent`, plus:

| Option  | Type      | Default    | Description                                                 |
| ------- | --------- | ---------- | ----------------------------------------------------------- |
| `label` | `string`  | (required) | The toast's accessible name — free content has no title.    |
| `bare`  | `boolean` | `false`    | Drops the toast's surface, for content that brings its own. |

Each returns the toast's id. `toast.dismiss(id)` returns whether a toast started leaving.

## Accessibility

- **Landmark** — the stack is a `region` named « Notifications (F8) ». It stays in the page while
  empty: its live regions must exist before the first toast to be announced.
- **Announcements** — two visually hidden `role="status"` regions, `aria-live="polite"` and
  `"assertive"`. A toast's text is written in the frame after it appears and cleared after a second;
  focus never moves.
- **Keyboard** — F8 (with no modifier) moves focus to the stack; each toast is focusable
  (`tabindex="0"`); Escape closes the focused toast; a toast leaving with the focus hands it to the
  stack.
- **Timing** — hover, focus inside the stack and a hidden page pause the timers; an `urgent` toast
  has no timer unless you give it a `duration`.
- **Contrast** — the border and the intent glyphs reach 3:1 on the surface (WCAG 1.4.11); the text
  keeps full contrast.
- **Target** — the close glyph is 32 px, its hit area 44 px.
- **Reflow** — past the viewport's height, the list scrolls (WCAG 1.4.10).

## Notes

> **Warning** — Mount **one** `<Toaster>` per page, in the **host**. In micro-frontends the remotes
> only call `toast()`: a second Toaster on the page's stack (one mounted in a remote) throws. A
> remote run on its own in development is a host — its demo shell mounts the Toaster.

> **Warning** — `toast.custom` needs a `label`: free content has no title, and an unnamed focusable
> toast cannot be told apart by a screen reader.

> **Note** — An `Alert` passed to `toast.custom` loses its live role (`role="none"`), otherwise it
> would be announced twice. Give it a `role` yourself to keep one.

> **Note** — Free content is React content: a bundle of another framework sharing the page can send
> a message toast (`title`, `description`, `icon`, `variant`), not its own components.

> **Note** — An icon name outside the design system's set throws at the `toast()` call, in the
> caller — not later, in the stack.

> **Note** — Every script of the page reaches the shared stack. A page running untrusted scripts
> injects its own (`createToaster` + `<Toaster toaster={…}>`).

> **Note** — Without the Popover API (an old browser) the stack is not lifted into the top layer, and
> without `:modal` support it does not move into an open dialog: toasts still show, in place.
