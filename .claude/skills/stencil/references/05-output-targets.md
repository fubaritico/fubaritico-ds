# 05 — Output Targets

All output is declared in `stencil.config.ts → outputTargets`. One project, many targets.

## `dist` — lazy-loaded distribution

```typescript
{ type: 'dist', esmLoaderPath: '../loader' }
```

- Produces a self-lazy-loading bundle + a `loader` entry (`defineCustomElements()`).
- Components are fetched on demand at runtime. Good for apps that just want `<my-el>` to work.
- This is the target the **Angular** wrapper uses by default (`outputType: 'component'`).

## `dist-custom-elements` — tree-shakeable custom elements

```typescript
{
  type: 'dist-custom-elements',
  customElementsExportBehavior: 'auto-define-custom-elements',
  dir: 'dist/components',          // default
  generateTypeDeclarations: true,  // default — emits .d.ts in dist/types
  externalRuntime: true,           // default — marks @stencil/core/* as external
  minify: false,                   // default (follows config unless externalRuntime)
  empty: true,                     // clear dir between builds
}
```

`customElementsExportBehavior` options:
| Value | Behavior |
|---|---|
| `'default'` | one file export per component, **no** auto-registration |
| `'auto-define-custom-elements'` | components self-register on import |
| `'bundle'` | exposes a single `defineCustomElements()` from `index.js` |
| `'single-export-module'` | all components re-exported from `index.js` (library distribution) |

- Each component extends `HTMLElement` directly with a `defineCustomElement()` helper.
- Fully tree-shakeable — consumers import only what they use.
- **Required for the React output target.** `dist` cannot substitute it.

Consuming directly:

```typescript
import { defineCustomElement as defineMyButton } from 'stencil-library/dist/components/my-button.js'
defineMyButton()
```

> Assets: with `dist-custom-elements`, set asset base paths via `setAssetPath()` (use
> `import.meta.url` or `document.currentScript.src`), since there's no built-in loader.

## `www` — dev app / static site

```typescript
{ type: 'www', serviceWorker: null, baseUrl: 'https://myapp.com/' }
```

The default target for a standalone Stencil app. Hosts the dev server. Not used for libraries.

## `dist-hydrate-script` — SSR

```typescript
{ type: 'dist-hydrate-script', dir: './hydrate' }
```

Generates a `renderToString`/`hydrate` module for server-side rendering. Required when enabling the
React wrapper's `hydrateModule` option for Next.js SSR (see `references/06-react-wrapper.md`).

## `docs-readme` / `docs-json` / `docs-vscode`

Auto-generate component documentation from JSDoc on `@Prop`/`@Event`/`@Method`:

```typescript
{ type: 'docs-readme' }                 // README.md per component
{ type: 'docs-json', file: 'docs.json' } // machine-readable
```

## Framework wrappers (generated packages)

These are output targets too — they write generated wrapper source into another package:

```typescript
reactOutputTarget({ outDir: '../react-library/src/components/' }) // see 06
angularOutputTarget({
  /* ... */
}) // see 07
vueOutputTarget({
  /* ... */
}) // Vue (not prioritized here)
```

## Typical combinations

```typescript
// Library distributed to npm + React + Angular wrappers:
outputTargets: [
  { type: 'dist', esmLoaderPath: '../loader' }, // for Angular `component` + plain consumers
  { type: 'dist-custom-elements' }, // for React (required)
  reactOutputTarget({ outDir: '../react-library/src/components/' }),
  angularOutputTarget({
    componentCorePackage: 'stencil-library',
    outputType: 'component' /* ... */,
  }),
  { type: 'docs-readme' },
]
```
