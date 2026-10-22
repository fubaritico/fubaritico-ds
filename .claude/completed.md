## Completed

The last two sessions, short, citing their tickets (what shipped lives in the Fait tickets). Older ones:
`completed-archive.md`.

### 2026-10-22 — the Trello board, the context by path, every file in English, the prompt audit

**Two spans** (10:46 → 13:09; 17:00 → 19:17, 4h39), the chantier opened on 21/10 (3 spans, 7h36). Pushed.

- **Morning** — the board and `/trello` (REPO-143); the rules loaded by path, the prompt hook, Atlas's
  methods ported (REPO-150); `rules/error-handling.md` for a library (`421bd15`); **every file in English**,
  the repository being public (the dev's call); the stray journal of 16/09 merged back (`513c3ef`).
  The dev: « c'est bon, tu peux pousser les commits ».
- **Evening** — `/doctor prompt-audit`, then the dev: « corrige les retours du tableau », French triggers
  « pour l'instant », « corrige les défauts restants ». Seven commits `d73b359` → `69d527b`: the six e2e
  agents rewritten for Playwright Test against Storybook (REPO-151, done), `tests.md` and `/test` on
  Vitest 4, `architecture.md` true to the code, `/review` routing to its agents (PLAT-008), `audit-style`
  and `audit-owasp` rewritten for the DS, `when_to_use` in French on eleven skills (REPO-150 comment).
- **How a review runs** (his question): `/review` orchestrates, the seven `review-*` agents hold the rules.
- **My faults**: a first `audit-style` example with `background:` where the skin writes
  `background-color:` (caught before commit); a `git add -A .claude`, which `/commit` forbids — it failed
  on a pathspec and staged nothing.

### 2026-10-21 — release 0.7.0, Atlas migrated, the light Tooltip's arrow

**One span** (20:06 → 22:45, 2h39), resumed after 7 days. A new chantier.

- **0.7.0 published** through `/release minor` (the skill only starts by the dev's hand:
  `disable-model-invocation`, on purpose). Beforehand: Stencil's `components.d.ts` ignored (`5ef57f4`).
  Release `980d614`, tag `v0.7.0`, run `39654644976` (5 lines `+ @fubaritico/*@0.7.0`). Handoff written;
  **Atlas migrated the same evening** (`aef0bf1` on their side, no old name left), earlier than planned.
- **The "little thing in the whole type" of 13/10 = "tooltip"** (dictation), not the type. The light
  variant's arrow had no outline and sat 1px off (offsets in border-box, an absolute box in padding-box).
  **`76bde29` `fix(styles)`**: two triangles `::before` outline / `::after` fill (Bootstrap's technique),
  `--ui-tooltip-arrow-size` tied to `ARROW_SIZE` by a test, **forced colours** (proven in Chromium: the
  triangles became rectangles) → `forced-color-adjust: none`. Browser command `forcedColors`
  (`vitest.browser.media.ts`). A thin light border = a WCAG 1.4.11 exception, assumed (the dev).
- `known-issues.md` past 200 lines → `known-issues-datatable.md` (`4167a61`).
- **Received from Atlas**: `files/REQUEST-menu-role-from-europe-historical-atlas.md` (CARTO-122, low priority).
