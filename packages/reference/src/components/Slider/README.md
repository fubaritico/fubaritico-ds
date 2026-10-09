# Slider

A value along a track. The visible parts are painted by the skin; the control underneath is a real
`<input type="range">`, so the behaviour is the platform's.

## Capabilities

- **Platform keyboard, free** — arrows, Home, End, Page Up, Page Down, and the step honoured, all
  from the native range input rather than from code we wrote.
- **Platform semantics, free** — `role="slider"`, `aria-valuemin` / `max` / `now`, form
  participation (`name`, submission, reset).
- **Two change signals** — `onChange` on every move, `onChangeComplete` once the interaction ends.
- **Controlled or uncontrolled** — `value` + `onChange`, or `defaultValue`.
- **Three sizes** — `sm` / `md` / `lg`, scaling track and thumb together.
- **Arbitrary track background** — `trackImage` takes any CSS gradient; the filled range steps
  aside. This is what makes a hue, alpha or channel slider _this_ component.
- **Spoken values** — `formatValue` builds the `aria-valuetext` sentence.
- **Deeply re-skinnable** — 20 custom properties covering geometry, colour, states, focus and
  motion.
- **RTL-correct** — the track fills from the inline-start edge and the thumb follows.

> **N/A — ranges.** One thumb. A two-thumb range is a different control and is not built yet.

> **N/A — vertical.** Horizontal only. Vertical range inputs depend on `writing-mode` support that
> is still uneven, and nothing in the system needs one yet.

## Import

```tsx
import { Slider } from '@fubaritico/react/Slider'
```

## Basic usage

```tsx
<Slider defaultValue={40} aria-label="Volume" />
```

## Variants & options

Controlled, with the two change signals kept apart:

```tsx
const [value, setValue] = useState(40)

<Slider
  value={value}
  onChange={setValue}          // every move — cheap work only
  onChangeComplete={persist}   // once, on release — the network call goes here
  aria-label="Quality"
/>
```

Sizes and a custom range:

```tsx
<Slider defaultValue={30} size="sm" aria-label="Thin" />
<Slider defaultValue={6} min={0} max={10} step={1} aria-label="Rating" />
```

A hue slider — the same component, a gradient track, a spoken value:

```tsx
<Slider
  value={hue}
  onChange={setHue}
  min={0}
  max={360}
  trackImage="linear-gradient(to right, #f00, #ff0, #0f0, #0ff, #00f, #f0f, #f00)"
  formatValue={(v) => `hue ${v} degrees`}
  aria-label="Hue"
/>
```

Re-skinned to something square and chunky, with no new component and no CSS file:

```tsx
<Slider
  defaultValue={45}
  aria-label="Square"
  style={
    {
      '--ui-slider-track-thickness': '1.25rem',
      '--ui-slider-track-radius': '0',
      '--ui-slider-thumb-radius': '0',
      '--ui-slider-thumb-size': '1.75rem',
    } as CSSProperties
  }
/>
```

## Edge cases

```tsx
{
  /* No value given — starts at min */
}
;<Slider min={10} max={20} aria-label="Range" />

{
  /* A degenerate range renders an empty track rather than NaN */
}
;<Slider value={5} min={5} max={5} aria-label="Fixed" />

{
  /* Out-of-range values are clamped, never overflowing the track */
}
;<Slider value={150} max={100} aria-label="Clamped" />
```

## Props

| Name                       | Type                        | Default | Description                                              |
| -------------------------- | --------------------------- | ------- | -------------------------------------------------------- |
| `value`                    | `number`                    | —       | Current value, when controlled.                          |
| `defaultValue`             | `number`                    | `min`   | Initial value, when uncontrolled.                        |
| `min`                      | `number`                    | `0`     | Lowest value.                                            |
| `max`                      | `number`                    | `100`   | Highest value.                                           |
| `step`                     | `number`                    | `1`     | Granularity.                                             |
| `onChange`                 | `(value: number) => void`   | —       | Fires on every change, continuously while dragging.      |
| `onChangeComplete`         | `(value: number) => void`   | —       | Fires once the interaction ends.                         |
| `size`                     | `'sm' \| 'md' \| 'lg'`      | `'md'`  | Track and thumb scale.                                   |
| `trackImage`               | `string`                    | —       | Any CSS `background-image`; also hides the filled range. |
| `formatValue`              | `(value: number) => string` | —       | Builds the `aria-valuetext` sentence.                    |
| `disabled`                 | `boolean`                   | `false` | Non-interactive.                                         |
| `aria-label`               | `string`                    | —       | Accessible name. **Required.**                           |
| …`ComponentProps<'input'>` | —                           | —       | Everything else lands on the native range.               |

## Custom properties

Everything cosmetic is overridable. What is **not** exposed is the mechanics — the thumb centred
on the track, the hit area, the position maths — because exposing those only offers ways to break
the control.

| Group        | Properties                                                                                                                                                               |
| ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Geometry** | `--ui-slider-track-thickness`, `--ui-slider-track-radius`, `--ui-slider-thumb-size`, `--ui-slider-thumb-radius`, `--ui-slider-thumb-border-width`                        |
| **Colour**   | `--ui-slider-track-color`, `--ui-slider-range-color`, `--ui-slider-thumb-color`, `--ui-slider-thumb-border-color`, `--ui-slider-thumb-shadow`, `--ui-slider-track-image` |
| **States**   | `--ui-slider-thumb-hover-scale`, `--ui-slider-thumb-active-scale`, `--ui-slider-disabled-opacity`                                                                        |
| **Focus**    | `--ui-slider-ring-color`, `--ui-slider-ring-width`, `--ui-slider-ring-offset`                                                                                            |
| **Motion**   | `--ui-slider-transition-duration`, `--ui-slider-transition-easing`                                                                                                       |

## Accessibility

- The control is a native `<input type="range">`: the role, the value attributes and the whole
  keyboard model are the browser's, not an approximation of them.
- **`aria-label` is required and type-checked** — a range input has no content to name itself from.
  If you render a visible label, point `aria-labelledby` at it instead; ARIA gives it precedence.
- **Use `formatValue` whenever the number is not what the user perceives.** "210" tells a screen
  reader user nothing about a hue; "hue 210 degrees, blue" does.
- The default thumb is white with a dark border on purpose: a slider may sit over an arbitrary
  background — a hue ramp, a photograph — where a single-colour handle would vanish. The two-tone
  ring keeps it visible, which is WCAG 1.4.11 as much as taste.
- The focus ring is `:focus-visible` and lands on the visible thumb, not on the transparent input.
- The hover growth is dropped under `prefers-reduced-motion`.

## Notes

> **Warning** — `onChange` can fire at pointer-move rate. Put anything expensive — a request, a
> write to a distant store — in `onChangeComplete`, which fires once the interaction ends.

> **Note** — `trackImage` and the filled range are mutually exclusive by design: a track that
> carries its own meaning must not be painted over. Setting one turns the other off.

> **Note** — the keyboard model is the platform's, which also means jsdom does not implement it:
> the component's unit tests cover the wiring and the value maths, and the keyboard itself is
> verified in Storybook. Do not read the absence of keyboard unit tests as an absence of keyboard
> support.

> **Note** — the thumb is the one element in this design system where a full radius is the
> default, because a circular handle is a functional affordance rather than decoration. Square it
> with `--ui-slider-thumb-radius: 0` if your theme asks for it.
