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
