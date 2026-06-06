# Architecture — Review Rules

> **ALL rules in this file are GLOBAL** — they apply to every file in the entire codebase
> (`apps/`, `packages/`, scripts, configs) without exception. When a rule specifies a file
> pattern, it means ALL files matching that pattern everywhere, not just in one package.
> JSDoc requirements from QUAL-003/004/005 apply here too — every interface, function,
> type, hook, param, and return value must be documented with JSDoc everywhere.

## Critical Violations (ARCH-0xx)

### ARCH-001: Circular dependencies
- **Files**: All package imports
- **Check**: No circular imports between packages
- **Layer order** (one-directional only):
  ```
  tokens → tailwind-config → ui → apps
  shared → apps
  ```
- **Forbidden**: `apps/*` importing from another app, `ui` importing from `apps/*`

### ARCH-002: Hardcoded design values
- **Files**: All (except `packages/tokens/src/**`)
- **Check**: No raw hex colors (`#RRGGBB`), pixel values for spacing/sizing, or font sizes
- **Check**: No Tailwind arbitrary values (`bg-[#1a1a2e]`, `text-[14px]`, `p-[12px]`) — always use classes that resolve to `@financial-app/tokens` values via the tailwind config
- **Must use**: Token references (tw classes, CSS variables, or token JS imports)
- **Exception**: `0`, `1px` for borders, `100%`, `auto`, `inherit`

### ARCH-002b: Token contrast pairs not declared
- **Files**: `packages/tokens/src/semantic/**`
- **Check**: Every semantic color token that defines a text/foreground color must have a corresponding entry in `packages/tokens/src/contrast-pairs.json`
- **Rationale**: Contrast validation runs at token build time using `color-contrast-checker`. Undeclared pairs cannot be validated.
- **Must have**: `contrast-pairs.json` with foreground/background/usage/minRatio for every text-on-background combination

### ARCH-003: Apps importing from apps
- **Files**: `apps/**`
- **Check**: No imports from `../../apps/other-app` or `@financial-app` scoped app names

### ARCH-003b: SOLID principle violations
- **Files**: All `*.ts`, `*.tsx`
- **S — Single Responsibility**: A module, class, or component does one thing. A component that fetches data AND renders UI violates SRP — split into a hook + a presentational component.
- **O — Open/Closed**: Extend behavior through composition (variants, props, children), not by modifying existing code. A component that requires internal edits to support new variants is not open for extension.
- **L — Liskov Substitution**: A component accepting the same props interface must be interchangeable across platforms. `.native.tsx` and `.web.tsx` must honor the same Props contract.
- **I — Interface Segregation**: Props interfaces should not force consumers to provide values they don't use. Split large interfaces or use optional properties.
- **D — Dependency Inversion**: Depend on abstractions (token aliases, variant objects, interfaces), not on concrete implementations (raw hex values, platform-specific APIs in shared code).

## High Violations

### ARCH-004: Missing component files (4-file pattern)
- **Files**: All cross-platform component directories
- **Check**: Every component directory must contain:
  - `ComponentName.tsx` — types/props only
  - `ComponentName.native.tsx` — RN implementation
  - `ComponentName.web.tsx` — DOM implementation
  - `index.ts` — re-export
- **Check**: A corresponding variant file should exist in `src/variants/`

### ARCH-005: Component not exported from public API
- **Files**: All package public API barrel files (`src/index.ts`, `src/index.web.ts`)
- **Check**: Every component in `src/components/*/` must be exported from both barrel files
- **Must export**: Component, Props type, and variant object

### ARCH-006: Missing variant file
- **Files**: All `*.variants.ts` files
- **Check**: Every component should have a `[name].variants.ts` file
- **Check**: Variant file must export a CVA object and its VariantProps type

### ARCH-007: Package.json missing required fields
- **Files**: `packages/*/package.json`
- **Check**: Must have `name` (with `@financial-app/` scope), `exports`, `types`
- **Check**: Apps must have `"private": true`

## Medium Violations

### ARCH-008: Wrong dependency direction
- **Files**: `packages/*/package.json`
- **Check**: Dependencies follow layer order
- **Example violation**: `@financial-app/tokens` depending on `@financial-app/ui`

### ARCH-009: Index barrel file anti-patterns
- **Files**: `**/index.ts`
- **Check**: No circular re-exports
- **Check**: No `export * from` that pulls in platform-specific code at the barrel level

### ARCH-010: Token build artifacts committed
- **Files**: `packages/tokens/build/**`
- **Check**: These files should never appear in git — they are generated
- **Must be**: Listed in `.gitignore`

## Low Violations

### ARCH-011: Inconsistent file/type naming
- **Files**: All
- **Check**: Component files use PascalCase
- **Check**: Utility/hook files use camelCase
- **Check**: Variant files use `[name].variants.ts` pattern
- **Check**: Config files use kebab-case or standard names (tsconfig.json, etc.)
- **Check**: All interfaces MUST use `I` prefix (e.g., `IAuthClient`, `IButtonProps`, `ITransaction`)

### ARCH-012b: `#` aliases in organism sub-components
- **Files**: All nested sub-component files within organisms (e.g. `cells/`, `components/` subdirs inside any organism)
- **Check**: Sub-components nested deep inside an organism (e.g. DataTable cells) must NOT use `#Atoms`, `#Molecules`, `#Organisms` aliases to import from other atomic levels
- **Must use**: Relative paths (`../../../../atoms/Icon/Icon.native`, `../../../../molecules/Dropdown/Dropdown.web`)
- **Rationale**: Bare `#Atoms`/`#Molecules` don't match ESLint `pathGroups` patterns (`#Atoms/**`), causing import/order errors. Top-level component files (e.g. `atoms/Button/Button.native.tsx`) can still use `#Lib/tw`, `#Lib/cn`.

### ARCH-012: Unused exports
- **Files**: `packages/*/src/index.ts`
- **Check**: Exported items that are not imported anywhere in the monorepo
- **Note**: Low severity — may be intentional for future use

## API-Specific Violations

### ARCH-013: Route without OpenAPI registration
- **Files**: All API route files (`*.ts` in `routes/`)
- **Check**: Every Express handler (`router.get`, `router.post`, etc.) must have a corresponding `registry.registerPath()` call above it
- **Rationale**: Routes without OpenAPI registration don't appear in Swagger UI and won't generate HTTP client methods

### ARCH-014: Zod schema without .openapi() metadata
- **Files**: All API schema files (`*.ts` in `schemas/`)
- **Check**: Every schema must be registered via `registry.register('Name', z.object(...))`
- **Check**: Every field should have `.openapi({ example: '...' })` for Swagger UI documentation
- **Exception**: Nested sub-schemas reused across multiple entities may skip `.openapi()` on individual fields

### ARCH-015: Route not mounted in index.ts
- **Files**: All API entry files (`index.ts`) and all API route files (`*.ts` in `routes/`)
- **Check**: Every exported router in `routes/` must have a corresponding `app.use('/path', router)` in `index.ts`
- **Check**: Route path must match entity name (e.g. `budgetsRouter` → `/budgets`)

### ARCH-016: Business logic in route handler
- **Files**: All API route files (`*.ts` in `routes/`)
- **Check**: Route handlers should follow the pattern: validate → query → error check → response
- **Check**: Complex business logic (multi-step operations, calculations, conditional flows) must be extracted into named helper functions within the same file or a `services/` directory
- **Example**: `updatePotTotal()` extracts fetch-validate-update logic out of the handler
- **Threshold**: If a handler does more than one Supabase call, extract the logic

### ARCH-017: i18n fallback strings
- **Files**: All `*.tsx`, `*.ts` in `apps/` and `packages/`
- **Check**: NEVER pass a second argument to `t()` as a fallback (e.g. `t('key', 'fallback')`)
- **Check**: NEVER use default values for label/placeholder props in destructuring (e.g. `label = 'Edit'`)
- **Check**: NEVER use `?? 'fallback'` or `|| 'fallback'` on translated strings
- **Check**: Label/placeholder props must be `string` (required), NOT `string?` (optional)
- **Fix**: Add missing keys to both `en/translation.json` and `fr/translation.json`, make props required
