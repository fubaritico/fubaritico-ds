# @fubaritico-ds/behaviors

Framework-agnostic component behaviour: pure functions and state machines.

**Pure TypeScript: no React, no DOM.** A component's value is what it can do — its states, its
transitions, its maths. That logic lives here once, so the React reference and later the Web
Component, Angular and Vue packages all drive the same behaviour, and it is tested without
rendering anything.

## Install

```bash
pnpm add @fubaritico-ds/behaviors
```

## Colour

Conversions between HSVA, RGBA, HSLA and hex, with no colour dependency.

```ts
import { hexToRgba, hsvaToHex, rgbaToHsva } from '@fubaritico-ds/behaviors'

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
