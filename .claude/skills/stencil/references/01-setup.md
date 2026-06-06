# 01 — Setup & Project Structure

## Scaffold

```bash
npm init stencil
# choose: "component" (library) — not "app"
```

Prompts for component vs app. For a design system / wrapper-generating library, always pick
**components**. For a monorepo, run the init **inside `packages/`**:

```bash
cd packages
npm init stencil components stencil-library
cd stencil-library && npm install
```

## Generated structure

```
stencil-library/
├── stencil.config.ts          # build config — the heart of everything
├── package.json
├── tsconfig.json
├── src/
│   ├── components/
│   │   └── my-component/
│   │       ├── my-component.tsx
│   │       ├── my-component.css
│   │       └── test/
│   │           ├── my-component.spec.ts   # spec (unit) test
│   │           └── my-component.e2e.ts     # e2e test
│   ├── index.ts               # barrel — `export * from './components/...'`
│   ├── components.d.ts        # GENERATED — do not edit
│   └── utils/
└── dist/                      # build output (per output target)
```

## `stencil.config.ts` — full reference

```typescript
import { Config } from '@stencil/core'
import { sass } from '@stencil/sass'

export const config: Config = {
  // Prefixes generated files & the global script tag. Keep unique per library.
  namespace: 'stencil-library',
  srcDir: 'src',

  // Global stylesheet injected into every shadow root (constructable stylesheets)
  globalStyle: 'src/global/global.css',
  // Global script runs once before app load
  globalScript: 'src/global/app.ts',

  outputTargets: [
    /* see references/05-output-targets.md */
  ],

  // Preprocessor plugins
  plugins: [sass({ injectGlobalPaths: ['src/global/variables.scss'] })],

  // Build-time env vars → import.meta.env / process.env in components
  env: {
    API_URL: process.env.API_URL || 'https://api.example.com',
  },

  // Extra opt-in features
  extras: {
    experimentalImportInjection: true, // polyfill dynamic import for older bundlers
  },

  // Test config (legacy Jest runner — see references/09-testing.md for modern setup)
  testing: {
    browserHeadless: true,
    browserArgs: ['--no-sandbox'],
  },
}
```

## Monorepo project layout (sibling packages)

The Stencil-recommended layout puts the source library and each generated wrapper as **siblings**:

```
packages/
├── stencil-library/          # source Web Components
│   └── stencil.config.ts     # output targets write into ../react-library, ../angular-workspace
├── react-library/            # GENERATED React wrappers (own package.json, own build)
└── angular-workspace/        # GENERATED Angular wrappers (ng workspace)
```

> In **this repo** we use a _self-contained_ variant instead — see
> `references/10-project-monorepo.md`.

## `package.json` exports (critical)

The Stencil library `package.json` must declare a complete `exports` map, or wrapper packages and
consumers hit import-resolution errors:

```json
{
  "exports": {
    ".": {
      "import": "./dist/stencil-library/stencil-library.esm.js",
      "require": "./dist/stencil-library/stencil-library.cjs.js"
    },
    "./dist/*": { "import": "./dist/*", "types": "./dist/*" },
    "./components/*": {
      "import": "./dist/components/*.js",
      "types": "./dist/components/*.d.ts"
    },
    "./loader": {
      "import": "./loader/index.js",
      "require": "./loader/index.cjs",
      "types": "./loader/index.d.ts"
    }
  }
}
```

## CLI

```bash
stencil build              # one-off build
stencil build --watch      # rebuild on change
stencil build --dev        # unminified, faster
stencil build --prod       # production
stencil generate <tag>     # scaffold a new component
stencil test --spec        # (legacy) run spec tests
stencil test --e2e         # (legacy) run e2e tests
```
