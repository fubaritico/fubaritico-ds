# Tooltip

A controlled, portalled floating bubble that anchors to a target (or explicit coordinates) — a
low-level presentational positioning primitive, not a self-managing hover wrapper.

## Capabilities

- **Controlled visibility** — the parent owns `visible`; the Tooltip renders nothing when hidden. You
  decide when to show it (hover, focus, click) and wire the trigger.
- **Positioning** — `mode="target"` anchors to a `targetRef` and **auto-flips** to the opposite side
  when there isn't enough room in the viewport; `mode="manual"` places it at explicit `{ top, left }`.
- **12 placements** — `top` / `bottom` / `left` / `right`, each with optional alignment suffix
  (`-left` / `-right` / `-top` / `-bottom`); a CSS-triangle arrow points back at the target.
- **Reposition on scroll/resize** — listens while visible and recomputes.
- **Portalled** — renders into a `Portal` so it escapes `overflow`/stacking contexts; the bubble is
  `pointer-events: none` so it never blocks the target.
- **Variants** — `dark` (default) / `light`. The arrow colour tracks the bubble background.

## Import

```tsx
import { Tooltip } from '@fubaritico-ds/reference/Tooltip'
```

## Basic usage

```tsx
const ref = useRef<HTMLButtonElement>(null)
const [open, setOpen] = useState(false)

<button
  ref={ref}
  aria-describedby="save-tip"
  onMouseEnter={() => setOpen(true)}
  onMouseLeave={() => setOpen(false)}
  onFocus={() => setOpen(true)}
  onBlur={() => setOpen(false)}
>
  Save
</button>
<Tooltip id="save-tip" content="Save your changes" visible={open} targetRef={ref} placement="top" />
```

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
| `aria-label` | `string`                         | —          | Accessible label for the bubble.               |
| `className`  | `string`                         | —          | Extra classes on the bubble.                   |

## Accessibility

- The bubble has `role="tooltip"`. Link it to its target with `aria-describedby` (use a stable `id`).
- Show on **both** hover and keyboard focus; hide on blur/leave/`Escape`.
- The bubble is `pointer-events: none` so it never steals interaction from the target.

## Notes

> **Note** — This Tooltip is **controlled and low-level**: it does not manage its own hover/focus or
> `aria-describedby`. Own the `visible` state and wire the trigger + ARIA on the target yourself.

> **Note** — In `mode="manual"` no arrow is rendered (there's no measured target to point at).

> **Warning** — `targetRef` is required for `mode="target"` and `position` for `mode="manual"`; without
> them the bubble renders at `0,0`.
