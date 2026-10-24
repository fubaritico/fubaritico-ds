---
name: trello
description: Track the design system's work as tickets on the fubaritico-ds Trello board — list it, find a ticket, add an idea or a backlog ticket from its template, move it, comment, mark it done against the Definition of Done, tag what waits for a release. Use when the dev says Trello, ticket, tableau, board, idée, backlog, « mets-le dans Trello », « c'est fait », « on en est où », at every start-session and end-session, when a task starts, finishes, waits on the dev, or ships in a release.
allowed-tools: Bash(/Users/stephanecottereau/Desktop/WebstormProjects/fubaritico-ds/.claude/skills/trello/scripts/trello:*) Bash(node --test:*)
metadata:
  author: fubaritico-ds
  version: '1.0'
---

# Trello — the board of record for the work

Since 2026-10-22 (the dev's call), **the list of tasks is the board** `fubaritico-ds`:
https://trello.com/b/eEZaJpsL/fubaritico-ds. `next.md` keeps the resume point, never a second list.
Modelled on europe-map's `/trello` (analysis: `files/plans/trello/board-setup.md`), with its incidents
designed out. In French to the dev an item is a **ticket**, never a _carte_ (`Card` is a component).

## One home per fact — the others point to it

| home                                                                           | holds                                                                                                    | no longer holds          |
| ------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------- | ------------------------ |
| **the board**                                                                  | the tasks and their state: what, stage, blocked, who has the ball, what waits for a release              | —                        |
| `files/plans/*.md`                                                             | an Epic's design: why, how, trade-offs; its steps = a checklist on the ticket                         | progress                 |
| known-issues (slices `.claude/rules/known-issues/*.md`, map `known-issues.md`) | a problem's mechanism; an entry that asks for an action carries ` — REACT-12`                            | the to-do                |
| `.claude/next.md`                                                              | where we stopped, what is mid-flight, context that is not a task; names the tickets En cours / À valider | any task list            |
| `.claude/completed.md`                                                         | a short account per session (spans, the dev's words, my faults), **citing** tickets                      | the detail of a delivery |

Every gesture keeps both sides in step, in the same breath: a ticket born from a known-issue or a plan
names it in **Détails**, and the entry gets ` — REACT-12`; a closed known-issue → its ticket `done`, the
commit in a comment; a done ticket → `completed.md` cites it, never re-describes it.

**Sync check — at every `/end-session`, and at `/start-session` before proposing work:**

1. `list`: every ticket En cours / À valider is named in `next.md`; every ticket touched this session
   carries a comment saying where it stands.
2. Every plan, known-issue or `next.md` changed this session (`git status`, `git diff --stat`): what it
   asks for has a ticket; every ticket it cites exists, in a coherent column.
3. Out of step → fix both sides **then**, or tell the dev in one line when it is his call.

## Columns — a ticket matures left to right

| column                           | holds                                                                                                                                                   | who moves a ticket in                                       |
| -------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------- |
| **Epics**                        | an initiative (themes, DataTable, Stencil, agent-ready, icons, a11y), outside the flow its whole life. Two checklists: « Paliers » the rungs of its plan, « Tickets enfants » EVERY ticket of the Epic (its stories, its bugs), ticked when done | the dev |
| **Idées**                        | a raw thought, _Idée_ template                                                                                                                          | anyone; what comes from me lands here                       |
| **Backlog**                      | a shaped ticket, wording validated, unordered                                                                                                           | the dev (a subject of a plan he decided may enter directly) |
| **À faire**                      | what he decided to do, **in his order**                                                                                                                 | the dev — never me                                          |
| **En cours**                     | what I work on, one or two at most                                                                                                                      | me, when I start a ticket he chose                          |
| **À valider par le développeur** | his gesture: check it in Storybook, or decide a question                                                                                                | me, the moment the ball is his                              |
| **Fait**                         | criteria + DoD met, newest on top                                                                                                                       | me, after his check                                         |

**The dev holds the order**: never pull from Backlog into À faire, never reorder, never start a ticket he
did not choose. « On passe à la suite » = propose the top of À faire, not start it.

## Tickets, scopes, labels

- Title `[STYLES-12] Tooltip : flèche claire` — French, his words, short, the component in the title;
  never an id or a function name. **One counter for the board**, never reused (archives count), given by
  the script: `add` takes `"[STYLES] …"` and refuses a number. The number never changes with the scope.
- **Scopes = layers**: `REACT` `STYLES` `TOKENS` `VARIANTS` `BEHAVIORS` `STENCIL` `SB` `REPO` `DESIGN`;
  two joined by `·` (`[REPO-79 · REACT]`). Files cite `REACT-12`, never Trello's `#12`. A reference
  whose scope is not the ticket's (`REPO-142` for `REACT-142`) is refused — Atlas's script accepts it.
- **Labels** live in `board.json` (`tag` refuses any other): gravité (`critique` `gênant` `cosmétique`,
  only on a fix), couche (redundant with the scope on purpose — a cue seen twice is wanted), type
  (`bug` `story` `dette` `décision` `doc` `a11y`), `demande Atlas`, `epic · …` (on every ticket of
  an Epic, and its link in the Epic's « Tickets enfants » — `child` does both), `à publier`, `Bloqué`. A new label is the dev's call: add it to `board.json`, run `setup`.
- **Blocked** = the red `Bloqué` label via `block` (link + comment on both), never a column. When the
  blocking ticket is done, `unblock` its dependants in the same breath.

## The two templates (`Modèle — Idée`, `Modèle — Backlog` — never move or `done` them)

```
**Quoi** : <one line, his words>
**D'où ça vient** : <the dev / a test / a review / Storybook / Atlas> — <date>
```

```
**Le problème ou le besoin** : …
**Le remède** : <one or two sentences; a product decision says so → À valider before any code>
**Critères d'acceptation** :
- <a gesture in Storybook> → <what he sees>
**Couches** : react | styles | tokens | variants | behaviors | stencil | storybook
**Dépend de** : <REACT-N — pourquoi> (sinon : rien)
**Détails** : <known-issue, plan, commit, Atlas request>
```

A ticket is not mature while its criteria are empty or untestable: a gesture and an observation in
Storybook, never "the code handles X".

## Definition of Done — every ticket

1. **Tests** — the 5-level policy (`rules/tests.md`); a browser test for what jsdom cannot do.
2. **Gate green** — `pnpm type-check && pnpm lint && pnpm test`.
3. **Reviewed** — `/review`, findings table shown to the dev first.
4. **README + story** for a component (`rules/component-docs.md`, `/story`).
5. **Checked by the dev in Storybook** after `pnpm build` → ticket in **À valider** with exactly what to
   look at; only his verdict (or his decision) moves it on.
6. **Committed on `main`** (`/commit`) after his check, with a commit TYPE that tells the truth (a fix typed
   `test(...)` gives « Version bump only »); the hash in a comment; then `done`.
7. **Written where it lives** — closed known-issue removed, plan updated, `next.md` pointer.
8. **The ticket documents the work** — its closing comment (below) is written before `done`.

A step that does not apply is said in the closing comment, never skipped in silence.

## A ticket is documentation (the dev's call, 2026-10-22)

The DS is a demonstration of how a design system is organised and built: a ticket must be re-readable
months later as a tip sheet. The closing comment, French, markdown, short:

- **A fix** — **La cause** (the mechanism, one or two sentences) · **Fichiers** (`path:line`) · **Le
  correctif**: the snippet that settles it (before → after when it reads better) · **La preuve**: the test
  that fails without it, by name · **À retenir**: the trap, so nobody walks into it again.
- **A feature** — **Fichiers** · **Les patterns**: each one named (compound + guarded hook, behaviour
  service + thin adapter, top-layer popover, corner API…) with the snippet that shows it · **Astuces**:
  what is non-obvious, the alternative rejected and why.

A snippet is copied from the commit, never rewritten from memory; 5 to 20 lines, the lines that matter.

## Releases — what Atlas's board does not have

`done` tags « à publier » when one of the ticket's scopes ships (`REPO`, `STENCIL`, `SB` are private —
`board.json` `unpublished`). After the `/release` run proves the publication, `published X.Y.Z` creates
`[REPO] Release X.Y.Z` in Fait with every « à publier » ticket in its checklist, removes the label and
comments « Publié dans la X.Y.Z » on each.

## The verbs

```bash
S=/Users/stephanecottereau/Desktop/WebstormProjects/fubaritico-ds/.claude/skills/trello/scripts/trello
$S list                       # active columns in full; Idées / Backlog / Fait as counts
$S list --all                 # everything (long: ~150 lines)
$S find "tooltip"             # titles containing the text, archived included — ALWAYS before add
$S add "Idées" "[STYLES] Titre" $'**Quoi** : …\n**D\'où ça vient** : …' styles défaut
$S edit STYLES-12 $'…'        # replace the description (shape an Idée)
$S rename STYLES-12 "Nouveau titre"   # the ticket prefix is kept
$S prefix STYLES-12 "styles · react"
$S above STYLES-12 REACT-9    # place just above another
$S move STYLES-12 "En cours"
$S comment STYLES-12 "commit 76bde29 — vérifié par le dev : « … »"
$S done STYLES-12             # → top of Fait (+ « à publier »), ticked in its Epic
$S published 0.7.1            # after a proven publication
$S tag STYLES-12 a11y · $S untag STYLES-12 a11y · $S priority STYLES-12 haute|moyenne|aucune
$S block REACT-9 STYLES-12 "attend le skin" · $S unblock REACT-9
$S link REACT-128 <https url> "Demande Atlas : CARTO-122"
$S checklist DESIGN-120 "Paliers" "étape 1" "étape 2" · $S check DESIGN-120 "étape 1"
$S child DESIGN-156 STYLES-153  # joins the Epic: its epic label + its link in « Tickets enfants »
$S rename-column Old New [--dry-run] · $S rename-label old new [--dry-run]   # in place; then board.json
$S show STYLES-12             # title, column, labels, description, checklists, links, comments
$S archive STYLES-12 "doublon de STYLES-9"   # my own mistakes only
$S setup                      # missing columns, labels, templates; column order
node --test .claude/skills/trello/scripts/*.test.mjs   # parser + client, mocked fetch
```

Announce each like any command (cause, reason, action): the verb is the action the dev reads. Config
lives in `board.json`; the script holds the verbs only.

## When to act, unasked

| moment                                                       | gesture                                                                                            |
| ------------------------------------------------------------ | -------------------------------------------------------------------------------------------------- |
| start-session                                                | `list`, sync check; tell the dev in two lines what waits on him (À valider) and the top of À faire |
| I start a ticket he chose                                    | `move N "En cours"`                                                                                |
| a ticket belongs to an Epic                                  | `child EPIC N` — its label and its link in « Tickets enfants »; `done` ticks it there              |
| a check or a decision is his                                 | `move N "À valider par le développeur"` + a comment saying exactly what to do                      |
| he finds a fault                                             | `comment` his words, `move N "En cours"`                                                           |
| he validated, DoD met                                        | `/commit`, `comment` the hash and his verdict, `done N`                                            |
| he mentions a thought, a review or a test surfaces a problem | `find`, then `add "Idées"`; tell him in one line                                                   |
| end-session                                                  | `list`, sync check, every touched ticket commented                                                 |

Never: create in À faire, reorder, delete, archive what is not my own mistake.

## Gotchas

- **An interrupted or rejected command may already have acted** (Atlas: 14 duplicates in Fait). After
  any interruption: `list` / `find` first, compare, then continue — never re-run blind. Batches skip a
  title that exists.
- **Read the whole `list` output** before creating (Atlas made a duplicate from a listing cut at 80 lines).
- **The token reaches every board of the account, Atlas's included.** Every path is built from
  `board.json` `board`; never write to another board. Reading Atlas's board for a link is fine.
- **Secrets**: `TRELLO_API_KEY`, `TRELLO_TOKEN` in `.env.local` (git-ignored). Never print them; to inspect
  the file, mask it (`sed -E 's/=.*/=<…>/' .env.local`). `TRELLO_SECRET_KEY` is unused.
- **Output on stderr** (`console.warn`); a Trello refusal exits 1 with its status, no retry. 401 = token
  revoked or mistyped: the dev regenerates it at `trello.com/power-ups/admin` → his power-up →
  _Authentification_ → the « jeton » link → _Autoriser_ (UI in French: look before naming a button).
- **A comment is a written fact**: never write that the dev tested something he did not.
