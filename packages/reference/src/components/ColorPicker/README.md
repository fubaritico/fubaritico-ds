# ColorPicker

Picks a colour on a 2D saturation / brightness area, a hue track, an optional alpha track and a hex
field — with an optional explicit "automatic / no colour" state. A thin React adapter over
`ColorPickerService` from `@fubaritico/behaviors`, which owns the behaviour.

## Capabilities

- **HSVA source of truth** — the hue survives grays, black and the automatic state: pulling the
  saturation to 0 and back never makes the hue jump to red.
- **Automatic state** (`nullable`) — the value can be `null`, a first-class state with its own swatch,
  toggle (`aria-pressed`) and accessible text. Leaving it restores the last colour.
- **Pointer** — drag on the area with pointer capture (keeps tracking outside it); Escape during a
  drag puts the colour back.
- **Keyboard** — on the area: arrows (saturation ←→, brightness ↑↓), Page Up / Down, Home / End,
  Shift for steps of 10; the hue and alpha tracks are native range inputs.
- **Two callbacks** — `onChange` on every move, `onChangeComplete` once a change settles (release,
  key, hex commit, focus leaving a track): use the latter for anything expensive.
- **Hex field** — typing never reformats it; the draft applies on Enter or blur. An invalid draft
  shows a text error on Enter and is discarded on blur; Escape restores the current hex.
- **Announcements** — a polite live region speaks the colour ("dark blue") after each settled change,
  never during a drag.
- **RTL** — the saturation axis and the tracks run from the inline-start, and follow a `dir` that
  changes after mount.
- **Composable** — without children it renders the default arrangement; compose the parts to arrange
  your own. Behaviour injectable through `service`.

## Import

```tsx
import { ColorPicker } from '@fubaritico/react/ColorPicker'
```

## Basic usage

```tsx
import { ColorPicker } from '@fubaritico/react/ColorPicker'

import type { ColorValue } from '@fubaritico/react/ColorPicker'

export function FillField({ onSave }: { onSave: (value: ColorValue) => void }) {
  return (
    <ColorPicker
      defaultValue={{ h: 210, s: 80, v: 60, a: 1 }}
      onChangeComplete={onSave}
    />
  )
}
```

## Variants & options

The automatic state — `null` means "no colour, the palette decides":

```tsx
<ColorPicker nullable defaultValue={null} />
```

With the alpha track:

```tsx
<ColorPicker alpha defaultValue={{ h: 210, s: 80, v: 60, a: 0.6 }} />
```

Controlled:

```tsx
import { useState } from 'react'

import { ColorPicker } from '@fubaritico/react/ColorPicker'

import type { ColorValue } from '@fubaritico/react/ColorPicker'

export function ControlledPicker() {
  const [color, setColor] = useState<ColorValue>({ h: 210, s: 80, v: 60, a: 1 })
  return <ColorPicker value={color} onChange={setColor} nullable />
}
```

Your own arrangement (the live region is always rendered):

```tsx
<ColorPicker defaultValue={{ h: 210, s: 80, v: 60, a: 1 }}>
  <ColorPicker.Area />
  <ColorPicker.Hue />
  <div style={{ display: 'flex', gap: '0.75rem' }}>
    <ColorPicker.Swatch />
    <ColorPicker.HexField />
  </div>
</ColorPicker>
```

Localised — labels plus your own colour words:

```tsx
import { ColorPicker } from '@fubaritico/react/ColorPicker'

import type { HsvaColor } from '@fubaritico/react/ColorPicker'

const enFrancais = (color: HsvaColor) => (color.v < 20 ? 'noir' : 'couleur') // your describer

export function FrenchPicker() {
  return (
    <ColorPicker
      defaultValue={{ h: 210, s: 80, v: 60, a: 1 }}
      labels={{
        picker: 'Couleur de fond',
        hue: 'Teinte',
        hexInvalid: 'Couleur hexadécimale invalide',
      }}
      describeColor={enFrancais}
    />
  )
}
```

Inline in a page, inside a card (the panel has no surface of its own):

```tsx
import { Card } from '@fubaritico/react/Card'
import { ColorPicker } from '@fubaritico/react/ColorPicker'

export function FillCard() {
  return (
    <Card variant="outline">
      <Card.Body>
        <ColorPicker defaultValue={{ h: 210, s: 80, v: 60, a: 1 }} />
      </Card.Body>
    </Card>
  )
}
```

## Edge cases

A `null` default on a picker that is **not** nullable starts from the placeholder — pure red unless
you pass one:

```tsx
<ColorPicker defaultValue={null} />
<ColorPicker defaultValue={null} placeholder={{ h: 0, s: 0, v: 100, a: 1 }} /> {/* starts white */}
```

Driven from outside the tree — inject the service:

```tsx
import { createColorPickerService } from '@fubaritico/behaviors'
import { ColorPicker } from '@fubaritico/react/ColorPicker'

const fill = createColorPickerService({ uid: 'fill', nullable: true })

export function ExternallyDriven() {
  return (
    <>
      <ColorPicker service={fill} />
      <button type="button" onClick={() => fill.setAuto()}>
        Reset to automatic
      </button>
    </>
  )
}
```

A custom part, through the controller hook:

```tsx
import { useColorPickerController } from '@fubaritico/react/ColorPicker'

function HexReadout() {
  const { state } = useColorPickerController() // { state: snapshot, service }
  return <output>{state.hex ?? 'automatic'}</output>
}

;<ColorPicker defaultValue={{ h: 210, s: 80, v: 60, a: 1 }}>
  <ColorPicker.Area />
  <HexReadout />
</ColorPicker>
```

Reading the value in another model:

```tsx
import { hsvaToHex } from '@fubaritico/behaviors'

hsvaToHex({ h: 210, s: 80, v: 60, a: 1 }) // '#1f5c99'
```

## Props

### `ColorPicker`

| Name                     | Type                           | Default  | Description                                     |
| ------------------------ | ------------------------------ | -------- | ----------------------------------------------- |
| `value`                  | `HsvaColor \| null`            | —        | Controlled value (`null` = automatic).          |
| `defaultValue`           | `HsvaColor \| null`            | —        | Initial value when uncontrolled.                |
| `onChange`               | `(value: ColorValue) => void`  | —        | Every change, continuously while dragging.      |
| `onChangeComplete`       | `(value: ColorValue) => void`  | —        | Once a change settles.                          |
| `nullable`               | `boolean`                      | `false`  | Allows the automatic state.                     |
| `alpha`                  | `boolean`                      | `false`  | Edits the alpha channel.                        |
| `disabled`               | `boolean`                      | `false`  | Blocks every change.                            |
| `placeholder`            | `HsvaColor`                    | pure red | Thumb position while nothing was chosen.        |
| `labels`                 | `Partial<ColorPickerLabels>`   | English  | Accessible labels and messages (below).         |
| `describeColor`          | `(color: HsvaColor) => string` | English  | Colour-to-words for screen readers.             |
| `service`                | `ColorPickerService`           | created  | Injected behaviour service; read once at mount. |
| …`ComponentProps<'div'>` | —                              | —        | On the panel root (`aria-label` overrides).     |

`HsvaColor` is `{ h: 0–360, s: 0–100, v: 0–100, a: 0–1 }`; `ColorValue` is `HsvaColor | null`.

### `labels`

| Key                    | Default                             | Used for                              |
| ---------------------- | ----------------------------------- | ------------------------------------- |
| `picker`               | `Color picker`                      | The panel's group name                |
| `area`                 | `Color`                             | The 2D area's group name              |
| `saturation`           | `Saturation`                        | The area's inline axis                |
| `brightness`           | `Brightness`                        | The area's block axis                 |
| `areaRoleDescription`  | `2D slider`                         | Role description of the area's inputs |
| `hue`                  | `Hue`                               | The hue track                         |
| `alpha`                | `Opacity`                           | The alpha track                       |
| `hex`                  | `Hex color`                         | The hex field                         |
| `hexInvalid`           | `Enter a hex color such as #1976d2` | The hex error message                 |
| `automatic`            | `Automatic`                         | The automatic toggle                  |
| `automaticDescription` | `Automatic, no color selected`      | How the automatic state is announced  |

### Parts

| Part                     | Renders                       | Props                                                   | Notes                     |
| ------------------------ | ----------------------------- | ------------------------------------------------------- | ------------------------- |
| `ColorPicker.Area`       | the 2D area                   | `<div>` props (pointer handlers run first, may prevent) | —                         |
| `ColorPicker.Hue`        | the hue `Slider`              | `Slider` props minus value / range / ARIA / callbacks   | —                         |
| `ColorPicker.Alpha`      | the alpha `Slider`            | same as `Hue`                                           | `null` without `alpha`    |
| `ColorPicker.HexField`   | the hex `<input>` + its error | `<input>` props minus id / value / ARIA state           | `onKeyDown` runs first    |
| `ColorPicker.Swatch`     | a `<span role="img">`         | `<span>` props                                          | —                         |
| `ColorPicker.AutoToggle` | a `Button`                    | `Button` props minus pressed state / name / children    | `null` without `nullable` |

`useColorPickerController()` returns `{ state, service }` — the live snapshot and the service's
imperative API — for a custom part inside `<ColorPicker>`.

## Accessibility

- The panel is a `group` named "Color picker" (`labels.picker`, or your `aria-label`), so several
  pickers on a page are told apart.
- The area is a `group` named "Color" holding two visually hidden native range inputs announced as
  a "2D slider" (WAI-ARIA has no 2D slider pattern). Only the saturation input is tabbable; its keys
  drive both axes, and **both** inputs announce both coordinates plus the colour in words —
  "Saturation 45%, Brightness 80%, dark red", not "x: 120".
- The thumb's focus ring is two-tone (dark ring + light halo), drawn on keyboard focus only
  (`:focus-visible`), so it stays visible on any colour under it (WCAG 1.4.11).
- The hue and alpha tracks are `Slider`s: native role, value and keyboard. A change an assistive
  technology makes directly settles when focus leaves the track.
- The automatic toggle is a pressed / unpressed button with a constant name.
- An invalid hex is announced (`role="alert"`), shown under the field and linked with
  `aria-describedby`.
- A polite live region announces each settled change.

## Notes

> **Warning** — store the value as `HsvaColor`, not as hex. Hex loses the hue of every gray; the
> picker protects its own thumbs when you echo a hex-derived value back, but anything you derive
> yourself from hex will not.

> **Note** — use `onChangeComplete` for writes (network, store far away): `onChange` fires at
> pointer-move rate.

> **Note** — `labels` is compared by content, so an inline object is fine; memoise `describeColor` if
> you pass one.

> **Note** — the panel has no surface of its own (no border, background or padding): a popover
> brings one, and inline you compose a `Card`. Giving it a surface would double the chrome inside a
> popover.
