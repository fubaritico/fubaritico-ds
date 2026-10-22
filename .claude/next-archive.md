# Next — archive

> The content of `next.md` on 2026-10-22, kept when the task list moved to the Trello board (`/trello`), translated
> into English the same day. Not loaded at launch.

# Next — current actionable state

> Loaded at session start (CLAUDE.md `### Next` → `@next.md`). Single source for "what's next".
> North-star program: **`files/plans/roadmap.md`** (phases A→F).

> ## ▶ STATE ON 2026-10-21 (evening) — **0.7.0 published and adopted by Atlas; themes, step 2 to do**
>
> Plan: **`files/plans/theming.md`**. Step 1 (colour roles) published in 0.7.0; Atlas migrated (`aef0bf1` on their
> side). The "little thing" of 13/10 (the Tooltip's arrow) is settled (`76bde29`, not published → ships in 0.7.1 or
> with the next minor).
>
> **Tomorrow, the dev's choice**:
>
> 1. **Themes, step 2**: white label radius → 0 (radius tokens) + a CHANGELOG note. Then 3: the `[data-theme]`
>    mechanism (an SD build per theme, Storybook toolbar, a browser contrast test); 4: `tone`; 5: `dark`. Notes for
>    step 3: the table's row hover derived from `selected` at 50 %; the success alert's border (green.500, ~2.3:1) →
>    `success-hover`?
> 2. **Command menu for Atlas** (`files/REQUEST-menu-role-from-europe-historical-atlas.md`, CARTO-122, low
>    priority): `role="menu"`/`menuitem`, Tab closes, optional typeahead, `aria-keyshortcuts` passed through. My
>    recommendation: a sibling component (`ActionMenu`) rather than a `kind` prop — to debate with the dev.
>
> **Queued**: the DataTable's `role="grid"` roving focus. Release: `/release` (typed by the dev), his go at each
> publication.

## DONE (2026-10-11) — "Tooltip on truncated text" → `TruncatedText`

The `WithTooltip` stub is replaced and deleted. Four steps, **all done** (step 4 on 2026-10-12): no stopgap
`title`/`aria-label` left. Cut text → `TruncatedText` (`TruncatedContent`/`DateCell`, headers, Badge `canTruncate`)
or direct hooks (link cell); hints → `useTooltip` + hidden text (`.ui-data-table__hint`). Listbox: nothing to do
(it does not truncate). **Planned next (the dev's decision)**: the DataTable's **`role="grid"`** roving focus — a
single Tab stop for the grid, instead of one per cut cell / hint (see `known-issues.md`).

## DONE (2026-10-09) — browser tests (Vitest Browser Mode + Playwright)

> **In place**: projects `unit` (jsdom) + `browser` (Chromium, `*.browser.test.tsx`) in
> `packages/reference/vitest.config.ts`, the real skin loaded, pointer commands, the CI installs Chromium. First
> batch: `Slider` (native keyboard). **Left**: ColorPicker (in progress), Drawer/Modal (real `<dialog>` + the
> `display` rule), Image (IntersectionObserver). Original framing: this file's git history.

## DONE (2026-10-11) — border-radius: the corner API

Logical corners on the 21 skins, round shapes on `--radius-full`, the dropdown's literal cleaned. Details:
`known-issues.md`. **Next = the THEMES chantier** (the dev, 2026-10-11): two or three default themes, to show that
the tokens alone give whatever is wanted — one with « square corners » (`sm`/`md`/`lg` tokens at 0) and at least
one rounded. See [[theming-strategy]].

## DONE (2026-10-12) — portals on `body` → top layer

The Tooltip moved to the top layer (proven: a portal on `body` opened from a Modal ends up UNDER the `<dialog>`, in
the inert part). **Same defect** in `Dropdown`, `Typeahead` (menu), `BottomSheet`, `DataTable/DropdownFilter` and
`TableFooterContent`: they portalled through `components/Portal`. The dev's decision (2026-10-11): top layer in place
by default, portal as an option. One component at a time, each with its browser test « open inside a Modal ».
**Dropdown DONE** (`49faf4b`): a manual popover anchored in CSS, focus in the menu, Escape consumed. **Typeahead
DONE** (`3218422`). **BottomSheet DONE** (`3f55d36`, native `<dialog>` modal / popover). **DropdownFilter +
TableFooterContent DONE** (`de20233`, `withPortal` removed). No portal by default any more.

## Parallel thread

"Agent-ready" adoption (Astryx study) — plans in `files/plans/agent-ready/`, start with **P1 doc-as-data** (Button as
the guinea pig). See [[astryx-agent-ready-study]].

## Long threads

North-star, DataTable (milestone in progress), white-label thread, 0.1.0 delivery, locked decisions, analysis
artefacts: **`.claude/next-threads.md`** (read when touching them).
