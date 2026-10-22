# Known Issues — the index

> **Since 2026-10-22 the entries live in path-scoped slices** under `.claude/rules/known-issues/`: each one
> loads only when a file of its place is read or written (`paths:`, code.claude.com/docs/en/memory). This
> file stays loaded at every session and holds only the map below. Closed entries go to
> `known-issues-closed.md` (verbatim, the step they close). An entry that asks for an action carries its
> ticket (`— REACT-12`); the task itself lives on the board (`/trello`).

| slice | holds | loads when a file matches |
| --- | --- | --- |
| `rules/known-issues/components.md` | the components: dialogs, top layer, Listbox, Card, Input, Rating, Spinner, Skeleton, Avatar, IconButton, the accepted WCAG exceptions | `packages/reference/src/components/**`, skins, resolvers, stories |
| `rules/known-issues/styles-tokens.md` | tokens and skin API: colour roles, corners, radius, focus, dash-ified names, the no-reset font rule | `packages/styles/**`, `packages/tokens/**`, `packages/variants/**` |
| `rules/known-issues/datatable.md` | the DataTable: skin scope, paint order, TanStack traps, perf | `packages/reference/src/components/DataTable/**` |
| `rules/known-issues/tooling.md` | SonarCloud, ESLint, commitlint, the harness | root configs, `.github/**`, `.husky/**` |
| `rules/known-issues/testing.md` | Vitest Browser Mode | test files, Vitest configs |

**A new entry goes in its slice**, never here — except a lesson that must hold before any file is touched.
**An older pointer** to `known-issues.md` or `known-issues-datatable.md` (tickets, plans) means a slice:
`grep -rn "<its words>" .claude/rules/known-issues/`.

**To have in mind at every session:**

- **Storybook (storybook-react) consumes the BUILT `reference` dist, not src** (exports map → `dist/*`, no Vite alias to source). After changing a `reference` component you MUST rebuild it (the root `pnpm type-check`/`lint`/`test` gate does it via Nx `^build`) AND restart Storybook — Vite does NOT hot-reload a workspace dep's `dist`. Symptom: story shows stale behaviour despite saved edits.
