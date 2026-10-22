---
name: test
description: Write tests for a UI component, a behaviour service, a resolver, a hook, or a utility following the 5-level test policy. Use when creating or updating tests for any code unit, a browser test, or a skin contract test.
when_to_use: 'Quand le dev dit « écris les tests », « ajoute des tests », « teste ce composant », « un test navigateur », « un test qui prouve le fix », « les 5 niveaux », « la couverture », « le test casse », « fais passer les tests ».'
allowed-tools: Read Write Glob Grep Bash(pnpm:*)
argument-hint: '[ComponentName or path]'
metadata:
  version: '1.1'
---

# Test

Write tests following the mandatory 5-level test policy (see `.claude/rules/tests.md`).
Stack: **Vitest 4 + React Testing Library 16**; a `*.browser.test.tsx` (Vitest Browser Mode) only for what
jsdom cannot do — the list is in `rules/tests.md`.

## Arguments

`$ARGUMENTS` = component, service, resolver or hook name, or file path (e.g. `Typeahead`, `TabsService`, `badge`, `useTooltip`)

## Steps

1. **Read the source** — read all files of the unit (component, service, hook) to understand props, branches, callbacks, async behavior
2. **Determine the layer** — React component (packages/reference), behaviour service (packages/behaviors), resolver (packages/variants), Stencil Web Component (packages/stencil), or utility/hook (packages/shared)
3. **Write the test file** following the 5-level structure below
4. **Run tests** — `pnpm test` (or `pnpm --filter <pkg> test`) to verify all pass

## 5-Level Structure (MANDATORY — no level skipped)

```tsx
import { render, screen } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { ComponentName } from './ComponentName'

describe('ComponentName', () => {
  describe('happy path', () => {
    // L1 — nominal use case: renders with required props, callbacks fire, hook returns expected shape
  })

  describe('variants', () => {
    // L2 — each variant/size/state, conditional branches (empty vs populated, with/without a slot, ltr/rtl)
  })

  describe('managed errors', () => {
    // L3 — handled errors: a broken contract throws, validation feedback, disabled state
  })

  describe('unmanaged errors', () => {
    // L4 — unexpected: malformed data, unexpected null. If N/A: `// L4: N/A — no async operations`
  })

  describe('edge cases', () => {
    // L5 — boundaries: empty arrays, null/undefined props, a missing image source, single vs many, unicode
  })
})
```

## Layer-Specific Guidance

### React Components (`packages/reference`)

- Plain `render`; `renderWithRouter` from `@fubaritico/shared/test-utils` only for a router adapter
- Check: renders, each variant/size, disabled/loading states, accessibility roles/labels, slots throw outside
  their parent (`expect(() => render(<Card.Body />)).toThrow(...)`)
- L4 is usually N/A (no async) — add the comment
- Real browser needed (dialog top layer, geometry, pointer drags, `:focus-visible`, RTL) → a sibling
  `ComponentName.browser.test.tsx`, `userEvent` from `vitest/browser`

### Behaviour services (`packages/behaviors`) and resolvers (`packages/variants`)

- `node` environment, no DOM: drive the service by its public API, assert snapshots and ARIA attribute
  objects; a resolver returns BEM class strings
- Inject collaborators as mocks — never a global

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
- **Browser mocks** via `setupBrowserMocks()` from `@fubaritico/shared/mocks`

## File Naming

| Layer             | Test file location                     |
| ----------------- | -------------------------------------- |
| React (reference) | `ComponentName/ComponentName.test.tsx` |
| Browser (reference) | `ComponentName/ComponentName.browser.test.tsx` |
| Behaviour service | `behaviors/src/name/name-service.test.ts` |
| Resolver          | `variants/src/name.test.ts`            |
| Stencil WC        | `ui-name/ui-name.spec.tsx`             |
| Hook              | `hooks/useHook.test.ts`                |
| Utility           | `utils/utilName.test.ts`               |
