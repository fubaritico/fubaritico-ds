---
name: add-package
description: Scaffold a new workspace package or app from scratch in the monorepo. Use when creating a new package, adding a library, or bootstrapping a new app.
allowed-tools: Read Write Edit Bash(mkdir:*) Bash(cp:*) Bash(pnpm:*)
argument-hint: '[package-name] [type: lib|app]'
metadata:
  author: fubaritico-ds
  version: '2.0'
---

# Add Package

Scaffold a new workspace package from scratch.

## Arguments

`$ARGUMENTS` = `[package-name] [type: lib|app]`

## Type: app (Storybook)

In this monorepo the `apps/*` are **Storybook apps** — one per UI framework
(`storybook-web-component` / `storybook-react` / `storybook-angular` / `storybook-vuejs`).
`storybook-react` is set up; mirror it when wiring another one.

The steps below cover the **lib** case.

## Type: lib — mirror `packages/variants`

**`packages/variants` is the reference template** for a pure-TS library (it was used as such for
`packages/behaviors`). Copy its conventions rather than inventing new ones: ESM, emit from a
separate build tsconfig, `node` test environment, scoped eslint override, coverage wired into Sonar,
public README. Read its files before starting.

### 1. Files to create

```
packages/$name/
├── package.json         # see below
├── tsconfig.json        # cp from variants (type-check, noEmit)
├── tsconfig.build.json  # cp from variants (emit to dist, excludes *.test.ts)
├── vitest.config.ts     # cp from variants, adapt the header comment
├── README.md            # public doc — it ships in the tarball
└── src/index.ts         # barrel with a header comment stating the package's role
```

```bash
mkdir -p packages/$name/src
cp packages/variants/{tsconfig.json,tsconfig.build.json,vitest.config.ts} packages/$name/
```

### 2. package.json

```json
{
  "name": "@fubaritico/$name",
  "version": "0.1.0",
  "type": "module",
  "sideEffects": false,
  "description": "<one sentence — what it is, and what it does NOT depend on>",
  "publishConfig": { "access": "public" },
  "main": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": { "types": "./dist/index.d.ts", "import": "./dist/index.js", "default": "./dist/index.js" }
  },
  "files": ["dist", "README.md"],
  "scripts": {
    "build": "tsc -p tsconfig.build.json",
    "dev": "tsc -p tsconfig.build.json --watch",
    "type-check": "tsc --noEmit -p tsconfig.json",
    "test": "vitest run",
    "test:watch": "vitest",
    "coverage": "vitest run --coverage",
    "lint": "eslint ./src",
    "lint:fix": "eslint ./src --fix"
  },
  "devDependencies": {
    "@vitest/coverage-v8": "catalog:",
    "typescript": "catalog:",
    "vitest": "catalog:"
  }
}
```

- Exports point at **`dist`**, never `src` — cross-package types resolve from `dist/*.d.ts`
  (Nx `^build` builds deps first; there are no tsconfig `paths`).
- `sideEffects: false` lets every consumer bundler tree-shake it; `default` covers toolchains
  that don't resolve the `import` condition. (`variants` predates both.)
- `files` MUST include `README.md` — without it the doc doesn't ship.

### 3. Source conventions

- `module: NodeNext` → relative imports carry the **`.js`** extension (`export * from './x.js'`).
- Type-only barrels: `export type * from './types.js'`.
- `lib: ES2020` — **no `replaceAll`**, `Array.prototype.at`, etc. Use the ES2020 equivalent
  (`replace(/…/g, …)`) or widen `lib` deliberately for every package, not one.
- Tests co-located as `src/**/*.test.ts`, 5-level policy (`tests.md`).

### 4. Wire it into the repo (each one is easy to forget)

1. **ESLint** — add a scoped override in `eslint.config.js` next to the `variants` one
   (`files: ['packages/$name/**/*.ts']`, `parserOptions.project: ['./packages/$name/tsconfig.json']`).
   Without it, a package sorting after `stencil` crashes typed lint (TS18003, see `known-issues.md`).
2. **Sonar** — append `packages/$name/coverage/lcov.info` to
   `sonar.javascript.lcov.reportPaths` in `sonar-project.properties`.
3. **Docs** — add the package to `CLAUDE.md` (Project list + package count) and to
   `rules/architecture.md` (structure tree + dependency order).
4. `pnpm install`, then add to consumers:
   `pnpm --filter [consumer] add @fubaritico/$name@workspace:^`.

### 5. Verify

```bash
pnpm --filter @fubaritico/$name build   # dist emitted, README examples runnable against it
pnpm type-check && pnpm lint && pnpm test  # from root
```

Run every code sample of the README against `dist` — an example output written from memory is
wrong more often than not.

## Dependency Constraint Reminder

Order: `tokens → shared → reference`; `variants → reference`; `behaviors` and `variants` depend on
no internal package; `stencil` and `styles` are independent. Packages NEVER import from apps.
Use the `monorepo-check` skill to validate the graph.

## Gotchas

- Always `catalog:` for shared devDependencies (`pnpm-workspace.yaml`) — vitest drift breaks snapshots.
- `pnpm-workspace.yaml` already picks up `packages/*` and `apps/*` — no workspace config needed.
- Always pnpm, never npm or yarn.
