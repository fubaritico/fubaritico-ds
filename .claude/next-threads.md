# Next — long threads (programme, milestones, delivered)

> Split out of `next.md` on 2026-10-09 (200-line cap). `next.md` = the resume point; here = the backdrop:
> north-star, milestones in progress, locked decisions. The tasks themselves are on the board (`/trello`),
> the initiatives in its Epics column (DESIGN-120…123, DESIGN-144, DESIGN-156).

## North-star (roadmap.md)

White-label, multi-framework, **industrial-grade** DS — DataTable aiming at **AG-Grid parity**.
Foundation = **`@tanstack/table-core`** (no headless rewrite). Logic must be **agnostic / pluggable /
pure-TS** (TS is the real support, not React). **Perf rule: delegate a heavy op ONLY when necessary**
(150k / ~2M acceptable; Web Workers à la Handsontable for millions). Memory:
`data-table-industrial-multi-framework-goal-external-selection-store-decision`.

Phases: **A** DataTable skin (React) → **B** finish reference DS → **C** maximise DataTable features
(≈AG Grid) → **D** Stencil generation (WC/Angular/Vue/React, no DataTable) → **E** DataTable on
`table-core` (agnostic) → **F** DataTable in Stencil (multi-framework). Plans C/E/F = to write.

## ACTIVE — DataTable (milestone IN PROGRESS, NOT finished) — DESIGN-121

**Goal: ZERO bugs.** The BEM skin is largely done but the table milestone **is not over** — the dev drives
and hands out the next tasks as they come. Do not consider the table « done ».

**Skin de-Tailwind DONE** (2026-07-10, 8 commits `bd33847`..`5ad66f5`): cells + features + chrome skinned,
namespace **`ui-data-table`**; **block `.ui-data-table` on the Card** (carries the vars, toolbar/footer
inherit); `<table>` = `.ui-data-table__table`; `Readonly<Props>` everywhere; cell a11y (aria-sort, hidden
status text, accessible names); `DateCell` prop `truncate`. Constants in `variants/src/table.ts`, parity tests
in `table.test.ts`.

**Settled on 2026-07-16**: paginated scroll (`overflow: auto`); **quick filter repaired**
(`getFilteredRowModel`); **footer = chrome sibling, NOT `<tfoot>`** (`<tfoot>` reserved for summary rows);
README draft. Details: [[datatable-behavior-decisions]].

**Remaining loose ends (when the dev says so)**:

- **a11y root** — REACT-132: `role="button"` on a `<tr>` (clickable row) **breaks the table semantics**
  (finding A11Y-003 open); `<caption>` / `aria-busy` on the `<table>`; scrollable region label.
- **`DropdownFilter`** — REACT-133: kept (composable library, NOT dead), not wired — decision pending.
- **Leftovers of the migration plan**: boolean props → composition (REACT-145), the 12 untested cells
  (REACT-146), small cleanup (REACT-147).

Perf (`data-table-review-backlog-deferred-findings`): select-all 150k ≈ **207 ms (OFF, prod)**, cost =
TanStack O(N) bookkeeping, not paint; `startTransition` = a band-aid, not a default. The skin must survive the
`react-table` → `table-core` swap (Phase E): classes on the semantic primitives, not on the TanStack API.
Plan/checklist: `files/plans/datatable-migration.md` (its checkboxes are stale: progress lives on the tickets).

## THREAD — white-label native-CSS DS (Phase B)

Plan: `files/plans/native-css-migration.md`. Memory: `native-css-migration-backlog`, `white-label-native-css`.

**MIGRATION ALMOST DONE.** 28 components carry a README and a BEM skin. Added on 2026-10-08/09 beyond the
initial backlog: **Menu, Modal, Typeahead, Image, Drawer, Tabs** migrated; **Alert**, **ProgressBar**,
**Slider** written; **BottomSheet** (ex-Drawer, renamed); **Drawer** rewritten on a native `<dialog>`. Of the
nine components the dev was to bring over, only the **DatePicker** is left (REACT-142); the `icons` package
too (DESIGN-144).

**STILL ON TAILWIND — excluded from the published package, not deleted** (REACT-134): `Carousel` (138
classes) and `next/*` (50). They live in the repository, outside the build. `HeroImage` is **parked as `.bak`**
(see its `PARKED.md`), `TrailerCard` deleted — both tied to the TMDB domain.

**Icon, Portal, ConditionalWrapper**: zero Tailwind, so already compatible; they only lack a README
(REACT-135).

## DELIVERED — packages consumable by the sibling monorepo

`01be734`. Four public packages in **0.1.0**, then published on GitHub Packages from **0.2.0** (`d9bc1db`)
as `@fubaritico/*`; `reference` ships as **`@fubaritico/react`**, the React deliverable (decided 2026-10-09).
Integration doc at the root: **`INTEGRATION.md`**.

Five blockers lifted at 0.1.0: `styles` was not publishable; the barrel injected Tailwind + preflight; the
`./styles.css` export pointed at the wrong file; `msw` shipped as a dependency (now an optional peer); **the 27
component READMEs did not ship** (`files: ['dist']`) — a script now copies them into `dist`, which matters most
for an integrating AI. `getBlurDataUrl` is internalised ⇒ `reference` no longer depends on `shared` at run time.

## Locked decisions

Lerna + Nx (no Turbo); skin = `@fubaritico/styles`; CVA resolvers in `@fubaritico/variants` (pure TS,
React/DOM-free); behaviour services in `@fubaritico/behaviors`; web-only. Stateful/compound → `/state-storage`
skill. Then: finish Stencil → wire `build:packages` (DESIGN-122).

## Analysis artefacts (persisted)

`files/analysis/storage-port-design.md` (StoragePort seam/sink, observable, same screen, commented line by
line). Basic Memory notes: `scope-object-builder-latency-analysis-odaseva`,
`data-table-industrial-multi-framework-goal-external-selection-store-decision`,
`data-table-review-backlog-deferred-findings` (benchmark results added).
