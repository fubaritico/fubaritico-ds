# Rules — Test Policy

> Every new component, hook, section, route, utility, or bug fix MUST ship with tests.
> No code is considered done without tests, a `/commit`, and `/end-session`.

Stack: **Vitest 3 + React Testing Library 16 + MSW** (mocks from `packages/shared`).
E2E (Cucumber + Playwright) lives in `packages/e2e` and is complementary — the 5-level
policy below applies to unit/integration tests.

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
- API returns 500 (error MSW handler) — component degrades gracefully
- Query retry / isError surfaced
- Malformed response (missing fields, wrong types) — `??` fallbacks hold
- Unexpected null/undefined from the TMDB client
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

### UI Components (`packages/reference`, `packages/layouts`)

- Renders without crash (L1)
- Each variant/size renders correctly (L2)
- Disabled/loading/error states (L3)
- Missing optional props, `??` fallbacks (L5)
- Accessibility: role, label, aria-state attributes (L1–L2)

### App Sections (`apps/*` — embedded queries)

- Renders content with a `default` MSW handler (L1)
- Loading skeleton with a `loading` handler, variant branches (L2)
- Error/empty states with `error`/empty handlers (L3–L4)
- `useParams` mocked for id-driven sections (L1)
- Section title always visible; section hidden (return null) when no data (L3)

### Hooks (`apps/*/hooks`, `packages/shared`)

- Returns expected shape on success (L1)
- Different input combinations — all dynamic params in the queryKey (L2)
- Error handling, isError (L3–L4)
- Cleanup on unmount (L5)

## Test Utilities & Mocks

- Use `renderWithReactQuery` / `renderWithRouter` from `@fubaritico-ds/shared/test-utils`
- MSW handlers from `@fubaritico-ds/shared/mocks` — export `{ default, loading, error }`
- ALWAYS `userEvent` (never `fireEvent`)
- Mock hooks at module level: `vi.mock('../../hooks/useDataHook', ...)`
- Real TMDB payloads in `packages/shared/src/mocks/data/` (fetched via curl for accurate structure)

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
