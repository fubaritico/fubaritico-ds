# Next — the resume point

> Loaded at session start (CLAUDE.md `### Next` → `@next.md`). **Since 2026-10-22 the list of tasks is the
> Trello board** — https://trello.com/b/eEZaJpsL/fubaritico-ds, through the `/trello` skill. This file holds
> only where we stopped, what is mid-flight, and context that is not a task. Its former content is in
> `next-archive.md`, verbatim. Long threads (north-star, locked decisions): `next-threads.md`.

## ▶ RESUME HERE (2026-10-22)

Two tickets wait on the dev in **À valider par le développeur**:

- **REPO-143** — the DS's Trello board (history backfilled, open work, the `/trello` skill), committed.
- **REPO-150** — the context loaded by path (~100 KB → ~35 KB at launch), the rules hook, Atlas's methods
  ported. Check: a new session, whose start must go well.

Settled by the dev on 2026-10-22: the error-handling rule adapted to a library (`rules/error-handling.md`,
« on fera évoluer au besoin ») and **English for every file** (the repository is public), French in our talk
and on the private board. Open: the stray journal `.claude/skills/files/session-log.jsonl` (5 actions of
2026-09-16 that `/timeline` does not read) — copy them into `files/session-log.jsonl`, then delete it, on his go.

## The board

| where               | ticket                                                                                                                                                                                                              | state                                        |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------- |
| **Chantiers**       | DESIGN-120 themes · DESIGN-121 DataTable · DESIGN-122 Stencil · DESIGN-123 agent-ready                                                                                                                              | rungs as checklists, linked to their tickets |
| **À valider**       | REPO-143 board · REPO-150 context                                                                                                                                                                                   | for the dev to check                         |
| **À faire**         | —                                                                                                                                                                                                                   | empty: the order is his                      |
| **Backlog**         | themes 2→5 (TOKENS-124…127), Atlas's command menu (REACT-128), `role="grid"` (REACT-129), Stencil green (STENCIL-130), doc as data (DESIGN-131), DataTable leftovers (REACT-145…147), Storybook play tests (SB-148) |                                              |
| **Fait**, à publier | STYLES-119 the light Tooltip's arrow                                                                                                                                                                                | ships in 0.7.1 or with the next minor        |

Before 2026-10-22 the day's choice was: themes step 2 (TOKENS-124) or Atlas's menu (REACT-128, low
priority; my recommendation: a sibling `ActionMenu` rather than a `kind` prop — to debate).

## Worth knowing

- The Trello token reaches **every** board of the account, Atlas's included: the script writes only to ours
  (`board.json`). Atlas's skill says the opposite (« its token reaches this board only »): no longer true, to
  tell its side. Its script also resolves a ticket whose scope is mistyped; ours refuses it.
- Release: `/release` (typed by the dev), his go at each publication; then `trello published X.Y.Z`.
