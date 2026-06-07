---
name: add-package
description: Scaffold a new workspace package or app from scratch in the monorepo. Use when creating a new package, adding a library, or bootstrapping a new app.
allowed-tools: Read Write Bash(mkdir:*) Bash(pnpm:*)
argument-hint: '[package-name] [type: lib|app]'
metadata:
  author: financial-app
  version: '1.0'
---

# Add Package

Scaffold a new workspace package from scratch.

## Arguments

`$ARGUMENTS` = `[package-name] [type: lib|app]`

## Type: app (Storybook)

In this monorepo the `apps/*` are **Storybook apps** — one per UI framework
(`storybook-web-component` / `storybook-react` / `storybook-angular` / `storybook-vuejs`) —
showcasing the generated components. They are currently empty scaffolds. Adapt the Storybook
tooling per framework when wiring one.

The steps below cover the **lib** case (a plain `packages/*` workspace package).

## Steps

### 1. Create directory

```bash
mkdir packages/$name        # for lib
```

### 2. Create package.json

For a library package:

```json
{
  "name": "@fubaritico-ds/$name",
  "version": "1.0.0",
  "private": true,
  "main": "src/index.ts",
  "types": "src/index.ts",
  "exports": {
    ".": { "import": "./src/index.ts" }
  },
  "scripts": {
    "build": "tsc",
    "dev": "tsc --watch",
    "type-check": "tsc --noEmit"
  },
  "devDependencies": {
    "typescript": "catalog:"
  }
}
```

### 3. Create tsconfig.json

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true,
    "skipLibCheck": true,
    "declaration": true,
    "esModuleInterop": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "build", "dist"]
}
```

### 4. Create src/index.ts

```ts
// @fubaritico-ds/$name public API
```

### 5. Install dependencies

```bash
pnpm install
```

### 6. Add as dependency to consumer

```bash
pnpm --filter [consumer-package] add @fubaritico-ds/$name@workspace:^
```

## Dependency Constraint Reminder

Build order / directions: `tokens → shared → reference`; `stencil` is independent.
Packages must NEVER import from apps. `shared`/`tokens` must not import from `reference`.
Use the `monorepo-check` skill to validate the graph.

## Gotchas

- Always use `catalog:` for shared devDependencies (see pnpm-workspace.yaml)
- No extra workspace config needed — pnpm-workspace.yaml picks up `packages/*` and `apps/*` automatically
- Always use pnpm, never npm or yarn
