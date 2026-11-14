# ColorPicker

Picks a colour on a 2D saturation / brightness area, a hue track, an optional alpha track and a hex
field — with the optional explicit states "automatic" and "no colour". A thin React adapter over
`ColorPickerService` from `@fubaritico/behaviors`, which owns the behaviour.

## Capabilities

- **HSVA source of truth** — the hue survives grays, black, "automatic" and "no colour": pulling the
  saturation to 0 and back never makes the hue jump to red.
- **Three kinds of value** — a colour; "automatic" (`null`, with `nullable`): something else picks
  the colour; "no colour" (`'none'`, with `allowNone`): nothing is painted. Each is a first-class
  state with its own swatch (a magic wand for automatic, a struck-through square for no colour) and
  accessible text. A segmented mode group (Color · Automatic · None) switches between them; going back
  to "Color" restores the last colour.
- **Pointer** — drag on the area with pointer capture (keeps tracking outside it); Escape during a
  drag puts the colour back.
- **Keyboard** — on the area: arrows (saturation ←→, brightness ↑↓), Page Up / Down, Home / End,
  Shift for steps of 10; the hue and alpha tracks are native range inputs.
- **Two callbacks** — `onChange` on every move, `onChangeComplete` once a change settles (release,
  key, hex commit, focus leaving a track): use the latter for anything expensive.
- **Hex field** — typing never reformats it. A complete long form (`#1e90ff`, `#1e90ff80`) moves the
  palette live (`onChange`); Enter or blur settles it (`onChangeComplete`) and also applies a short
  form (`#19f`), which is not previewed since it is usually on its way to a long one. An invalid
  draft shows a text error on Enter and is discarded on blur; Escape goes back to the colour from
  before the typing.
- **Copy and paste** — two icon buttons beside the hex field copy the colour (as hex) and paste
  one from the clipboard, as a settled change that also leaves "automatic" and "no colour". Text that
  is not a colour changes nothing and is announced; so is a clipboard that refuses. Hidden where there
  is no clipboard.
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

Compact density — a SHORTER panel: same width, a flat 5:2 area, tighter gaps and smaller thumbs,
for popovers and dialogs (the default density is unchanged). It saves height, not width: a narrower
area would also be a less precise one.

```tsx
<ColorPicker defaultValue={{ h: 210, s: 80, v: 60, a: 1 }} density="compact" />
```

The automatic state — `null` means "something else decides" (a palette, a theme):

```tsx
<ColorPicker nullable defaultValue={null} />
```

The "no colour" state — `'none'` means "paint nothing" (a shape drawn without fill). Both together
give a three-way mode group:

```tsx
<ColorPicker nullable allowNone defaultValue="none" />
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

A `null` default on a picker that is **not** nullable — or a `'none'` default without `allowNone` —
starts from the placeholder, pure red unless you pass one:

```tsx
<ColorPicker defaultValue={null} />
<ColorPicker defaultValue="none" placeholder={{ h: 0, s: 0, v: 100, a: 1 }} /> {/* starts white */}
```

`allowNone` without `nullable` — a two-way group, Color · None:

```tsx
<ColorPicker allowNone defaultValue={{ h: 210, s: 80, v: 60, a: 1 }} />
```

Copy and paste — on by default with the browser's clipboard; `null` hides both buttons, and a
clipboard of your own (a test double, an app-level clipboard) is injected the same way:

```tsx
;<ColorPicker defaultValue={{ h: 210, s: 80, v: 60, a: 1 }} clipboard={null} />

const memory = { text: '' }
const appClipboard = {
  writeText: (text: string) => Promise.resolve(void (memory.text = text)),
  readText: () => Promise.resolve(memory.text),
}
;<ColorPicker
  defaultValue={{ h: 210, s: 80, v: 60, a: 1 }}
  clipboard={appClipboard}
/>
```

The two buttons in your own arrangement:

```tsx
<ColorPicker defaultValue={{ h: 210, s: 80, v: 60, a: 1 }}>
  <ColorPicker.Area />
  <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
    <ColorPicker.HexField />
    <ColorPicker.CopyButton />
    <ColorPicker.PasteButton />
  </div>
</ColorPicker>
```

Driven from outside the tree — inject the service:

```tsx
import { createColorPickerService } from '@fubaritico/behaviors'
import { ColorPicker } from '@fubaritico/react/ColorPicker'

const fill = createColorPickerService({
  uid: 'fill',
  nullable: true,
  allowNone: true,
})

export function ExternallyDriven() {
  return (
    <>
      <ColorPicker service={fill} />
      <button type="button" onClick={() => fill.setMode('auto')}>
        Reset to automatic
      </button>
      <button type="button" onClick={() => fill.setMode('none')}>
        No fill
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
  return <output>{state.hex ?? state.mode}</output> // 'auto' or 'none' when not a colour
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

| Name                     | Type                           | Default     | Description                                     |
| ------------------------ | ------------------------------ | ----------- | ----------------------------------------------- |
| `value`                  | `ColorValue`                   | —           | Controlled value (`null` automatic, `'none'`).  |
| `defaultValue`           | `ColorValue`                   | —           | Initial value when uncontrolled.                |
| `onChange`               | `(value: ColorValue) => void`  | —           | Every change, continuously while dragging.      |
| `onChangeComplete`       | `(value: ColorValue) => void`  | —           | Once a change settles.                          |
| `nullable`               | `boolean`                      | `false`     | Allows the automatic state (`null`).            |
| `allowNone`              | `boolean`                      | `false`     | Allows the "no colour" state (`'none'`).        |
| `alpha`                  | `boolean`                      | `false`     | Edits the alpha channel.                        |
| `disabled`               | `boolean`                      | `false`     | Blocks every change.                            |
| `density`                | `'default' \| 'compact'`       | `'default'` | Panel density.                                  |
| `placeholder`            | `HsvaColor`                    | pure red    | Thumb position while nothing was chosen.        |
| `labels`                 | `Partial<ColorPickerLabels>`   | English     | Accessible labels and messages (below).         |
| `describeColor`          | `(color: HsvaColor) => string` | English     | Colour-to-words for screen readers.             |
| `clipboard`              | `ColorClipboard \| null`       | the browser | Behind copy / paste; `null` hides both buttons. |
| `service`                | `ColorPickerService`           | created     | Injected behaviour service; read once at mount. |
| …`ComponentProps<'div'>` | —                              | —           | On the panel root (`aria-label` overrides).     |

`HsvaColor` is `{ h: 0–360, s: 0–100, v: 0–100, a: 0–1 }`; `ColorValue` is
`HsvaColor | null | 'none'`. `isColor(value)` from `@fubaritico/behaviors` narrows it to a colour.

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
| `mode`                 | `Color mode`                        | The mode group's name                 |
| `modeColor`            | `Color`                             | The mode group's colour option        |
| `automatic`            | `Automatic`                         | The automatic option, hex placeholder |
| `automaticDescription` | `Automatic color`                   | How the automatic state is announced  |
| `none`                 | `None`                              | The "no colour" option, placeholder   |
| `noneDescription`      | `No color`                          | How "no colour" is announced          |
| `copy`                 | `Copy color`                        | The copy button                       |
| `paste`                | `Paste a color`                     | The paste button                      |
| `copied`               | `Color copied`                      | Announced after a copy                |
| `pasteInvalid`         | `The clipboard holds no color`      | Announced for a paste that is no hex  |
| `clipboardFailed`      | `The clipboard could not be used`   | Announced when the platform refuses   |

### Parts

| Part                      | Renders                       | Props                                                   | Notes                     |
| ------------------------- | ----------------------------- | ------------------------------------------------------- | ------------------------- |
| `ColorPicker.Area`        | the 2D area                   | `<div>` props (pointer handlers run first, may prevent) | —                         |
| `ColorPicker.Hue`         | the hue `Slider`              | `Slider` props minus value / range / ARIA / callbacks   | —                         |
| `ColorPicker.Alpha`       | the alpha `Slider`            | same as `Hue`                                           | `null` without `alpha`    |
| `ColorPicker.HexField`    | the hex `<input>` + its error | `<input>` props minus id / value / ARIA state           | `onKeyDown` runs first    |
| `ColorPicker.Swatch`      | a `<span role="img">`         | `<span>` props                                          | —                         |
| `ColorPicker.ModeGroup`   | a segmented radio group       | `<div>` props minus role / name                         | `null` with a single mode |
| `ColorPicker.CopyButton`  | an `IconButton`               | `IconButton` props minus icon / name / disabled / type  | `null` without clipboard  |
| `ColorPicker.PasteButton` | an `IconButton`               | same as `CopyButton`                                    | `null` without clipboard  |

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
- The mode group is a `radiogroup` named "Color mode" of native radios: Tab enters on the checked
  option, the arrow keys move AND select, a screen reader announces "Automatic, radio, 2 of 3". In
  forced colours the checked segment is underlined (backgrounds are dropped there).
- The swatch names the state ("Automatic color", "No color"); the wand is `aria-hidden`.
- The copy and paste buttons are named "Copy color" / "Paste a color"; their outcome goes to the
  live region. Copy is disabled while the value is not a colour.
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

> **Warning** — `null` and `'none'` are two different things: `null` asks someone else to pick a
> colour, `'none'` asks for nothing to be painted. Check for both before reading a channel
> (`isColor(value)`).

> **Note** — copy and paste use `navigator.clipboard`, which exists on secure pages only (HTTPS,
> localhost): elsewhere the two buttons are not rendered. Pasting asks the browser: Chrome asks
> once per site; Firefox and Safari show a small "Paste" confirmation, except for text copied from
> the same site. Inject `clipboard` to use your own (a test double, an app-level clipboard).

> **Note** — rendered on a server, the picker has no clipboard: the two buttons appear right after
> hydration (no hydration mismatch). Copy is disabled while the value is "automatic" or "no colour";
> the buttons' `size` is fixed by the skin to the swatch (`--ui-color-picker-action-size`).

> **Note** — the panel has no surface of its own (no border, background or padding): a popover
> brings one, and inline you compose a `Card`. Giving it a surface would double the chrome inside a
> popover.
