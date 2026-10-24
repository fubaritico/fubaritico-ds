# Next — the resume point

> Loaded at session start (CLAUDE.md `### Next` → `@next.md`). **Since 2026-10-22 the list of tasks is the
> Trello board** — https://trello.com/b/eEZaJpsL/fubaritico-ds, through the `/trello` skill. This file holds
> only where we stopped, what is mid-flight, and context that is not a task. Its former content is in
> `next-archive.md`, verbatim. Long threads (north-star, locked decisions): `next-threads.md`.

## ▶ RESUME HERE (2026-10-22, evening)

Nothing waits in **À valider**, nothing is **En cours**, **À faire** is empty: the order is his. All is
committed and pushed (`69d527b`).

Two checks for the dev, in a **new session** (the `.claude/` changes of 2026-10-22 load only there):

- the start goes well and the prompt hook names the rules when he speaks of a component (REPO-150);
- « écris les tests de Tabs » makes `/test` start by itself — the French `when_to_use` triggers, « pour
  l'instant » (his words); `/context`, the Skills row, shows whether a description was cut.

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
| **Fait**, à publier | —  | 0.8.0 published 2026-10-24 (REPO-155: REACT-152 Toast, STYLES-119 Tooltip arrow) |

The day's choice still stands: themes step 2 (TOKENS-124) or Atlas's menu (REACT-128, low priority; my
recommendation: a sibling `ActionMenu` rather than a `kind` prop — to debate).

## Worth knowing

- The Trello token reaches **every** board of the account, Atlas's included: the script writes only to ours
  (`board.json`). Atlas's skill says the opposite (« its token reaches this board only »): no longer true, to
  tell its side. Its script also resolves a ticket whose scope is mistyped; ours refuses it.
- Release: `/release` (typed by the dev), his go at each publication; then `trello published X.Y.Z`.
