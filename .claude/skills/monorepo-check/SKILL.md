---
name: monorepo-check
description: Validate monorepo health — check dependency graph, circular dependencies, workspace configuration, package naming, and layer order. Use when adding packages, changing dependencies, or auditing the monorepo structure.
allowed-tools: Read Grep Glob Bash(pnpm:*)
metadata:
  author: financial-app
  version: "1.0"
---

# Monorepo Check

Validate monorepo health and dependency correctness.

## Dependency Rules

```
@financial-app/tokens           -> depends on nothing
@financial-app/tailwind-config  -> depends on @financial-app/tokens
@financial-app/ui               -> depends on @financial-app/tokens, @financial-app/tailwind-config
@financial-app/shared           -> depends on nothing (pure TS, no renderer)
apps/*                          -> depends on @financial-app/ui, @financial-app/shared
```

**Never** create circular dependencies. Shared packages **never** import from apps.

## Validation Checklist

### Package naming
- [ ] All packages use `@financial-app/` scope
- [ ] Apps use `-financial-app` suffix (e.g. `mobile-expo-financial-app`)
- [ ] Apps have `"private": true`

### Dependency direction
- [ ] No package imports from apps
- [ ] No circular dependencies
- [ ] Layer order respected: tokens -> tailwind-config -> ui -> apps
- [ ] @financial-app/shared has no renderer imports (no react-native, no react-dom)

### Workspace config
- [ ] `pnpm-workspace.yaml` includes `packages/*` and `apps/*`
- [ ] Shared devDependencies use `catalog:` pattern
- [ ] All packages have `type-check` script

### Build order
- [ ] tokens builds before tailwind-config
- [ ] tailwind-config builds before ui
- [ ] ui builds before apps

## Commands

```bash
# List all workspace packages
pnpm -r list --depth -1

# Check for missing dependencies
pnpm install --frozen-lockfile

# Run type-check across all packages
pnpm type-check

# Run lint across all packages
pnpm lint

# Run tests across all packages
pnpm test
```

## Quick Audit Script

```bash
# Check for circular deps (grep for cross-imports)
# Apps should not be imported by packages
grep -r "@financial-app/ui" packages/tokens/ packages/shared/ || echo "OK: no reverse imports"
grep -r "mobile-expo-financial-app\|mobile-financial-app\|web-financial-app" packages/ || echo "OK: no app imports in packages"
```

## Gotchas

- pnpm-workspace.yaml uses globs (`packages/*`, `apps/*`) — no manual registration needed
- Always use `pnpm --filter` to target specific packages
- Never use npm or yarn
- `workspace:^` protocol for internal dependencies
