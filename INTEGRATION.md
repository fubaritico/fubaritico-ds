# Integrating the fubaritico design system

Written to be read by a human **or an agent** wiring these packages into another project. It states
what ships, what does not, and the rules that are not guessable from the types.

## What you install

Four packages. Three carry code, one is pure CSS.

| Package                    | What it is                                                   | Why you need it                                                                        |
| -------------------------- | ------------------------------------------------------------ | -------------------------------------------------------------------------------------- |
| `@fubaritico-ds/tokens`    | Design tokens → CSS custom properties, plus JS/TS objects    | Every value the skin reads. **Required.**                                              |
| `@fubaritico-ds/styles`    | The native BEM skin: plain CSS in `@layer`, no framework     | How the components look. **Required.**                                                 |
| `@fubaritico-ds/variants`  | Framework-agnostic CVA resolvers (pure TS, no React, no DOM) | Pulled in by `reference`; install directly only if you render the BEM classes yourself |
| `@fubaritico-ds/reference` | The React components                                         | **Required** for React.                                                                |

There is **no Tailwind anywhere** in these packages, and none is required of you.

## Wiring it up

Load the CSS once, at your application entry, in this order:

```ts
import '@fubaritico-ds/tokens/css' // 1. the variables the skin reads
import '@fubaritico-ds/styles' // 2. the skin itself
```

Order matters: the skin resolves `var(--color-*)`, `var(--spacing-*)` and friends from the tokens
sheet. Then import components by their own subpath:

```tsx
import { Button } from '@fubaritico-ds/reference/Button'
import { Drawer } from '@fubaritico-ds/reference/Drawer'
```

The package barrel (`@fubaritico-ds/reference`) works too and re-exports everything, but the
subpath keeps your bundle honest.

> **The components import no CSS of their own.** Nothing styles itself by side effect: forget step
> 2 and you get working, accessible, completely unstyled components. That is deliberate — the skin
> is swappable.

### Fonts

The DS does not ship fonts. `--font-inter` resolves to
`'Inter', 'Roboto', ui-sans-serif, system-ui, sans-serif`, so without them you fall back to the
system sans-serif — never to a serif. Load Inter and Roboto yourself if you want the intended look.

### Your app needs a base font

The DS ships **no global reset**, by design. Each skin block declares its own `font-family`, but
loose text _outside_ a component falls back to the browser default (a serif). Set a base font on
your app shell, as any application normally would:

```css
body {
  font-family: var(--font-inter);
  color: var(--color-foreground);
}
```

## What is NOT in this release

|                                  | Why                                                                                               |
| -------------------------------- | ------------------------------------------------------------------------------------------------- |
| `Carousel`                       | Still on Tailwind; excluded so the package stays Tailwind-free. In the migration queue.           |
| `next/*` adapters (`NextImage`…) | Same. `NextLinkButton` **is** included — it only needs `next/link`, declared as an optional peer. |
| `HeroImage`, `TrailerCard`       | Coupled to the TMDB domain of the project this DS was extracted from. One is parked, one removed. |
| `DatePicker`, `Toast`            | Not written yet.                                                                                  |

Paths may move in a later release: this package is the React **reference** implementation, and the
long-term deliverables are per-framework packages generated from a Web Component core.

## Theming and overriding

Three levels, from the most surgical to the broadest.

**1. One instance** — every component exposes `--ui-<block>-*` custom properties:

```tsx
<ProgressBar
  value={62}
  aria-label="Upload"
  style={
    { '--ui-progress-bar-indicator-color': 'rebeccapurple' } as CSSProperties
  }
/>
```

**2. One theme** — redefine a token and every component that reads it follows:

```css
:root {
  --color-primary: #1d4ed8; /* re-skins Button, Tabs, ProgressBar, … */
}
```

**3. Anything else** — the skin lives in `@layer ui.components`, so **any unlayered rule of yours
wins**, with no specificity war and no `!important`:

```css
.ui-button {
  letter-spacing: 0.02em;
}
```

> **Never set `display` on `Modal` or `Drawer`.** They are native `<dialog>` elements; the browser
> hides a closed one with `dialog:not([open]) { display: none }`, and any author `display`
> overrides it, leaving the panel permanently on screen. Position their content with
> `--ui-modal-place-items` or a rule on a child.

## Conventions worth knowing before you write code

- **Logical properties throughout.** `side="start"` on a Drawer is the inline-start edge — the left
  in English, the right in Arabic. Same for `metaStart` / `metaEnd` on ProgressBar. Nothing is
  hard-coded left or right.
- **Neutral by default.** The DS default is greyscale; brand or semantic colour is opt-in through a
  closed `variant` axis. There is no free-form `color` prop anywhere.
- **Accessible names are often required at compile time.** `Modal`, `Drawer` and `ProgressBar` take
  a mandatory `aria-label`, because the underlying role has no content to derive a name from.
- **Sizes are always `sm | md | lg`**, and `md` is the default that emits no modifier class.
- **Components are controlled.** `Modal`, `Drawer` and `BottomSheet` take `open` + `onClose` and
  never close themselves; honouring the callback is your job.

## Per-component documentation

Every shipped component carries its own README **inside the package**:

```
node_modules/@fubaritico-ds/reference/dist/components/<Name>/README.md
```

Each one follows the same plan — identity, capabilities, import, basic usage, variants, edge cases,
a props table, accessibility, and a **Notes** section listing the traps. Read the Notes before
using a component; that is where the non-obvious behaviour is written down.

## Reporting a problem

The components are the reference implementation and are still moving. If something looks wrong,
check the component's README Notes first: several behaviours that look like bugs (an unpadded
`Card` root, a `Rating` that is display-only, a `BottomSheet` that does not trap focus) are
documented, deliberate decisions.
