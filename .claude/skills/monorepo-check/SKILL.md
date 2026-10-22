---
name: monorepo-check
description: Validate monorepo health — check dependency graph, circular dependencies, workspace configuration, package naming, and layer order. Use when adding packages, changing dependencies, or auditing the monorepo structure.
allowed-tools: Read Grep Glob Bash(pnpm:*)
metadata:
  author: fubaritico-ds
  version: '2.0'
---

# Monorepo Check

Validate monorepo health and dependency correctness. The layout and the orchestration (Lerna + Nx) are in
`.claude/rules/architecture.md`.

## Dependency Rules

```
@fubaritico/tokens      -> nothing
@fubaritico/behaviors   -> nothing (pure TS, no React/DOM, zero deps)
@fubaritico/variants    -> nothing internal (class-variance-authority only, no React/DOM)
@fubaritico/styles      -> @fubaritico/tokens (CSS-only)
@fubaritico/shared      -> @fubaritico/tokens (private)
@fubaritico/stencil     -> @fubaritico/tokens (private)
@fubaritico/react       -> tokens, styles, variants, behaviors; shared as a devDependency only
apps/storybook-react    -> the packages (private)
```

**Never** create circular dependencies. Packages **never** import from apps; `reference` and `stencil`
never import each other.

## Validation Checklist

### Package naming

- [ ] All packages use the `@fubaritico/` scope (`packages/reference` publishes as `@fubaritico/react`)
- [ ] `shared`, `stencil`, the apps (and `e2e` once it exists) have `"private": true`

### Dependency direction

- [ ] No package imports from apps
- [ ] No circular dependencies
- [ ] `behaviors` and `variants` import no React, no DOM, no internal package
- [ ] `@fubaritico/react` has `shared` in `devDependencies` only (consumers must not inherit msw, svgr, Tailwind)

### Workspace config

- [ ] `pnpm-workspace.yaml` includes `packages/*` and `apps/*`
- [ ] Shared versions use the `catalog:` pattern (vitest especially — see `rules/troubleshooting.md`)
- [ ] Every package with TS has `type-check`, `lint` and `test` scripts (`styles`: `test` only — REPO-138)
- [ ] Internal dependencies use `workspace:*`

### Build order

- [ ] `nx.json` `targetDefaults` keep `dependsOn: ['^build']` on `build`, `type-check`, `test`

## Commands

```bash
pnpm -r list --depth -1          # list all workspace packages
pnpm install --frozen-lockfile   # check for missing dependencies
pnpm type-check && pnpm lint && pnpm test
```

## Quick Audit Script

```bash
# packages must not import apps; the agnostic packages must not import React
grep -rn "@fubaritico/storybook" packages/*/src || echo "OK: no app imports in packages"
grep -rln "from 'react'" packages/behaviors/src packages/variants/src || echo "OK: behaviors/variants stay agnostic"
grep -rn "@fubaritico/stencil" packages/reference/src || echo "OK: reference does not import stencil"
```

## Gotchas

- pnpm-workspace.yaml uses globs (`packages/*`, `apps/*`) — no manual registration needed
- Always use `pnpm --filter` to target specific packages
- Never use npm or yarn
