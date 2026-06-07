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
2. **Determine the layer** — React component (packages/reference), Stencil Web Component (packages/stencil), or utility/hook (packages/shared)
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
    // L3 — handled errors: error state/message, validation feedback, disabled state
  })

  describe('unmanaged errors', () => {
    // L4 — unexpected: malformed data, unexpected null. If N/A: `// L4: N/A — no async operations`
  })

  describe('edge cases', () => {
    // L5 — boundaries: empty arrays, null/undefined props, missing image paths, single vs many, unicode
  })
})
```

## Layer-Specific Guidance

### React Components (`packages/reference`)

- Render with helpers from `@fubaritico-ds/shared/test-utils` (or plain `render` for pure atoms)
- Check: renders, each variant/size, disabled/loading states, accessibility roles/labels
- L4 is usually N/A (no async) — add the comment

### Stencil Web Components (`packages/stencil`)

- Use `@stencil/vitest` (`render`, `h`, matchers); files `*.spec.{ts,tsx}`, `environment: 'stencil'`
- Check: renders with required `@Prop`s, each variant, emitted `@Event` (`e.detail`), `@State`/`@Method`
- See `references/09-testing.md` in the `stencil` skill

### Utilities & hooks (`packages/shared`)

- Use `renderHook` from `@testing-library/react` for hooks
- Check: return shape, valid param combinations, error handling, cleanup on unmount
- DOM-dependent files opt into jsdom via `// @vitest-environment jsdom`

## Rules

- **ALWAYS `userEvent`** — never `fireEvent`
- **Never hardcode fallback values** in expectations — if the code shouldn't have fallbacks, the test shouldn't either
- **Mock only external boundaries** — never mock the unit under test.
- **One behavior per `it()`** — the name describes behavior, not implementation
- **Accessibility-first queries** — `getByRole('button', { name: '...' })` over `getByTestId`
- **Browser mocks** via `setupBrowserMocks()` from `@fubaritico-ds/shared/mocks`

## File Naming

| Layer             | Test file location                     |
| ----------------- | -------------------------------------- |
| React (reference) | `ComponentName/ComponentName.test.tsx` |
| Stencil WC        | `ui-name/ui-name.spec.tsx`             |
| Hook              | `hooks/useHook.test.ts`                |
| Utility           | `utils/utilName.test.ts`               |
