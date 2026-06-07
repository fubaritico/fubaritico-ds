# Rules — Test Policy

> Every new component, hook, utility, or bug fix MUST ship with tests.
> No code is considered done without tests, a `/commit`, and `/end-session`.

Stack: **Vitest 3** — React Testing Library (jsdom) for `packages/reference`,
**`@stencil/vitest`** for `packages/stencil`. Tests run per-package via `lerna run test`.

## Mandatory Completion Sequence

After every code change:

1. **Write tests** — following the 5-level policy below
2. **`pnpm type-check && pnpm lint && pnpm test`** — all pass
3. **`/review`** — multi-agent review
4. **`/commit`** — conventional commit
5. **`/end-session`** — update session state before closing

## 5-Level Test Policy (mandatory)

Every test suite MUST cover these 5 levels. No level can be skipped.

### Level 1 — Happy Path

The nominal use case with valid inputs.

```
- Component renders with required props
- Hook returns expected data (useQuery success)
- Section renders content from a `default` MSW handler
- Interaction (click, type) produces the expected result
```

### Level 2 — Variant Cases

All meaningful variations of valid inputs — each prop combination, each branch.

```
- Component with each variant/size/state prop combination
- Hook with different valid params (movie vs tv, different ids)
- Conditional rendering branches (empty list vs populated, mobile vs desktop)
- light/dark variants, with/without optional props
```

### Level 3 — Managed Error Cases

Errors the code explicitly handles — expected failures with user-facing feedback.

```
- Section error state (error MSW handler → error message or hidden section)
- Form/input validation feedback (aria-invalid, error message)
- Disabled states prevent interaction
- Empty state (return null / "no results")
```

### Level 4 — Unmanaged Error Cases

Unexpected failures — network errors, malformed data.

```
- Malformed input (missing fields, wrong types) — `??` fallbacks hold
- Unexpected null/undefined props or return values
- Async errors surfaced, not swallowed
```

### Level 5 — Edge Cases

Boundary conditions and unusual but possible scenarios.

```
- Empty arrays, null values, undefined optional props
- Maximum-length strings, zero values, missing images (poster/profile path null)
- Rapid mount/unmount (cleanup, no act warnings)
- Unicode/special characters in search input
- Single item vs many items (pagination / "More results" boundary)
```

## Test Scope by Layer

### React UI Components (`packages/reference`)

- Renders without crash (L1)
- Each variant/size renders correctly (L2)
- Disabled/loading/error states (L3)
- Missing optional props, `??` fallbacks (L5)
- Accessibility: role, label, aria-state attributes (L1–L2)
- Runner: Vitest + RTL (jsdom), files `*.test.tsx`

### Stencil Web Components (`packages/stencil`)

- Use **`@stencil/vitest`** (`render`, `h`, matchers), files `*.spec.{ts,tsx}`, `environment: 'stencil'`
- Renders with required `@Prop`s (L1); each prop/variant (L2)
- Emits the right `@Event` (`e.detail`) on interaction (L2)
- Reflects `@State` changes / `@Method` calls (L2–L3)
- Missing optional props / slots empty (L5)
- See `references/09-testing.md` in the `stencil` skill

### Utilities & hooks (`packages/shared`)

- Returns expected shape on success (L1)
- Different valid input combinations (L2)
- Error handling (L3–L4); cleanup on unmount (L5)
- DOM-dependent files opt into jsdom via `// @vitest-environment jsdom`

## Test Utilities & Mocks

- React render helpers in `@fubaritico-ds/shared/test-utils`
  (`renderWithReactQuery`, `renderWithRouter`, …)
- Generic browser mocks via `setupBrowserMocks()` from `@fubaritico-ds/shared/mocks`
- ALWAYS `userEvent` (never `fireEvent`)
- Mock modules at the top level with `vi.mock(...)`

## Naming Convention

```ts
describe('ComponentName', () => {
  describe('happy path', () => { ... })
  describe('variants', () => { ... })
  describe('managed errors', () => { ... })
  describe('unmanaged errors', () => { ... })
  describe('edge cases', () => { ... })
})
```

## Pragmatic Application

- Levels are not equal in size — edge cases may have 1–2 tests, variants may have 10
- If a level genuinely does not apply (e.g. a pure presentational atom has no async/error path),
  document it: `// L4: N/A — no async operations`
- Prioritize quality over quantity — each test asserts one meaningful behavior
