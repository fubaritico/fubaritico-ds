# Next — the resume point

> Loaded at session start (CLAUDE.md `### Next` → `@next.md`). **Since 2026-10-22 the list of tasks is the
> Trello board** — https://trello.com/b/eEZaJpsL/fubaritico-ds, through the `/trello` skill. This file holds
> only where we stopped, what is mid-flight, and context that is not a task. Its former content is in
> `next-archive.md`, verbatim. Long threads (north-star, locked decisions): `next-threads.md`.

## ▶ RESUME HERE (2026-10-24, night)

Nothing waits in **À valider**, nothing is **En cours**, **À faire** is empty: the order is his. All is
committed and pushed (`607870b`). **0.8.0 is published** (the Toast); Atlas has its handoff.

**Since 2026-10-24, work is committed on `main`** — concise commits, one ticket each; a branch and a PR
only when the dev asks (`rules/architecture.md`, REPO-157). Pushing still takes his go.

The e2e agents exist (REPO-151, done) but have never run: `packages/e2e` does not exist yet — their
first run, through `e2e-orchestrator`, creates it (REPO-149, in Idées).

## The board

| where               | ticket                                                                                                                                                                                                              | state                                        |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------- |
| **Epics**           | DESIGN-120 themes · DESIGN-121 DataTable · DESIGN-122 Stencil · DESIGN-123 agent-ready · DESIGN-144 icons · DESIGN-156 a11y | « Paliers » + « Tickets enfants » (every child ticket) |
| **À valider**       | —                                                                                                                                                                                                                   | empty                                        |
| **À faire**         | —                                                                                                                                                                                                                   | empty: the order is his                      |
| **Backlog**         | themes 2→5 (TOKENS-124…127), Atlas's command menu (REACT-128), `role="grid"` (REACT-129), Stencil green (STENCIL-130), doc as data (DESIGN-131), DataTable leftovers (REACT-145…147), Storybook play tests (SB-148) |                                              |
| **Idées**           | the e2e harness and the CI stubs (REPO-149), among 13 others                                                                                                                                                        |                                              |
| **Fait**, à publier | — | nothing: 0.8.0 published 2026-10-24 (REPO-155) |

The choice still stands: the contrasts (STYLES-153, a11y Epic), themes step 2 (TOKENS-124) or Atlas's menu (REACT-128, low priority; my
recommendation: a sibling `ActionMenu` rather than a `kind` prop — to debate).

## Worth knowing

- The Trello token reaches **every** board of the account, Atlas's included: the script writes only to ours
  (`board.json`). Atlas's skill says the opposite (« its token reaches this board only »): no longer true, to
  tell its side. Its script also resolves a ticket whose scope is mistyped; ours refuses it.
- Release: `/release` (typed by the dev), his go at each publication; then `trello published X.Y.Z`.
- GitHub ruleset `main-protect` (created 2026-10-24 00:41) forbids updating `main` except for admins: a push
  prints « Cannot update this protected ref » yet goes through (the dev is admin). To silence it: drop the
  `update` rule (Settings → Rules) — his call.
