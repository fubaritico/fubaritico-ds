# @fubaritico/behaviors

Framework-agnostic component behaviour: pure functions and state machines.

**Pure TypeScript: no React, no DOM.** A component's value is what it can do — its states, its
transitions, its maths. That logic lives here once, so the React reference and later the Web
Component, Angular and Vue packages all drive the same behaviour, and it is tested without
rendering anything.

## Install

```bash
pnpm add @fubaritico/behaviors
```

## Tabs

`TabsService` — the whole tabs behaviour as a framework-agnostic service: registry, controlled /
uncontrolled selection, roving focus, keyboard (APG tabs pattern), ARIA attributes. A framework
adapter only renders and wires lifecycles; it never computes an attribute itself.

```ts
import { createTabsService } from '@fubaritico/behaviors'

const tabs = createTabsService({ uid: 'settings', defaultActiveId: 'profile' })
const unregister = tabs.register({ id: 'profile' }) // returns its own cleanup
tabs.register({ id: 'billing' })

tabs.subscribe((snapshot) => render(snapshot)) // immutable snapshot, new reference per change
tabs.handleKeydown({ key: 'ArrowRight' }) // → billing focused and selected
tabs.triggerAttrs('billing') // → { role: 'tab', 'aria-selected': 'true', tabindex: 0, … }
```

| Contract                                    |                                                                                                      |
| ------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| `getState` / `subscribe`                    | snapshot memoised until a change — plugs into `useSyncExternalStore`, a signal, a `@State`           |
| `setOptions(patch)`                         | the single entry for props; the **presence** of `activeId` means controlled                          |
| `register` / `update` / `batch`             | registration returns its own `unregister`                                                            |
| `handleKeydown({ key })`                    | DOM-free; returns whether the key was consumed                                                       |
| `listAttrs` / `triggerAttrs` / `panelAttrs` | DOM spelling, presence semantics: strings / numbers, `undefined` = omit, `''` = boolean attribute on |
| `resetFocus()`                              | call when focus leaves the tablist — the selected tab becomes the tab stop again                     |
| `dir` option                                | `'rtl'` swaps ArrowLeft / ArrowRight; the adapter reads it from the DOM                              |
| `focusToken`                                | bumped on an explicit focus request — call `el.focus()` when it **changes**                          |

> **Warning** — `uid` is required and must be unique per instance (React: `useId()`). The service
> keeps no global counter, so two instances given the same `uid` generate colliding ids.

> **Note** — attribute values are never booleans: `setAttribute` and attribute bindings write
> `false` as the string `"false"`, which keeps the attribute present. React is the one consumer
> that wants `true` for a boolean attribute — its adapter converts.

> **Note** — before any tab registers (first render, server render), the snapshot reports the
> **intended** selection, so the initial markup already shows the right tab.

## Colour picker

`ColorPickerService` — the colour picker's behaviour: the HSVA source of truth, an optional
**"automatic / no colour"** state (`null`), pointer drags on the 2D area and the hue / alpha tracks,
keyboard steps, the hex field's draft, and the ARIA attributes of every control.

```ts
import { createColorPickerService, pointFromRect } from '@fubaritico/behaviors'

const picker = createColorPickerService({
  uid: 'fill',
  defaultValue: { h: 210, s: 80, v: 60, a: 1 },
  nullable: true, // allow "automatic"
  onChange: (value) => preview(value), // continuous while dragging
  onChangeComplete: (value) => save(value), // once settled
})

// pointer: the adapter measures, the service decides
const rect = area.getBoundingClientRect()
picker.startDrag(
  'area',
  pointFromRect(event.clientX, event.clientY, rect, 'ltr')
)
picker.moveDrag(pointFromRect(event.clientX, event.clientY, rect, 'ltr'))
picker.endDrag() // or cancelDrag() on Escape

picker.handleKeydown('area', event) // arrows, PageUp/Down, Home/End, Shift ×10
picker.setHexDraft('#ff0') // typing never reformats the field…
picker.commitHexDraft() // …until Enter / blur
picker.getState().hex // '#ffff00'
```

| Contract                                            | Rule                                                                         |
| --------------------------------------------------- | ---------------------------------------------------------------------------- |
| `value` / `defaultValue`                            | `HsvaColor` or `null` (automatic, nullable pickers only)                     |
| `getState()`                                        | `value`, `color` (working colour), `hex`, `hueHex`, `opaqueHex`, `hexDraft`… |
| `startDrag` / `moveDrag` / `endDrag` / `cancelDrag` | points as fractions from `pointFromRect`; rtl handled there                  |
| `areaInputAttrs(axis)`                              | the area's two hidden range inputs, announced as a "2D slider"               |
| `trackInputAttrs('hue' \| 'alpha')`                 | the `Slider`s' native inputs                                                 |
| `hexInputAttrs` / `autoToggleAttrs` / `swatchAttrs` | the hex field, the "automatic" button, a swatch                              |
| `labels` / `describeColor`                          | injected to localise; `aria-valuetext` says "dark blue", not "x: 120"        |

Accessibility the adapter must render, all driven by the service:

- **`snapshot.announcement`** in a polite live region (`statusAttrs()`): the colour's description
  after each settled change — never during a drag.
- **`hexErrorText()`** in an element with `hexErrorAttrs()` while `snapshot.hexInvalid`; the field
  already points at it with `aria-describedby`.
- **No alpha input** when `snapshot.alpha` is `false` (its attributes are only a disabled fallback).

> **Warning** — `value` in the input attributes is a DOM **property**: bind it with your framework's
> property binding, never with `setAttribute` (an edited field ignores its `value` attribute).

> **Warning** — keep the picker's own value (HSVA) as the truth. If you store hex and pass it back
> as a controlled value, a gray comes back with `h: 0`; the service recognises the same colour and
> keeps the hue thumb where it was — but anything you derive yourself from hex will not.

> **Note** — `labels` is compared by content, so passing a fresh object on every render costs
> nothing. `describeColor` is read on use: memoise it if it changes.

## Colour

Conversions between HSVA, RGBA, HSLA and hex, with no colour dependency.

```ts
import { hexToRgba, hsvaToHex, rgbaToHsva } from '@fubaritico/behaviors'

hsvaToHex({ h: 210, s: 88, v: 82, a: 1 }) // → '#1975d1'
hexToRgba('#f008') // → { r: 255, g: 0, b: 0, a: 0.53 }
hexToRgba('red') // → null
```

| Model       | Ranges                              |
| ----------- | ----------------------------------- |
| `HsvaColor` | `h` 0–360, `s` / `v` 0–100, `a` 0–1 |
| `RgbaColor` | `r` / `g` / `b` 0–255, `a` 0–1      |
| `HslaColor` | `h` 0–360, `s` / `l` 0–100, `a` 0–1 |

Results are **unrounded**; round where you display them. Only `rgbaToHex` rounds, because a hex
string has to.

> **Warning** — keep **HSVA as the source of truth** and treat hex / RGB as outputs. Going back
> from RGB loses information: a grey has no hue, black has no saturation, so `rgbaToHsva` returns
> `0` for both. A picker that re-derives its state from hex jumps back to red as soon as the
> saturation hits zero.

> **Note** — the hex formatters throw a `RangeError` on a `NaN` or infinite component instead of
> printing `#NaN…`: a corrupted colour is a bug upstream, surfaced where it happens.

> **Note** — `hexToRgba` returns `null` for anything that is not a 3, 4, 6 or 8 digit hex colour.
> CSS colour names and functions (`red`, `rgb(…)`) are deliberately not parsed.
