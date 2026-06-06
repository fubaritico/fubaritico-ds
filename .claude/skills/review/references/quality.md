# Quality — Review Rules

> **ALL rules in this file are GLOBAL** — they apply to every file in the entire codebase
> (`apps/`, `packages/`, scripts, configs) without exception. When a rule specifies a file
> pattern (e.g. `*.ts`), it means ALL files matching that pattern everywhere, not just in
> one package. JSDoc documentation (QUAL-003/004/005) is mandatory on EVERY interface,
> EVERY type with properties, EVERY function (exported or private), EVERY hook, EVERY
> `@param`, EVERY `@returns` — no path exception, no "it's just an internal helper" excuse.

## Critical Violations (QUAL-0xx)

### QUAL-001: console.log usage
- **Files**: All
- **Check**: No `console.log()` — use `console.warn()` or `console.error()` only
- **Exception**: None

### QUAL-002: Explicit `any` type
- **Files**: All `*.ts`, `*.tsx`
- **Check**: No `any` type annotation — use `unknown`, proper types, or generics
- **Forbidden**: `: any`, `as any`, `<any>`
- **Exception**: None — strict TypeScript is non-negotiable

### QUAL-002b: Mixed type and value imports
- **Files**: All `*.ts`, `*.tsx`
- **Check**: Types and values from the same module MUST use separate import statements
- **Forbidden**: `import { create, type TwConfig } from 'twrnc'`
- **Required**:
  ```ts
  import type { TwConfig } from 'twrnc'
  import { create } from 'twrnc'
  ```
- **Rationale**: Keeps type-only imports explicit, enables better tree-shaking, and matches `isolatedModules` best practices

## High Violations

### QUAL-003: Missing JSDoc on interface/type properties
- **Files**: All `*.ts`, `*.tsx` — global, no path exception
- **Scope**: EVERY interface and EVERY type alias with properties, everywhere in the codebase
- **Applies to**: Props interfaces, domain types, payload types, row types, return types, discriminated unions, internal interfaces, Supabase layer types, API schemas, shared types — no exception
- **Check**: Every property in every interface/type must have a JSDoc comment
- **Format**:
  ```ts
  export interface IButtonProps {
    /** Text displayed inside the button */
    label: string
    /** Callback fired when button is pressed */
    onPress: () => void
    /** Visual style variant */
    variant?: 'primary' | 'secondary'
  }
  ```

### QUAL-004: Missing JSDoc on functions
- **Files**: All `*.ts`, `*.tsx` — global, no path exception
- **Scope**: EVERY function everywhere in the codebase — exported, private, helpers, hooks, handlers, Supabase queries, API route handlers, utility functions, build scripts — no exception
- **Check**: Every function must have JSDoc with description
- **Check**: `@param` for each parameter with description
- **Check**: `@returns` for every non-void function with description of the return value
- **Note**: Private helpers included — they are internal documentation for maintainers
- **Format**:
  ```ts
  /**
   * Resolves variant classes for the given props.
   * @param props - Component variant props
   * @returns Concatenated class string
   */
  export function resolveVariant(props: ButtonVariants): string { ... }
  ```

### QUAL-005: Missing JSDoc on custom hooks
- **Files**: All `*.ts`, `*.tsx` — global, no path exception
- **Scope**: EVERY custom hook (use* functions) everywhere in the codebase — UI package, shared package, features, apps — no exception
- **Check**: Hook must have JSDoc with description
- **Check**: `@param` for each parameter with description
- **Check**: `@returns` documenting the return value/tuple
- **Check**: Key state variables in the hook should have inline comments if non-obvious

### QUAL-006: Function exceeds 30 lines
- **Files**: All
- **Check**: Functions/methods longer than 30 lines of logic (excluding JSDoc, blank lines, type declarations)
- **Suggestion**: Extract sub-functions or simplify control flow

### QUAL-007: Code duplication
- **Files**: All within same package
- **Check**: 3+ lines of identical or near-identical logic repeated in multiple places
- **Suggestion**: Extract to shared utility or hook
- **Note**: Cross-platform duplication between .native.tsx and .web.tsx is acceptable (different renderers)

## Medium Violations

### QUAL-008: Dead code
- **Files**: All
- **Check**: Commented-out code blocks (>2 lines)
- **Check**: Unreachable code after return/throw
- **Check**: Unused imports (should be caught by ESLint, but verify)
- **Check**: Unused local variables or parameters (prefix with `_` if intentionally unused)

### QUAL-009: God component (>200 lines)
- **Files**: `*.native.tsx`, `*.web.tsx`
- **Check**: Component file exceeding 200 lines suggests need to split
- **Suggestion**: Extract sub-components, custom hooks, or utilities

### QUAL-010: Stale or incorrect JSDoc
- **Files**: All
- **Check**: `@param` referencing non-existent parameters
- **Check**: JSDoc description contradicting actual behavior
- **Check**: `@returns` type not matching actual return type

### QUAL-011: Unnecessary abstraction
- **Files**: All
- **Check**: Wrapper functions that add no logic (just forward args)
- **Check**: Single-use utility functions that could be inline
- **Check**: Over-engineered patterns for simple operations

### QUAL-016: Unnecessary cn() call
- **Files**: `*.web.tsx`
- **Check**: `cn()` is for composing **multiple** class sources — never use it with a single argument
- **Good**: `cn('flex', styles.header)`, `cn(buttonVariants({ variant }), 'hover:opacity-80')`
- **Bad**: `cn('flex')` — just use `className="flex"`
- **Rationale**: `cn()` wraps clsx + tailwind-merge. With a single string argument it does nothing — use `className` directly.

## Low Violations

### QUAL-012: Missing error context
- **Files**: All
- **Check**: `catch` blocks that swallow errors silently (`catch {}` or `catch { /* empty */ }`)
- **Suggest**: At minimum `console.error` with context about what failed

### QUAL-013: Magic numbers/strings
- **Files**: All (except token source files)
- **Check**: Numeric literals (other than 0, 1, -1) without explanation
- **Check**: String literals used in multiple places without a constant
- **Check**: A constant defined in more than one file must be centralized in a shared constants file (e.g. `schemas/constants.ts` for API schemas)
- **Suggest**: Extract to named constant or token

### QUAL-014: Inconsistent patterns within same file
- **Files**: All
- **Check**: Mixing arrow functions and function declarations in same module
- **Check**: Mixing default and named exports inconsistently
- **Check**: Inconsistent error handling approaches within same scope

### QUAL-017: Hardcoded user-facing text in components
- **Files**: All `*.native.tsx`, `*.web.tsx`
- **Check**: No hardcoded user-visible strings (labels, button text, placeholders, aria-labels) inside component implementations
- **Check**: Default prop values containing user-facing text (e.g. `editLabel = 'Edit Budget'`) must have a corresponding translation key
- **Must**: Expose text as a prop on the component interface (with an English default if appropriate)
- **Must**: Have a corresponding translation entry in `packages/shared/src/i18n/locales/{en,fr}/translation.json` — including for default prop values
- **Must**: Stories and app consumers pass text via `i18n.t('key')`
- **Exception**: Purely decorative/structural strings like "..." (ellipsis) are acceptable
- **Rationale**: UI components are i18n-agnostic — they receive translated strings as props. Default values are fallbacks, not a substitute for translation keys.

### QUAL-018: Platform-specific classes not extracted to `.styles.ts`
- **Files**: All `*.native.tsx`, `*.web.tsx`
- **Check 1 — Duplicated layout classes**: Tailwind class strings that appear identically in both `.native.tsx` and `.web.tsx` but are NOT in `.variants.ts` or `.styles.ts` (e.g. `flex-row items-center gap-3` copy-pasted in both files)
- **Check 2 — Inline web-only classes**: Web-only classes (`hover:*`, `focus:*`, `focus-visible:*`, `focus-within:*`, `active:*`, `transition-*`, `cursor-*`, `shadow-*`, `ring-*`, `outline-*`, `animate-*`, `motion-safe:*`, `inline-block`, `fixed`, `sticky`) hardcoded inline in `.web.tsx` instead of extracted to the `web` export in `.styles.ts`
- **Check 3 — Inline native-only classes**: Native-only classes (explicit `flex-row` on View containers, RN-specific absolute positioning patterns) hardcoded inline in `.native.tsx` instead of extracted to the `native` export in `.styles.ts`
- **Check 4 — Cross-platform import violation**: `.native.tsx` importing the `web` export, or `.web.tsx` importing the `native` export from `.styles.ts`
- **Check 5 — Web-only class in `shared`**: Classes that only work on web (e.g. `inline-block`, `-translate-x-1/2` without RN support) placed in the `shared` export instead of `web`
- **Required structure** in `.styles.ts`:
  ```ts
  export const shared = { /* layout classes for both platforms */ } as const
  export const web = { /* web-only classes */ } as const
  export const native = { /* native-only classes */ } as const
  ```
- **Exception**: Components with no inner elements AND no platform-specific classes may skip `.styles.ts`
- **Exception**: Single-use web-only class on root element composed via `cn(variants(), web.root)` — if the component literally has ONE web-only class and no inner elements, inline is tolerable but `.styles.ts` is preferred
- **Rationale**: Centralizes class strings, prevents silent native breakage from web-only classes, makes platform-specific styling auditable

### QUAL-019: File responsibility violations (constants / utils / types)
- **Files**: All `*.constants.ts`, `*.utils.ts`, and `*.tsx` types files across all cross-platform component directories
- **Check 1 — Functions in constants**: `.constants.ts` files must contain ONLY constants (numeric values, string maps, enums, config objects). Functions belong in `.utils.ts`.
- **Check 2 — Types in constants**: Interfaces and type aliases must NOT be defined in `.constants.ts`. All types/interfaces belong in the `.tsx` types file.
- **Check 3 — Types in utils**: `.utils.ts` must NOT define interfaces or type aliases. It should import them from the `.tsx` types file.
- **Check 4 — Constants in utils**: Static values (numbers, strings, config objects) belong in `.constants.ts`, not `.utils.ts`.
- **Required separation**:
  - `.tsx` = all types/interfaces (props, internal types, return types)
  - `.constants.ts` = all static values (numbers, strings, maps, enums)
  - `.utils.ts` = all shared logic/functions (consumed by both `.native.tsx` and `.web.tsx`)
- **Exception**: Components with no shared logic don't need `.utils.ts`. Components with no shared constants don't need `.constants.ts`.
- **Rationale**: Clear separation of concerns — values vs logic vs types — prevents circular imports and keeps each file focused

### QUAL-015: Interface naming convention
- **Files**: All `*.ts`, `*.tsx`
- **Check**: All interface names MUST start with `I` prefix (e.g., `IAuthClient`, `IAuthStorage`, `IButtonProps`)
- **Forbidden**: `export interface AuthStorage { ... }` — must be `export interface IAuthStorage { ... }`
- **Exception**: None — this applies to all interfaces, including Props, domain types, and abstractions
- **Rationale**: Distinguishes interfaces from types, classes, and concrete implementations at a glance

## API-Specific Violations

### QUAL-020: Route handler exceeds 30 lines
- **Files**: All API route files (`*.ts` in `routes/`)
- **Check**: Individual route handler functions must stay under 30 lines of logic
- **Suggestion**: Extract Supabase query logic into a helper function (like `updatePotTotal`)
- **Rationale**: Keeps handlers readable — validation, query, error check, response

### QUAL-021: Inconsistent error response shape
- **Files**: All API route files (`*.ts` in `routes/`)
- **Check**: All error responses must use `{ error: string }` — no other shape
- **Forbidden**: `{ message: '...' }`, `{ errors: [...] }`, bare string responses
- **Check**: Status codes must match semantics: 400 (validation), 401 (auth), 404 (not found), 500 (internal)

### QUAL-022: Supabase error not handled
- **Files**: All API route files (`*.ts` in `routes/`)
- **Check**: Every `await supabase.*` call must be followed by an `if (error)` check
- **Forbidden**: Destructuring only `data` without `error`: `const { data } = await supabase...`
- **Rationale**: Supabase never throws — errors are returned in the response object

### QUAL-023: Missing OpenAPI example metadata
- **Files**: All API schema files (`*.ts` in `schemas/`)
- **Check**: Every Zod schema field should have `.openapi({ example: '...' })` metadata
- **Rationale**: Examples appear in Swagger UI, making the API self-documenting

### QUAL-024: Feature component with prop-forwarded fixed labels
- **Files**: All `*.tsx` in `apps/` and `packages/` (except `packages/ui/` design system atoms/molecules/organisms)
- **Check**: Feature components or page-level components that always render the same labels (e.g. `nameLabel={t('transactions.form.nameLabel')}`) should call `useTranslation()` internally instead of receiving those labels as props from every consumer
- **Exception**: `packages/ui/` components (design system atoms/molecules/organisms) remain i18n-agnostic — they always receive labels as props
- **Exception**: Labels that legitimately vary between usages remain props
- **Rationale**: Passing a wall of `fooLabel={t('...')}` props duplicates the same `t()` calls in web + mobile consumers. If the label never changes, it belongs inside the component.
