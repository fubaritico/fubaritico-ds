---
name: test
description: Write tests for a UI component, app section, hook, or utility following the 5-level test policy. Use when creating or updating tests for any code unit.
allowed-tools: Read Write Glob Grep Bash(pnpm:*)
argument-hint: '[ComponentName or path]'
paths:
  - packages/**
  - apps/**
metadata:
  version: '1.0'
---

# Test

Write tests following the mandatory 5-level test policy (see `.claude/rules/tests.md`).
Stack: **Vitest 3 + React Testing Library 16 + MSW**.

## Arguments

`$ARGUMENTS` = component/hook/section name or file path (e.g. `Typeahead`, `useSearchMulti`, `Cast`)

## Steps

1. **Read the source** — read all files of the unit (component, hook, section) to understand props, branches, callbacks, async behavior
2. **Determine the layer** — UI component (packages/reference, packages/layouts), app section (apps/\*), hook, or utility
3. **Write the test file** following the 5-level structure below
4. **Run tests** — `pnpm test` (or `pnpm --filter <pkg> test`) to verify all pass

## 5-Level Structure (MANDATORY — no level skipped)

```tsx
import { screen } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { renderWithReactQuery } from '@fubaritico-ds/shared/test-utils'

import ComponentName from './ComponentName'

describe('ComponentName', () => {
  describe('happy path', () => {
    // L1 — nominal use case: renders with required props, callbacks fire, hook returns expected shape
  })

  describe('variants', () => {
    // L2 — each variant/size/state, conditional branches (empty vs populated, light/dark, mobile/desktop)
  })

  describe('managed errors', () => {
    // L3 — handled errors: error MSW handler → error message/hidden section, validation feedback, disabled state
  })

  describe('unmanaged errors', () => {
    // L4 — unexpected: 500 handler, malformed data, unexpected null. If N/A: `// L4: N/A — no async operations`
  })

  describe('edge cases', () => {
    // L5 — boundaries: empty arrays, null/undefined props, missing image paths, single vs many, unicode
  })
})
```

## Layer-Specific Guidance

### UI Components (`packages/reference`, `packages/layouts`)

- Render with `renderWithReactQuery` (or plain `render` for pure presentational atoms)
- Check: renders, each variant/size, disabled/loading states, accessibility roles/labels
- L4 is usually N/A (no async) — add the comment

### App Sections (`apps/*` — embedded queries)

- Mock `useParams`: `vi.mock('react-router-dom', () => ({ useParams: vi.fn() }))`
- Mock the data hook at module level: `vi.mock('../../hooks/useDataHook', ...)`
- Check: renders content (default), loading skeleton, error/empty (return null), variant branches (movie/tv)
- Section title always visible; section hidden when no data

### Hooks (`apps/*/hooks`, `packages/shared`)

- Use `renderHook` from `@testing-library/react`
- Check: return shape, different valid params (all dynamic params in queryKey), error/isError, cleanup on unmount

## Rules

- **ALWAYS `userEvent`** — never `fireEvent`
- **Never hardcode fallback values** in expectations — if the code shouldn't have fallbacks, the test shouldn't either
- **Mock only external boundaries** — router, network (MSW), data hooks. Never mock the unit under test.
- **One behavior per `it()`** — the name describes behavior, not implementation
- **Accessibility-first queries** — `getByRole('button', { name: '...' })` over `getByTestId`
- **MSW handlers** from `@fubaritico-ds/shared/mocks` — `{ default, loading, error }`

## File Naming

| Layer        | Test file location                     |
| ------------ | -------------------------------------- |
| UI / layouts | `ComponentName/ComponentName.test.tsx` |
| App section  | `SectionName/SectionName.test.tsx`     |
| Hook         | `hooks/useHook.test.ts`                |
| Utility      | `utils/utilName.test.ts`               |
