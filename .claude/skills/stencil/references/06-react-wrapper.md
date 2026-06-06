# 06 — React Wrapper (`@stencil/react-output-target`)

Generates **native React components** that wrap the Web Components — props, refs, and events become
idiomatic React. You never hand-write these; the build regenerates them.

## Compatibility

- React ≥ 17 · TypeScript ≥ 5 · Stencil ≥ 4.2.0
- React library `tsconfig.json` **must** have `"moduleResolution": "bundler"` (and `"module": "esnext"`).

## Project structure (sibling packages)

```
packages/
├── stencil-library/   # source — stencil.config.ts writes wrappers into ../react-library
└── react-library/     # generated React components; own package.json + tsc build
```

## stencil.config.ts

```typescript
import { reactOutputTarget } from '@stencil/react-output-target'

export const config: Config = {
  namespace: 'stencil-library',
  outputTargets: [
    reactOutputTarget({
      outDir: '../react-library/src/components/stencil-generated/',
    }),
    { type: 'dist-custom-elements' }, // REQUIRED — dist alone won't work
  ],
}
```

## `reactOutputTarget` options

| Option                          | Type                                                      | Notes                                                                               |
| ------------------------------- | --------------------------------------------------------- | ----------------------------------------------------------------------------------- |
| `outDir` _(required)_           | `string`                                                  | where wrappers are generated (relative to Stencil root)                             |
| `stencilPackageName`            | `string`                                                  | name of the package exporting the WCs; defaults to detected `package.json` name     |
| `customElementsDir`             | `string`                                                  | dir of the custom elements; auto-detected from the `dist-custom-elements` target    |
| `excludeComponents`             | `string[]`                                                | tag names to skip                                                                   |
| `esModules`                     | `boolean` (default `true`)                                | emit a separate ES module per wrapper                                               |
| `hydrateModule`                 | `string`                                                  | enables Next.js SSR; e.g. `'stencil-library/hydrate'` (needs `dist-hydrate-script`) |
| `excludeServerSideRenderingFor` | `string[]`                                                | tags excluded from SSR (e.g. browser-only components)                               |
| `serializeShadowRoot`           | `'declarative-shadow-dom' \| 'scoped' \| object \| false` | SSR shadow serialization strategy                                                   |

## React library `package.json`

```json
{
  "main": "dist/index.js",
  "module": "dist/index.js",
  "types": "dist/types/index.d.ts",
  "scripts": { "build": "tsc -p . --outDir ./dist" },
  "files": ["dist"],
  "dependencies": { "stencil-library": "*" }
}
```

Entry file (`src/index.ts`):

```typescript
export * from './components/stencil-generated/components'
```

## How props & events map

```tsx
// Stencil:  @Prop() variant; @Event() buttonClick: EventEmitter<void>
// React wrapper usage:
import { MyButton, MyInput } from 'react-library'

function App() {
  const [value, setValue] = useState('')
  return (
    <>
      <MyInput value={value} onInputChange={(e) => setValue(e.detail.value)} />
      <MyButton variant="primary" onButtonClick={() => console.log('Clicked!')}>
        Submit
      </MyButton>
    </>
  )
}
```

- `@Prop()` → React prop (same name).
- `@Event({ eventName: 'buttonClick' })` → `onButtonClick` callback; **payload is in `e.detail`**, not
  the React synthetic-event shape.
- The wrapper handles attaching DOM listeners and setting non-attribute (object/array) props as
  properties — solving the "complex props can't be attributes" problem for you.

## SSR / Next.js (App Router)

1. Add `{ type: 'dist-hydrate-script', dir: './hydrate' }` to output targets.
2. Set `hydrateModule: 'stencil-library/hydrate'` on `reactOutputTarget`.
3. Choose `serializeShadowRoot` (`'declarative-shadow-dom'` for DSD, `'scoped'` for client hydration).
4. Optionally `excludeServerSideRenderingFor: ['needs-browser-el']`.

## Build & consume

```bash
# 1. build the Stencil library → regenerates the React wrappers
cd packages/stencil-library && npm run build
# 2. build the React library
cd ../react-library && npm run build
# 3. consume in an app
#    import { MyComponent } from 'react-library'
```

## Pitfalls / troubleshooting

- **Import errors in `components.ts`** → the Stencil lib `package.json` `exports` field is incomplete
  (see `references/01-setup.md`).
- **Module resolution failures** → React lib `tsconfig.json` missing `"moduleResolution": "bundler"`.
- **"dist is enough?"** → No. `dist-custom-elements` is mandatory for this target.
- **TypeScript < 5** → type resolution fails. Upgrade.
- **Events look empty** → read `e.detail`, not the React event object.
- **Special chars in event names** → break interop; use camelCase in the `@Event` definition.
- **Forgot to re-export** generated components from `index.ts` → consumers can't import them.
