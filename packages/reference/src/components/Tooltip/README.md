# Tooltip

A floating bubble in the browser's top layer that anchors to a target — a presentational
positioning primitive (`Tooltip`) plus the trigger behaviour that drives it (`useTooltip`).

## Capabilities

- **Trigger behaviour, written once (`useTooltip`)** — opens on hover after a short delay and at once
  on keyboard focus; closes on leave (after a grace delay) and on blur; **Escape** dismisses it
  without moving focus (and without closing a surrounding Modal); the pointer can **rest on the
  bubble** without it closing. That is WCAG 1.4.13 (dismissible, hoverable, persistent). It also
  links the trigger with `aria-describedby`. The logic is the framework-agnostic `TooltipService`.
- **Controlled visibility** — the Tooltip itself renders what `visible` says and nothing when hidden,
  so you can also drive it yourself (a click, a validation message).
- **Positioning** — `mode="target"` anchors to a `targetRef` and **auto-flips** to the opposite side
  when there isn't enough room in the viewport; `mode="manual"` places it at explicit `{ top, left }`.
- **12 placements** — `top` / `bottom` / `left` / `right`, each with optional alignment suffix
  (`-left` / `-right` / `-top` / `-bottom`); a CSS-triangle arrow points back at the target.
- **Reposition on scroll/resize** — listens while visible and recomputes.
- **Top layer, no portal** — a `popover="manual"` element rendered in place: above every `z-index`,
  unclipped by any `overflow`, and still inside the `Modal` / `Drawer` it is opened from (a portal
  to `body` would put it under the dialog, in the inert part of the page). `portalContainer` mounts
  it elsewhere if you really need to. The bubble is `pointer-events: none` so it never blocks the
  target.
- **Variants** — `dark` (default) / `light` (bordered). The arrow tracks the bubble: same fill,
  and a bordered bubble keeps one continuous outline around it (`--ui-tooltip-border-width` /
  `--ui-tooltip-border-color`). Under forced colours (Windows high contrast) every variant gets a
  system-colour outline and the arrow stays a triangle.

## Import

```tsx
import { Tooltip, useTooltip } from '@fubaritico/react/Tooltip'
```

## Basic usage

```tsx
const ref = useRef<HTMLButtonElement>(null)
const { open, triggerProps, bubbleProps } = useTooltip()

<button ref={ref} type="button" {...triggerProps}>
  Save
</button>
<Tooltip content="Save your changes" visible={open} targetRef={ref} placement="top" {...bubbleProps} />
```

`useTooltip` takes the service's options: `openDelay` (300 ms), `closeDelay` (150 ms), `disabled`,
`describe` (`false` when the bubble only repeats text assistive technology already reads — it is then
`aria-hidden`), a controlled `open` + `onOpenChange`, or an injected `service`.

## Variants & options

```tsx
{
  /* Light variant */
}
;<Tooltip content="Light" visible variant="light" targetRef={ref} />

{
  /* Placement + alignment */
}
;<Tooltip
  content="Right, top-aligned"
  visible
  placement="right-top"
  targetRef={ref}
/>

{
  /* Fixed width → text wraps */
}
;<Tooltip
  content="A longer, multi-line hint"
  visible
  width={200}
  targetRef={ref}
/>

{
  /* Custom gap from the target */
}
;<Tooltip content="Further away" visible offset={16} targetRef={ref} />
```

## Edge cases

```tsx
{
  /* Manual coordinates (no target) — e.g. follow the cursor */
}
;<Tooltip
  content="At 120,80"
  visible
  mode="manual"
  position={{ top: 80, left: 120 }}
/>

{
  /* No visible trigger text — describe the content for SR */
}
;<Tooltip
  content={<Icon name="InformationCircle" size={16} />}
  visible
  targetRef={ref}
  aria-label="More information"
/>
```

## Props / API

| Prop         | Type                             | Default    | Description                                    |
| ------------ | -------------------------------- | ---------- | ---------------------------------------------- |
| `content`    | `ReactNode`                      | —          | Bubble content (required).                     |
| `visible`    | `boolean`                        | —          | Controlled visibility (required).              |
| `variant`    | `'dark' \| 'light'`              | `'dark'`   | Visual style.                                  |
| `placement`  | `TooltipPlacement`               | `'bottom'` | Preferred side + alignment; may flip.          |
| `offset`     | `number`                         | `10`       | Gap (px) between target and bubble.            |
| `mode`       | `'target' \| 'manual'`           | `'target'` | Anchor to `targetRef` or to `position`.        |
| `targetRef`  | `RefObject<HTMLElement \| null>` | —          | Anchor element (required for `mode="target"`). |
| `position`   | `{ top: number; left: number }`  | —          | Coordinates (required for `mode="manual"`).    |
| `width`      | `number`                         | —          | Fixed bubble width (px); content wraps.        |
| `portalContainer` | `HTMLElement \| null` | — | Mount the bubble there instead of in place. Not inside a `Modal` / `Drawer`. |
| `aria-label` | `string`                         | —          | Accessible label for the bubble.               |
| `className`  | `string`                         | —          | Extra classes on the bubble.                   |

## Accessibility

- The bubble has `role="tooltip"`; `useTooltip` links it to its trigger with `aria-describedby`
  while it is shown, and gives it a stable id.
- Shown on **both** hover and keyboard focus — so the trigger must be focusable (a button, a link,
  or `tabIndex={0}`); hidden on blur, leave and `Escape` (WCAG 1.4.13).
- A bubble wired by `useTooltip` is hoverable (`data-hoverable` gives it pointer events); a bare
  bubble is `pointer-events: none` so it never steals interaction from the target.

## Notes

> **Warning** — render the Tooltip as a **sibling** of its trigger, never inside a `<button>`, a link
> or a `<p>`: a `role="tooltip"` `<div>` is invalid there, and inside a control its text would join
> the control's accessible name. Its typography is reset (it does not inherit `nowrap`, alignment or
> case from where it sits), so a truncated cell or a right-aligned column is a fine place to be next to.

> **Note** — the top layer stacks in **opening order**: a tooltip opened from inside a `Modal` paints
> over it, but a tooltip already visible when a `Modal` / `Drawer` / `Popover` opens ends up under it.
> Hide tooltips before opening a dialog from the same trigger.

> **Note** — wiring the trigger by hand (your own `onMouseEnter` / `onFocus`) still works, but you
> then own the delays, Escape, hoverability and `aria-describedby`. Prefer `useTooltip`.

> **Note** — In `mode="manual"` no arrow is rendered (there's no measured target to point at).

> **Warning** — `targetRef` is required for `mode="target"` and `position` for `mode="manual"`; without
> them the bubble renders at `0,0`.

> **Note** — the arrow's size is geometry, not look: `--ui-tooltip-arrow-size` must stay equal to
> the positioning's `ARROW_SIZE` (6px). Re-skin the arrow through the colour and border vars, not by
> resizing it.
