# Completed — archive

Entries of 2026-10-21 and before, moved out of `completed.md` (it keeps the last two sessions). Translated into
English on 2026-10-22. Not loaded at launch. Since 2026-10-22 every delivery also has its Fait ticket on the board.

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

### 2026-10-13 — release 0.6.0, colour roles renamed (themes, step 1)

**Two spans in the log** (14:55 → 15:05; 16:51 → 18:09, ~1h30 logged — the log does not see the whole
evening), 6th day of the chantier opened on 08/10. Pushed, not published.

- **0.6.0 published** + CHANGELOGs completed (`cadca4a`) + Atlas handoff.
- **Themes plan** (`files/plans/theming.md`): white label (radius 0), `tone` (shades of one seed), `dark`
  (coloured primary); OKLCH derivation at runtime from `--theme-seed`, the L/C table taken from the dev's
  date-time-picker. A theme redefines the ROLES, never the grey scale.
- **The "muted" of 16/07 clarified by the dev**: it meant the blurry NAMES, not the semantic layer. Hence
  **`c88df0f` `feat(tokens)!`**: `roles.json` replaces semantic + aliases, `--color-<what it paints>-<role>`,
  27 skins rewired, primitives only in the color picker, guard `styles/test/color-roles.test.ts`. Resolved
  diff before/after: 5 intended shifts only (hovers 100→150, outline border 300→450, destructive text
  500→600, disabled arrow 450→400).
- **Review**: the default tooltip had turned white on white (a rewrite rule too broad) — caught;
  `text-destructive` and `fill-on-inverse*` created, `black` removed.
- **Atlas migration** written (`europe-map/MIGRATION-color-roles-from-fubaritico-ds.md`), to apply only
  with 0.7.0.

### 2026-10-11 — releases 0.4.1 / 0.5.0, corners, Tooltip → TruncatedText, portals → top layer

**One span** (13:30 → 21:18, 7h48, 405 actions), 5th span of the chantier opened on 08/10 (20h34 in total).
**~18 commits** pushed, two publications.

- **Releases** 0.4.1 and 0.5.0 + Atlas handoffs. Procedure written (`README.md` « Publishing a release ») and a
  **`/release`** skill in teaching mode (the dev wants to stay autonomous). Traps: a fix committed as `test(...)` →
  changelog « Version bump only » (the skill audits the types); a minor in 0.x moves EVERY package (fixed mode).
- **ColorPicker**: live hex preview (Enter validates, Escape goes back), compact made shorter, smaller thumbs with
  the 24px hit area kept.
- **`display` guard** (`1b52c09`): `state-guards.css` in `@layer ui.reset`, `!important` reversed by the layers —
  the skin's only guard.
- **Corner API** (`7fb6342`) on 21 skins, round shapes on `--radius-full`, a parity test.
- **Tooltip → top layer** (`4041311`, proven invisible inside a Modal before), **`TooltipService` + `useTooltip`**
  (`6b6cce3`, WCAG 1.4.13), **`TruncatedText`** (`c5dd012`), `WithTooltip` deleted.
- **Portals → top layer**: **Dropdown** (`49faf4b` — inside a Modal, Escape closed the whole modal and the Card
  clipped the menu; focus in the menu, cursor on the selected option), **Typeahead** (`3218422`), **BottomSheet**
  (`3f55d36` — native `<dialog>`: `showModal()` with `overlay`, `popover="manual"` without; it announced
  `aria-modal` without trapping focus).
- **Two `useNativeDialog` bugs** found on the way (Modal/Drawer concerned): a nested `close` propagated by React
  closed the parent dialog; a dialog remounted at each opening swallowed the first Escape after a close by the prop.
- **Extension 22:54 → 01:05** (same span in the log: 13:30 → 01:05, 11h34, a ~1h30 break included). \*\*DropdownFilter
  - TableFooterContent → top layer** (`de20233`): removing `withPortal` was enough; browser tests « inside a Modal ».
    `browser` project: `optimizeDeps` for `@tanstack/react-table` (two Reacts on a cold run). **`SortingFns`
    augmentation removed\*\* (`109a8bb`): `DataTableExample` made `sortingFns` required on every table, and the published
    `.d.ts` spread it; the comparator passed as a function, returns `0` on equality. Pushed, not published.

### 2026-10-09 — behaviors, GitHub Packages publication, ColorPicker → Popover → ColorField, 0.4.0

**Two spans the same day** (12:42 → 16:13, 3h31; 18:00 → 20:19, 2h19), the direct sequel of the night of 08/10 (a
chantier of 12h44 in total over 3 spans). **~26 commits**, three publications.

- **`packages/behaviors`** (`f9d5948`) then the **« state as a service »** model (`0503650`, `32497aa`): one pure TS
  service per component, thin adapters; Tabs migrated onto it. Skills `/add-package` (rebuilt) and
  `/behavior-service` (new).
- **GitHub Packages publication** (`d9bc1db`): scope `@fubaritico`, `reference` → **`@fubaritico/react`**, Lerna in
  fixed mode, `release.yml`. **0.2.0**, **0.2.1** (complete ESM imports + a Node smoke test), **0.3.0**
  (ColorPicker), **0.4.0** (Popover/ColorField). Successive handoffs to europe-map.
- **`ColorPickerService`** (`4d897c4`) + **`ColorPicker`** (`6cb5c5d`, review `d79c753`): HSVA as the source of
  truth, `null` = automatic (europe-map's requirement), hex as a draft, an accessible 2D area.
- **Vitest Browser Mode** (`a3511f6`): a Chromium `browser` project beside jsdom; convention `.browser.test.tsx`
  (Vitest) vs `.e2e.ts` (Playwright Test, reserved).
- **`Popover` + `ColorField`** (`38f99ae`): native `popover="auto"`, top layer, CSS anchoring, **no portal** — the
  dev wanted « par-dessus tout »; the top layer gives it, and it is also what makes opening **inside a Modal**
  possible (a portal outside the `<dialog>` would be inert). Proven by a browser test (stacking, typing, Escape
  closes the popover alone). 5-agent review applied: the Button's pressed state per variant, an injected service
  preserved, focus/reconciliation moved up into the service, accessible names « Choose color Fill » / « Hex color
  Fill ».
- **`compact` density** (`1afd42b`) at the dev's request (« plus tassée, en variante »): panel ≈13rem, 2:1 area,
  only the vars move; tested on real geometry.
- **Incident**: `lerna version` interrupted by the dev midway → 12 modified files with no commit and no tag;
  restored, then a clean rerun after the variant.

### 2026-10-08/09 — The long night: 8 components, the dialog trio repaired, the DS shippable, the Slider

**A single 6h51 span** (19:29 → 02:21, across midnight), 474 logged actions, **28 commits pushed**, the repository
green at each step (690 reference / 227 variants / 19 shared tests at the end). Most-touched files: the stories and
skins of the `Drawer` / `Modal` / `BottomSheet` trio — where the back-and-forth was.

- **Doc debt settled** (`199e99d`) — the `src/<Component>/` path fixed everywhere, but above all two staler
  things: `patterns-ui.md` and `new-react-component` still prescribed **Tailwind `ui:`** and the **`const X: FC`**
  pattern. Template rewritten on the resolver, order **skin → resolver → component**, `ui:` requalified as legacy.
- **`ArrowUpDown`** (`742887e`) — the working tree was **broken** (lint red): a Record map added but never wired +
  an IIFE still active. Settled. Then `7616184`: map shared with `SortableHeaderCellView`, `toSortableNumber`
  extracted (a duplicated block, `NaN` → 0, a comparator that **never** returned 0 ⇒ an unstable sort), and
  `9fecadd` on `ListboxItem`. **S3358: 7 → 2.**
- **SonarCloud: 4 months of phantom data.** Two of my intermediate conclusions were **wrong** (« the CI never
  publishes », « the quality gate is decorative ») — the CI did publish. Real cause: **main branch `master`**
  (absent from the repository) while the CI analysed `main`, recorded as a **SHORT** branch that the **free plan
  forbids reading**. Fixed: project made **public**, `master` renamed `main`. A dead CI secret (403) replaced by
  the dev.
- **8 components** — Menu, Modal, Typeahead (**Sonar Critical settled**, complexity 19/15 → a handler table),
  Image, Drawer, **Alert** (new), Tabs, then **BottomSheet** + **Drawer** rewritten. Found on the way: focus-visible
  missing from the Listbox, a scroll lock that **overwrote** the host's overflow, a physical `left-0` breaking the
  Typeahead's RTL, a `jsx-no-leaked-render` leak in Image, a **selector `[.media-section:nth-of-type(even)]`
  coupled to the TMDB app** in Tabs, and the **dark-on-dark contrast** of the active pill (`bg-primary` turned near
  black without the text changing).
- **Drawer ≠ BottomSheet.** The old « Drawer » was a bottom sheet (its own JSDoc said so). Renamed (`3589b24`), then
  a **real Drawer** written on a native `<dialog>` (`eb36157`): focus trap, inertness, Escape and top layer for
  free, three **logical** edges, `bottom` deliberately absent.
- **A bug proven by a test before the fix** (`30d557d`) — `ComponentProps<'dialog'>` carries `ref` in React 19, so a
  consumer's ref landed in the rest spread and **replaced** the internal ref: `showModal()` never called,
  **silently**, on Modal **and** Drawer. Fixed by `useNativeDialog`, the single owner of the lifecycle (the
  duplication the review had pointed at).
- **The `display` trap on `<dialog>`, met TWICE** (`77122a4`, `7d74755`) — `.ui-drawer` set `display: flex`,
  overriding the UA rule `dialog:not([open]) { display: none }`: every drawer visible all the time, hence « all
  open at start », the stacking and the « inactive » close button. Same trap later through the Modal's **story**
  (`style={{display:'grid'}}`). Layout moved onto `[open]`, the skin centres by itself. Also: a `<dialog>`'s
  backdrop **reports itself as the click target** ⇒ `backdropArea: 'self' | 'outside'`.
- **Stories clean-up pass** (`30e7d59`) — three **skin** defects, not story ones: drawer/bottom-sheet/modal with no
  `font-family` (hence the Times New Roman), bodies with no `gap`, and `.ui-card__footer` **with no
  `justify-content`** (accidental start alignment) → an `align` axis, **`center` by default** (the dev's choice; the
  majority convention would be `end`). The Storybook canvas given a base font, a host app's role.
- **DS shippable** (`01be734`) — four public 0.1.0 packages, **zero Tailwind**, tarballs ready. Five blockers lifted,
  including **the 27 READMEs that did not ship**.
- **`Slider`** (`dfe58e5`) — a primitive the DS lacked, the color picker's prerequisite. A transparent `<input
type="range">` over painted divs (the platform's keyboard and semantics), **20 custom properties**, and
  `--ui-slider-track-image` as the seam: a hue slider **is** this component.
- **Color picker framing** done and recorded (HSVA source of truth, Tier-4 machine, no colour dependency, a11y of the
  2D area). **Correction**: the tokens are **not** in OKLCH unlike `CLAUDE.md` — they are hexadecimal.

### 2026-10-08 — Resumption: briefing, doc debt settled, ArrowUpDown, SonarCloud repaired

- **Resumed after ~12 weeks** (last code commit `672acdc`, 2026-07-16). Resumption briefing delivered as `next.md`'s
  instruction demanded (where we stood, the origin of `WithTooltip`, the origin of the `ArrowUpDown` diff),
  **before** any action.
- **`199e99d` `docs(repo)`** — the doc debt of commit `672acdc` settled across **7 files**. The `src/<Component>/`
  path → `src/components/<Component>/` everywhere (rules, agents, skills). But the clean-up revealed **two staler
  things than the path**: `patterns-ui.md` and `new-react-component` still prescribed **Tailwind `ui:`** (while a new
  component is built on the BEM skin + resolver) and the **`const X: FC`** pattern (while the house style is `export
function`). Fixed: template based on the resolver, order **skin → resolver → component**, mandatory README, 5-level
  tests, `ui:` requalified as **legacy** (only in Tabs/Drawer/Carousel/Typeahead/`next/Image`), `Edit` added to the
  scaffolder's `allowed-tools` (step 8 edits the root barrel).
- **`742887e` `refactor(reference)`** — `ArrowUpDown`. The working tree was in a **broken intermediate state** (lint
  RED): the `SORT_DIRECTION_SUFFIX` Record map had been added but **never wired**, and the IIFE still computed the
  label. Record map wired, IIFE removed (9 lines → 1). `/review` with 6 agents: platform-safety / security /
  quality / architecture **empty**; **REACT-004** (an ad hoc interface instead of `ComponentProps<'button'>`, no
  `...rest`) fixed but its **severity lowered high → medium** (no bug, single caller served); **A11Y-005** (dimmed
  chevron ~2.05:1 vs WCAG 1.4.11) **rejected on substance and recorded** — redundant information (active chevron
  ~5.3:1 + `aria-label`), the `Rating` precedent.
- **SonarCloud: 4 months of phantom data, diagnosed and repaired.** A chain of errors lifted one by one — and **two
  of my intermediate conclusions were wrong** (« the CI never publishes », « the quality gate is decorative »): the
  CI did publish. Real cause: **main branch `master`** (absent from the repository) while the CI analysed `main`,
  recorded as a **SHORT** branch the **free plan forbids reading**. Hence a green CI, Compute Engine tasks in
  `SUCCESS`, and an API returning a snapshot of 07/06. Fixes: project made **public**, SHORT branch `main` deleted,
  `master` **renamed `main`** (`isMain: true`, LONG). On the way, the CI secret really was dead (**403 Forbidden**
  on the JRE metadata) — replaced by the dev. Gotchas recorded in `known-issues.md` (the `master`/`main` trap + user
  token vs analysis token).
- **First up-to-date analysis since June** (revision `742887e`): **11,701 ncloc** (vs 6,415), coverage **68.1 %**,
  **102 issues** (0 blocker, **1 critical** = `TypeaheadInput.tsx:65`, cognitive complexity 19/15), 39 of the 102 on
  the `publish*.sh` **shell scripts**. Quality gate still `NONE` (main branch recreated, no new-code baseline) — to
  check again at the next run.
- **Question of origin settled (corroborated, not proven)**: `ArrowUpDown` no longer reports anything (the analysed
  revision holds the fix), but **S3358 is active with 7 occurrences**, including `SortableHeaderCellView.tsx:50` —
  **the direct caller** — and `DataTable/sorting/index.ts:20,26`. The SonarLint/Sonar hypothesis holds; the Record map
  was the right answer.
- **Not committed, on purpose**: `WithTooltip` (a pending stub), `next.md`, `completed.md`, `known-issues.md`, the
  `/timeline` skill and the start/end-session skills.

### 2026-09-16 — Resumption after 2 months: framing ProgressBar, recording the paused chantiers

- **Framing session — NO code produced, NO commit.** Resumed after ~2 months (last code session: 2026-07-16). Only
  `.claude/next.md` was rewritten.
- **Reorientation**: the announced task (« Tooltip on truncated text ») is **postponed**; the dev prioritises the
  port of **`ProgressBar`** — a component rich in options, a good **white-label** candidate, meant to be **reused in
  another project**.
- **ProgressBar source identified and validated**: sibling repository
  `react-and-react-native-financial-app/packages/ui/src/components/atoms/ProgressBar/` (RN+Web → web-only), same
  origin as Checkbox/Tooltip/Pagination/Dropdown. Target `packages/reference/src/components/ProgressBar/` (an empty
  folder).
- **6 framing decisions locked**: v1 scope = **determinate only** (buffer + indeterminate = v2); **`color: string`
  rejected** (an untyped token interpolation → a closed `variant` axis + `--ui-progress-bar-indicator-color`);
  **`size: thick|thin` rejected** → `sm|md|lg`; **`metaLeft`/`metaRight` kept** (the dev's choice against my
  recommendation to move them out into composition; renaming to `metaStart`/`metaEnd` an open question); **2 a11y
  holes of the source to fix** (`role="progressbar"` with no accessible name, no `aria-valuetext`); **fill in
  `inline-size`**, the skin owning the direction (RTL trap, the Rating precedent).
- **Paused chantiers, recorded « EN SUSPENS »** in `next.md` (not committed, intact): `WithTooltip` (an empty stub,
  never committed) and the `ArrowUpDown` diff (nested ternary → IIFE). Archaeology done on the latter: the ternary
  came from the a11y pass `0038c77`, the diff is **purely cosmetic — identical label, zero functional impact**; the
  _why_ of the diff is **lost** (no `no-nested-ternary` ESLint rule, nothing in the docs) → a `/sonar` lead (S3358),
  and if confirmed the house precedent is the **Record map** (Avatar `STATUS_TO_CANDIDATE`), not the IIFE.
- **Briefing instruction** written at the top of `next.md`: the next session must **start by re-explaining to the
  dev** where we stand and which initiative `WithTooltip` and `ArrowUpDown` belonged to, before any action.
- **Doc debt found**: `672acdc` moved the components under `src/components/**` but `patterns-ui.md` /
  `architecture.md` still document the old path (affects `/new-react-component`).
- **Memory added**: `document-why-of-uncommitted-work` (sessions months apart → record the _why_ of every file left
  uncommitted).
- **Time-stamping hooks (a sense of time)** — a new script `~/.claude/hooks/session-log.sh`
  (`start|end|edit|bash`, reads `cwd` from the hook's stdin, writes `files/session-log.jsonl`, **git-ignored**, each
  line carrying `epoch` to avoid any BSD date reparsing). Wired in `.claude/settings.local.json`: **`SessionStart`**
  (a separate, synchronous entry) injects a `hookSpecificOutput.additionalContext` — « now: <ISO>, last activity:
  <date>, N days ago » — so the agent perceives the gap **before** speaking; **`SessionEnd`** (async);
  **`PostToolUse`** `Edit|Write` and `Bash` (async) log what is done. **Challenge held**: the dev asked to « date
  every action » — narrowed to Edit/Write/Bash (reads would cost one shell process per call for zero value: a log
  never enters the context, only its aggregate at start does; and git already time-stamps committed changes — the
  real hole is the sessions with no commit). API checked against the official docs (`SessionStart` does support
  `additionalContext`, `cwd` is provided as input). Pre-existing hooks **intact**: a separate entry rather than a
  merge, so `/start-session`'s injection survives even if two JSON outputs did not merge. Tested: 4 modes, a corrupt
  log, an empty payload → always `exit 0`; the real case « 62 days ago » validated; hook confirmed **live** in
  session.
- **Time model v2 — spans & chantiers (the real fix).** The dev clarified the intent: measure **working time**,
  including a session **spread over several days**. Defect found in v1: `dur_min` measured the process (a terminal
  left open overnight → « 14 h » for 40 real minutes; three `/clear` → three sessions for one day). **The session
  markers are now logged but measure nothing**: **spans** (actions less than `SPAN_GAP` 90 min apart) and
  **chantiers** (spans less than `STREAK_GAP` 48 h apart, so multi-day) are **derived from the actions' timestamps**
  (sessionisation in `jq`, unreadable lines skipped through `fromjson?`). The `SessionStart` injection now
  distinguishes two regimes: _« Chantier IN PROGRESS since 15/09, 3 spans, 2h25 in total — pick up the thread »_ vs
  _« RESUMPTION AFTER A LONG INTERRUPTION — first remind him where we stood »_. A new `report [days]` mode (a
  readable report: chantier state, detailed spans, most-touched files). Scenarios replayed and validated:
  multi-day, terminal open overnight, resumption at 61 days, corrupt log, empty log.
- **`/start-session` (v1.1) and `/end-session` (v1.1) wired to the log** (`allowed-tools` + Bash): start places
  itself in time **before everything else** and adapts its opening (continuation vs resumption briefing); end must
  write the **real durations** in `completed.md` instead of estimating them, and date a multi-day chantier as such.
- **New `/timeline` skill** (through `/create-skill`): queries the log — time per file or component, activity per
  day, last touch, crossed with `git log` for the history before the hooks. Added to `decision-tree.md`'s table.
  Gotchas documented (log git-ignored and local, reads not logged → « no change » ≠ « nothing done »). On the way:
  the `create-skill` template carried `author: financial-app`, a vestige of the sibling repository — fixed to
  `fubaritico-ds` for this skill (the template itself still to fix).
- **Feature ported to `europe-map`** (`~/Desktop/WebstormProjects/europe-map`) at the dev's request. The script being
  **global** (`~/.claude/hooks/`), nothing to duplicate: only the hooks wiring (`settings.local.json`, git-ignored, 9
  pre-existing hooks intact) and the 3 skills were ported — **by copy**, with a `diff`, to guarantee the exact parity
  asked for. `/timeline` added to its `decision-tree.md`, entry recorded in its `completed.md`. Tested in its cwd
  (correct report, relativised paths, git-ignored log), then the test log deleted. **Difference to know: there
  `.claude/` is tracked by git** → 4 files show as modified/untracked, not committed.

### 2026-07-16 — DataTable polish + Badge canTruncate + Listbox migration + grey tokens + Astryx study

- **7 commits pushed** (`e533e11`..`7426df1`, `origin/main`), the repository GREEN at each step.
- **`e533e11`** `fix(reference)` — paginated scroll: `overflow: auto` on `.ui-data-table__scroll` (the body scrolls,
  a sticky top-only header following the columns); decision **footer = chrome sibling, NOT `<tfoot>`** (reserved for
  summary rows); stories `PaginatedSticky`/`FewRows`/`Empty`, the `virtualized` control removed.
- **`d80302c`** `feat(reference)` — **Badge `canTruncate`** (opt-in, wraps the label in `.ui-badge__label`, the icon
  visible) consumed by `BadgeStatusCell`; `outline` border `--color-input` → `--color-input-border` (WCAG 1.4.11).
- **`0f4006d`** `fix(reference)` — **quick filter repaired**: `getFilteredRowModel()` was missing from
  `useReactTable` (required for any client filtering); + a regression test `DataTableExample.test.tsx`.
- **`fecac53`** `feat(tokens)` — **20-step grey scale** (150/250/350/550/650/750/850 added) + **dash-ify** of the
  dotted CSS names (`--spacing-0-5` natively, dots kept for Tailwind) + an anti-collision guard at build; badge.css
  literals replaced by the vars.
- **`4302490`** `feat(reference)` — **Listbox migration** onto the BEM skin (skin + resolver + 2 components + 5-level
  tests + story + README + barrels + Menu/Typeahead tests rewired). **Role** vars wired **straight onto the neutral
  scale** (zero shadcn alias), emphasis ladder selected<hover<active, 2px gap, 250ms transition + reduced-motion,
  `aria-selected` on `role=option`. **Repairs the Dropdown's popup** from the screenshot (Menu composes Listbox).
  `/review` with 7 agents: critical/high fixed (aria-selected, root barrel, disabled guards, tokens), the rest
  rejected/deferred (flat selectors, existing API).
- **`439e2c6`** `style(reference)` — `Number.parseInt` (number filter).
- **`7426df1`** `docs(reference)` — **DataTable README (draft)** pushed.
- **NOT committed** (bookkeeping/git-ignored): memory defrag (3 notes: `datatable-behavior-decisions`,
  `token-neutral-scale-role-vars`, `storybook-url-args-override` + updates); **Astryx study** (`facebook/astryx`
  through opensrc) → note `astryx-agent-ready-study` + **plans `files/plans/agent-ready/`** (00-master + 5 plans:
  doc-as-data P1 → vibe-tests P5). The Storybook URL-args gotcha diagnosed.

### 2026-07-10 — DataTable: full BEM skin (cells+features), a11y, Readonly, `ui-data-table` refactor

- **8 commits pushed** (`bd33847`..`5ad66f5`, `origin/main`), the repository GREEN at each step (type-check + lint,
  **542** reference / **177** variants tests).
- **Cells de-Tailwind** (`bd33847`): 8 cells/views → `.ui-data-table__*` (skin + resolver). 2 header looks
  (strong/label), a neutral underlined link, a real separator, `DurationCell` flattened.
- **Header contrast token** (`2df4c3b`): `color.semantic.table-header.{background,foreground}` (fg neutral.600, ~7.2:1
  AA) + alias; header darkened. Tokens architecture decoded (primitive → semantic per role → shadcn aliases
  `muted`/`accent`/`popover` = duplicates of the roles).
- **Cells a11y** (`0038c77`): redundant `tabIndex`/`aria-label` removed from `<td>/<th>`, icon status through a hidden
  `<span>`, `aria-sort` + a dynamic ArrowUpDown `aria-label`, accessible names.
- **Quality/security** (`1ef69a7`): `formatDuration` → `utils/` + a 5-level test, 4 views in `export function`, a
  `javascript:` guard on `TruncableLinkCell` + a blind cast removed.
- **Features de-Tailwind** (`60efb6c`): ActionBar/NoResults/TruncatedContent/TableFooterContent → chrome classes. The
  DS `Input` for go-to-page (a grouped « Page N of N » label, implicit association, no more `id` → A11Y rule
  duplicated id + describedby). `role="status"`, `:where()` last-row, a sticky-header constant.
- **Readonly** (`6f62015`): `Readonly<Props>` on the 32 DataTable component signatures.
- **Skin polish + `DateCell` truncate** (`ae91759`): `border-collapse:collapse` (the UA default `separate` = gaps);
  a square checkbox column (width = `--ui-data-table-cell-height`), centred, no padding + the
  `:has(input[type=checkbox])` selector (the native checkbox has no `role` attribute); white headers + a 60px row; a
  **header/body rule as a `box-shadow` on the cells** (sticky thead + collapse = `<tr>`/cell borders not painted); a
  dedicated `.ui-data-table__header-row` (`header` prop on `TableRow`); toolbar/footer rules; a `truncate` prop on
  `DateCell` (through `TruncatedContent`).
- **`ui-table` → `ui-data-table` refactor** (`5ad66f5`): the whole namespace renamed (`ui-data-table*` /
  `--ui-data-table-*` / `UI_DATA_TABLE_*`); **block `.ui-data-table` moved onto the container Card** (carries the vars
  → the toolbar/footer OUTSIDE the `<table>` finally inherit → rules/search width/sticky z-index work, no longer
  greyed); the `<table>` = element **`.ui-data-table__table`**. Card inner padding (`--ui-data-table-padding`),
  ActionBar without side padding, the sort toggle takes the auto margin, story background `--color-background-muted`
  - 24px.

### 2026-07-02 — DataTable: internal tree restructured (primitives/features/cells/hooks/utils) + barrels

- **3 commits** (`4fbc266`, `fe192d4`, `571c860`). A **purely structural** refactor, the repository GREEN (type-check
  - lint + **532 tests**), web-only, **no** skin/logic change (`tw-` kept).
- **`4fbc266`** — `ui/table.tsx` (a shadcn monolith) split into **9 semantic primitives** (one folder each),
  modernised **React 19**: ref-as-prop through `ComponentProps`, `forwardRef`/`displayName`/`import * as React` and
  the house helper `elementProps` removed (replaced by destructuring), JSDoc added. The old `TableFooter`
  (pagination) → **`TableFooterContent`** (frees the name `TableFooter` for the `<tfoot>` primitive). `/review` (5
  agents): **3 fixed** (house style `export function` + a double-default barrel + a missing JSDoc header on
  `DataTable`), **1 false positive rejected** (the barrel does export Table\*), **the rest deferred** (verbatim
  carried over, or planned steps: skin/a11y/perf).
- **`fe192d4`** — `components/` grouped into **`primitives/`** (9 wrappers, INTERNAL) · **`features/`** (ActionBar,
  ArrowUpDown, DropdownFilter, NoResults, TableFooterContent, TruncatedContent, INTERNAL) · **`cells/`** (15 cell
  renderers, one folder each + `views/`). The 2 hooks (`useVirtualizedTable`, `useIsTextTruncated`) moved under
  **`hooks/`** + a barrel. Barrels per group; `components/index.ts` = `export * from './features' + './primitives'`.
  **Cells re-exported from the root barrel** `DataTable/index.ts` (they are the bricks called in the configurations —
  `useColumnsDefinition` repointed to `../DataTable`); **primitives/features stay internal** (challenge held:
  scaffolding, none called in a configuration; `DropdownFilter` is dead). **7 empty orphan folders deleted**
  (vestiges of the source project, invoice domain: ActionCell/AmountCell/AvatarNameCell/BillTitleCell/
  CategoryIconCell/StatusCell/SortableHeader).
- **`571c860`** — **`DataTable/utils/`** created: `cn` (`git mv` from `ui/utils.ts`, JSDoc fixed) +
  `normalizeTimestamp` (+ test) + a barrel. **`ui/` deleted** (the `table.tsx` placeholder included). Repoints the 9
  primitives (`cn`) + DateCell/DataTableExample (`toEpochMs`). Closes the review debt **ARCH-001** (reach-up `cn`) and
  the `ui/table.tsx` placeholder.
- **NOT committed**: only the `.claude/` docs (this end-session included).

### 2026-06-19 — DataTable 150k benchmark + perf root-cause + multi-framework roadmap

- **Benchmark story (DataTable migration step 1) delivered — COMMITTED** (`f0ca817` recâblage +
  benchmark 150k, `21a0087` extraction du hook `useVirtualizedTable`). Transformed
  `DataTableExample` with opt-in props `virtualized`/`height`/`enableRowSelection`/
  `useTransitionForSelection`/`debugTimings` (paginated mode untouched; virtualized drops the pagination
  row model → all rows virtualized; `getRowId`; external `rowSelection` state, optional `startTransition`;
  `debugTimings` logs click→paint via double-rAF). `useColumnsDefinition(locale, { withSelection })`
  prepends a checkbox column (reuses CheckboxHeaderCell/CheckboxCell). `makeJobs` + types exported from
  `DataTableExample/index.ts`. Story `apps/storybook-react/stories/reference/DataTable.stories.tsx` =
  `Benchmark150k` + `Benchmark150kTransition` + a threshold-filtered `<Profiler>` decorator.
  `useColumnsDefinition.test.tsx` (5 tests). Repo GREEN (type-check + lint + **524 tests**).
- **Benchmark measured (dev AND prod build).** Steady-state select-all 150k: **OFF ≈ 207 ms total ≈
  block (prod)**; ON (transition) block < 50 ms but total ≈ 300–412 ms. Findings: doesn't crawl (archi
  validated); cost is **TanStack O(N) selection bookkeeping** (building the 150k-key `rowSelection` +
  `getIsAllPageRowsSelected` scanning 150k), **NOT paint** → **prod ≈ dev** (my "dev mode inflates ×2-4"
  prediction was WRONG — the cost is plain-JS data-structure work, not React render). `startTransition`
  = band-aid (lowers block, RAISES perceived total) → **don't default it** (user's "more lag with
  transition" feeling confirmed; I retracted a wrong earlier read contaminated by mount noise).
- **Parenthesis — Odaseva `ScopeObjectBuilder` latency root-cause.** The observable-localStorage hook
  makes the provider write→`dispatchEvent`→`setStorageValue`→re-run the INIT effect (quadratic
  `data.find` re-derive), plus synchronous `JSON.stringify` of full objects per toggle + a
  non-virtualized right table. Answer to "I setState before localStorage so where's the latency?":
  setState is async/batched; the sync localStorage write runs first in the same tick; the browser paints
  only after the whole sync task → source order is irrelevant. Design fix written **commented
  line-by-line** in `files/analysis/storage-port-design.md`: `StoragePort` (seam) + `LocalStorageSink`
  (sink, debounced + idle, ids-only) + `ObservableLocalStorageStore` (in-memory listeners same-tab,
  native `storage` cross-tab) + `InMemoryStoragePort` (mock) + writer/reader/shared hooks + refactored
  Provider (O(1) `Map` index) + glossary seam/sink + §10 same-screen. Note:
  `scope-object-builder-latency-analysis-odaseva`.
- **Strategic decisions** (note `data-table-industrial-multi-framework-goal-external-selection-store-decision`):
  white-label multi-framework **industrial** DS (AG-Grid parity); foundation `@tanstack/table-core` (no
  headless rewrite); **delegate heavy ops ONLY when necessary** (150k/~2M fine; Web Workers for millions
  à la Handsontable); master table-core first; everything agnostic/pluggable/pure-TS (TS is the real support).
- **Roadmap created**: `files/plans/roadmap.md` — phases **A** DataTable skin → **B** finish reference DS
  → **C** max DataTable features (≈AG Grid) → **D** Stencil generation (WC/Angular/Vue/React, no
  DataTable) → **E** DataTable on table-core (agnostic) → **F** DataTable in Stencil (multi-framework).
  Plans C/E/F = to write. CLAUDE.md `### Next` moved to a dedicated `@next.md` (200-line budget).

### 2026-06-18 — DataTable (Phase-2) rewired web-only + 4 primitives + 3 helpers

- **AG Grid studied** (`opensrc/`): why select/deselect at 100k doesn't crawl = external selection
  store (`Map` by id, flag on plain object) + **local event per node** (only mounted rows react) +
  virtualisation + batched events. Lesson logged for our DataTable (don't put selection in a React
  Context that re-renders the list). Memory pointers in `data-table-review-backlog-deferred-findings`.
- **4 NEW primitives migrated** (BEM skin + CVA resolver in `variants` + 5-level tests + story + README,
  all from a brought-in RN+Web project, now web-only): **Checkbox** (native input + `:has` state,
  `onChange` event → wires to TanStack `getToggleSelectedHandler`), **Tooltip** (controlled portalled
  bubble + `tooltipPosition` math), **Pagination** (matches the DataTable footer API exactly),
  **Dropdown** (composes Button + Menu; mobile bottom-sheet branch dropped). `/review` ran (7 agents);
  high/critical fixed, false-positives rejected.
- **3 helpers adapted** (+ tests): `useIsTextTruncated` (ResizeObserver), `ConditionalWrapper`,
  `ArrowUpDown` (our Icon + new `ui-sort-arrows` skin + `sortArrowVariants`).
- **`moment` eliminated** → `toEpochMs` normaliser (10-digit s→×1000, 13-digit ms; tested) + `Intl`
  dates. **`jobFactory`** (deterministic `makeJobs(n)`, 100k-ready) + **`JobRowSkeleton`** (DS Skeleton).
- **DataTable fully recâbled**: every cell/view/component → DS primitives (Badge/Checkbox/Icon/Button/
  Dropdown/Pagination); deps `@tanstack/react-table` + `@tanstack/react-virtual` + `html-entities` (via
  catalog), `tailwind-merge` dropped (`cn`→clsx), `table-core`→`react-table`; foreign jest tests +
  stories deleted; `DataTable` exported from the barrel. **Repo green** (type-check + lint + 519 tests).
- **2nd `/review`** (DataTable, 7 agents, ~100 findings) → fixed the critical/perf cluster (filters
  `any`→`unknown`; memoized columns; `useReactTable(config)`; hoisted Intl formatter; ResizeObserver;
  reused `virtualItems`; refs out of deps; `--pseudo-height` scoped to the element, not `<html>`).
  Rejected `SortableHeaderCell` `Column<any>` (TanStack invariance). **Everything else deferred &
  tracked**: plan `files/plans/datatable-migration.md` + Basic Memory note
  `data-table-review-backlog-deferred-findings` + the `### Next` block.
- **COMMITTED** since (`f0ca817` + `21a0087`) — resume from the plan/note/Next.

### 2026-06-17 — Rating migrated (grayscale, display-only Molecule)

- **Rating migrated** (`f3c572b`) onto the native skin. **Display-only** (no interaction/keyboard —
  a settable rating would be a separate interactive control; dev's Phase-2 shape = half-step clickable
  stars + callbacks, nothing more). Two looks: `circle` (SVG progress ring, the BASE — resolver emits
  '') + `stars` (5-star row, `--ui-rating-fill` clip). BEM `rating.css` (`.ui-rating` + `__circle/__svg/
__track/__indicator/__stars*/__value`); `ratingVariants` thin resolver (variant + size only) + element
  class constants; SVG geometry (svg px/stroke/dash) + star icon px stay INLINE (Skeleton precedent —
  skin owns look, not geometry). 5-level component + resolver tests, `Reference/Rating` story, README.
- **GRAYSCALE by design** (dev decision): repointed `color.semantic.rating.filled` amber.400 →
  **neutral.900**; empty stays neutral.300. **Traffic-light REMOVED** (no green/amber/red threshold, no
  `getColorClass`, no `warning` token) — score read from fill proportion + the number (never colour →
  1.4.1). Brand re-skin is opt-in via `--ui-rating-indicator-color`.
- **API**: `trackClassName` dropped → override via `--ui-rating-track-color`; prop `size` axis sm/md/lg;
  `RatingProps extends Omit<ComponentProps<'div'>, 'role'>` (role locked). a11y: `role="img"` + computed
  `aria-label` ("Rating: X out of Y", English default, overridable; announced when `showValue=false`),
  SVG/stars `aria-hidden`. **RTL-safe**: stars pass only `--ui-rating-fill` (%); skin owns clip direction
  (`:dir(rtl)` flips it) — the old inline physical `clip-path` broke RTL.
- **/review** (7 agents) → **9 fixed, 8 rejected**. Fixed: font-weight/line-height via override var
  (STYLE-008 ×2), aria-label aligned to visible value (1.3.1), RTL clip (PLAT-002), `clsx`-on-statics →
  template literal (QUAL-011), `export function` house style (PLAT-001 ×3), resolver test gaps (PLAT-004),
  String()/magic-100 cleanup (QUAL-013), README English-default warning. Rejected (documented): ARCH-002
  high (empty=neutral.300 vs 1.4.11 — display-only, score redundant via 17:1 fill + number, dev's explicit
  choice; a11y agent concurred no violation); import-order ×5 (lint green, agents contradicted); QUAL-008
  L3 bare comment (matches `input.test.ts`); ARCH-004 `internal/` dir (diverges from Avatar/Button); A11Y-007
  wrapper aria-hidden (icons already hidden); ARCH-005/ARCH-002-low/REACT-008 (house style / Input precedent /
  presentational atom). known-issues.md documents the Rating gotchas. Plan: `files/plans/rating-migration.md`.

### 2026-06-14 — Input migrated (first Molecule) + AA hardening + generic field block

- **Input migrated** (`587712b`) onto the native skin — first Molecule. Three decoupled BEM blocks:
  `.ui-input` (control, self-sufficient like `.ui-button`) + `.ui-input-affix` (trailing-icon wrapper)
  in `input.css`; the **field layer extracted to a GENERIC reusable `field.css`** (`.ui-field` /
  `__label` / `__message` + `--error`, imported before input.css) so Select/Textarea/Checkbox can reuse
  it without the Input control skin. Resolvers `inputVariants` (size/invalid/hasIcon) + `inputAffixVariants`
  - `inputFieldVariants` + 4 static class constants; `md` = base (no modifier). 5-level component +
    resolver tests, `Reference/Input` story, co-located README.
- **API**: prop `inputSize` → **`size`** with `Omit<ComponentProps<'input'>, 'size'>` (DS-consistent with
  every other component; sheds the native `size` char-width attr). `const Input: FC` → `export function
Input` (house style — all migrated components use it).
- **a11y fixes** (from /review): error message text → `--color-destructive-hover` (red.600 #dc2626,
  ~5.9:1; red.500 was 3.73:1, failed AA text) + prefixed with an `ExclamationCircle` icon so the error
  isn't colour-only (WCAG 1.4.1). Minted primitive **`neutral.450` (#949494)** + alias
  `--color-input-border` so the input border clears WCAG 1.4.11 (~3:1); **scoped to input** (the shared
  `--color-input` neutral.300 left untouched → Button's outline keeps the same latent gap, noted below).
- **/review** (7 agents) → 6 findings fixed + 1 design decision applied (border token, dev chose
  "mint minimal-passing token, scoped"); 3 re-reviews clean. Rejected false positives: import-order
  (lint green), `:focus-visible` (conformant 2.4.7). known-issues.md updated with the Input gotchas.
- **DEFERRED a11y debt**: Button `outline` borrows `--color-input` (#d4d4d4, ~1.48:1) — same WCAG 1.4.11
  failure as the input border had; fix when revisiting Button.

### 2026-06-12 — Card (slotted compound) + Typography body1/body2 + radius cap 6px

- **Card migrated** (`2d30644`) as a presentational SURFACE + slotted compound. Root `.ui-card` owns
  chrome only (bg / 1px border / light shadow / 6px radius / flex column / `overflow:hidden` to clip
  edge-to-edge media); padding lives on the slots `Card.Header/Body/Footer`. A minimal MARKER context
  makes the slots **throw outside `<Card>`** (Avatar-style guarded hook, NO shared state). Axes separated;
  **no dividers** between regions (removed on dev request — grouped by spacing only). Variants = surface
  only (`default` sm-shadow, `outline` border, `elevated` md-shadow, `ghost` none). `.ui-card` sets
  `--ui-card-font-family` (Inter) so raw text isn't browser-serif. Open/Closed: media/clickable cards
  COMPOSE the surface, no new props. `cardVariants` + slot class constants in `variants`; 5-level tests;
  co-located README; `Reference/Card` story composing Typography + Button. Memory: `card-slotted-compound`.
- **Typography body→body1/body2** (`ffb6a0b`): MUI parity — `body` renamed to `body1` (16px, default) +
  new `body2` (14px, compact). Propagated tokens→styles→variants→reference(+types/tests/README)→story.
  Card body text uses `body2` (so a `h6` title doesn't read smaller than the body). **Breaking**:
  `variant="body"` no longer exists.
- **Radius scale capped at 6px** (`a902e20`): `sm` stays 4px; `default/md/lg/xl/2xl/3xl` flattened to 6px
  (dev: nothing rounder than 6px reads right). Re-skins Card + Skeleton corners (both on lg) to 6px via the
  token layer, no component code change. Memory: `ds-lightness-radius-shadow`.
- **/review** ran per change: Card → 3 fixes (slot border-width vars — later removed with the dividers;
  story `alt=""`; `useCardContext`→`void`), 3 rejected (CardVariantProps parity, one-file slots, REACT
  map false positive). Typo/tokens → ready, 1 rejected (import-order false positive — lint green, Badge
  pattern). All pushed `adb6f79..2d30644`.

### 2026-06-12 — DS primary → neutral + IconButton (Open/Closed extension of Button)

- **Primary neutral strategy** (`4cebb80`): `color.semantic.primary.default` `blue.600` → `neutral.900`
  (#171717), hover → `neutral.800`; foreground (white) + destructive untouched. Re-skins Button + Badge
  primary. **DS strategy locked**: the default is **neutral**, brand colour is **opt-in emphasis**
  (shadcn/Radix); the blue was only a white-label proof. Memory: `neutral-default-emphasis-strategy`.
- **IconButton migrated** (`10de488`) as an **Open/Closed (the "O" of SOLID) extension of Button**:
  renders `<Button>` + a `.ui-icon-button` shape layer (square/circular, zero padding) — Button.tsx /
  button.css / `buttonVariants` **untouched**. `iconButtonVariants` (in `variants`) emits only the shape
  classes; colours reuse `buttonVariants`, icon px reuses Button's `iconSizeMap`. `ghost-dark` is
  IconButton-only (redefines the reused `--ui-button-*` vars, mapped to primitive neutrals with a
  `TODO(tokens)` to mint semantic on-dark tokens WITH Drawer). Flat atom, NOT a compound. 5-level
  userEvent tests, `Reference/IconButton` story, co-located README.
- **/review** (7 agents): 6 fixes applied (`--ui-icon-button-radius` var; `ButtonProps` via the `../Button`
  barrel; dedicated L4 comment; story `DARK_SURFACE_BG` const; Drawer test `React.`→named import). 3
  false-positives rejected (ghost-dark ring contrast OK on dark ~4.5:1; import-order — lint green, matches
  `Button.shared`; `sm`=32px is WCAG 2.5.5 **AAA**, project targets **AA** where 24px suffices).
- **Pre-existing a11y debt FIXED, not deferred** (`bacc280`): focus-ring `--color-ring` `neutral.400` →
  `neutral.500` (#6b6b6b, ≥3:1 on white ~5.3:1 AND on the dark ghost-dark surface ~3.4:1 — WCAG 1.4.11);
  `button.css` now suppresses its colour transition under `prefers-reduced-motion` (WCAG 2.3.3). New
  workflow rule (`80c2d78`): **fix pre-existing issues a review surfaces in touched files — no
  out-of-scope deferral**. All pushed (`d9f0cd7..80c2d78`).

### 2026-06-12 — Avatar: migrated, then rewritten as a React 19 compound

- **Tokens kebab-case** (`d6b0f3e`): `toKebabName` helper in `sd.config.js` splits camelCase humps
  only (`lineHeight`→`line-height`), preserving numeric segments (`2xl`/`3xl`/`0.5`). All `--font-*` /
  `--typography-*` vars now kebab; skin consumers (badge/typography css) updated. The TS tokens object
  stays camelCase (JS dot-access ergonomics — the rule targets CSS custom-property names).
- **Avatar flat migration** (`facecc5`): `.ui-avatar` BEM skin + `avatarVariants` resolver + flat API
  (`src/alt/initials/size`); composes `Icon` as-is. **Talent** composite removed (obsolete consumer of
  the dropped `testId`).
- **Avatar compound rewrite** (`4136a10`): full **React 19 compound** — `Avatar.{Image,Fallback,Icon,
Initials}`, resolution **resolver** (Model A: first viable wins; a pending image blocks later
  candidates = anti-flash), **split contexts** (stable config / dynamic resolver) with guarded access
  hooks, React 19 idioms (`<Context value>`, `use()`, `useEffectEvent`, `ref`-as-prop). a11y: root
  `role="img"` + required `aria-label`; image/initials/icon decorative. 5-level tests, story, README.
  Docs: **Compound Components (React 19)** section in `patterns-ui.md` + documentation rules in
  `new-react-component` (fixed the broken `component-patterns.md` ref → `patterns-ui.md`).
- **Hardening / review** (`bfe4eab`,`ba69b4d`,`0e6c7e4`,`470da87`,`096ee0f`,`8f9cee1`): candidates MUST
  live inside `Avatar.Fallback` (access hooks throw, standalone mode dropped); loading **Spinner** via
  the `Avatar.Image` render-prop (doc + Showcase, no baked-in default); `STATUS_TO_CANDIDATE` Record
  map (no nested ternary); enforced **`react/jsx-no-leaked-render`** (eslint); `modeFor`→
  `getCandidateMode`; `Cascade`→`Resolver` everywhere. Avatar is now the **reference template** for the
  heavy compounds (Listbox/Typeahead). All pushed to `origin/main` (`952b757..8f9cee1`).

### 2026-06-12 — Headless UI deep-dive + `/state-storage` skill (no component change)

- **Research turn, no code/component change.** Deep analysis of **Headless UI React v2.2.10** internals
  → personal working docs in `files/analysis/` (gitignored): `headlessui-state-machine.md` (the `Machine`
  store-reducer + selectors + effects, why state lives OUTSIDE React), `headlessui-context-vs-machine.md`
  (the re-render gain: Context = O(N) on all consumers vs Machine + per-slice = ~O(1)),
  `headlessui-combobox-vertical-slice.md` (end-to-end: `as`-render → machine → `dataRef` → keyboard →
  form → transitions), `state-externalization-3-levels-and-hooks.md` (4 storage tiers + behavior-hooks).
- **New committed skill `/state-storage`** (`8c22477`): decides the **lightest sufficient** state tier —
  **local · createStore · Zustand · simplified Machine** — challenge-by-default; `references/` carry the
  full per-tier code + the **real behavior-hooks source** (useEvent/useControllable/useOutsideClick/…).
  Wired into `decision-tree.md`. Memory: **`storage-levels-playbook`**.
- **`/review` SKILL hardened** (`6cfa3cf`, dev's own edit): findings-table columns now mandatory
  (`ID`, `Sév`, `Catégorie`, `Description`, `Statut`).
- **Key insights locked**: HeadlessUI's `Machine` is framework-agnostic _by design but NOT shared_ (Vue
  reimplements with its own reactivity) — machines are justified by **render-volume + keyboard +
  cross-instance coordination**, NOT by being unstyled. Most DS components stay **Tier-1 local**; a
  machine is only for **Listbox/Typeahead**. The `useSyncExternalStore` gotcha (derived slice → loop →
  use `…WithSelector`). Pushed `origin/main` (`aeb64b6..6cfa3cf`).

### 2026-06-10 — Skeleton migrated onto the native skin

- **Skeleton migrated** (`07cf01e`): `.ui-skeleton` BEM skin (`@layer`, `--ui-skeleton-*` override
  vars, shimmer `::before` with an overridable `--ui-skeleton-shimmer-direction`, keyframes ported from
  `packages/reference/src/styles.css`), `skeletonVariants` CVA resolver (`rectangle`/`circle`/`line`
  shapes + a `rounded` boolean → `--square` via `compoundVariants`; `rectangle` is the base).
- **Two deliberate divergences from the Badge/Spinner precedent**: (1) `width`/`height` are no longer
  Tailwind classes — they're CSS length values applied as logical inline styles (`inlineSize`/
  `blockSize`), alongside `aspectRatio`; the skin owns only the look, not dimensions. (2) Under
  `prefers-reduced-motion` the shimmer is **removed** (non-essential decorative motion — the block
  alone conveys "loading"), unlike the Spinner whose essential motion only slows.
- 5-level tests (component + resolver), co-located README, `Reference/Skeleton` story. Stale Tailwind
  snapshot dropped. `SkeletonShape` exported from both barrels (parity with `SpinnerSize`).
- **/review** ran → verdict `ready`. 8 fixes applied (order-independent `--square` selector via a
  compound `.ui-skeleton--line.ui-skeleton--square`; `--ui-skeleton-shimmer-direction` var; RTL
  `:dir(rtl)::before { animation-direction: reverse }`; `Readonly<SkeletonProps>`; `SkeletonShape`
  exports ×2; resolver no-op comments). Discarded false-positives: import-order (lint green, identical
  to Badge/Spinner), `--color-white-80` "missing" (it exists in tokens), inline-style-object
  over-memoization (presentational atom, no `memo` boundary).

### 2026-06-10 — Spinner migrated + doc-debt backfill + storybook-state fix

- **Doc debt cleared** for the already-migrated Button family: co-located `README.md` added for
  **Button** + **Badge** (`c76e217`), then **LinkButton** + **NextLinkButton** (`2c414a7`). Rule
  refined with the dev: the README is **post-migration** — written once a component is migrated, whatever
  it is. `IconButton`'s README is therefore deferred until IconButton itself is migrated (still Tailwind).
- **Spinner migrated** to the native skin (`77262f5`), **now with `sm`/`md`/`lg` sizes** (dev request,
  like Button): `.ui-spinner` BEM skin (`@layer`, `--ui-spinner-*` override vars, headless
  `currentColor` ring, logical props, `@keyframes` inside the layer, `prefers-reduced-motion` slows the
  spin), `spinnerVariants` CVA resolver (md = base), `Spinner` extends `ComponentProps<'div'>` with an
  overridable `aria-label` + `role="status"`. 5-level tests (component + resolver), co-located README,
  stale Tailwind snapshot dropped. Story added under `Reference/Spinner` (`a0a6c2b`).
- **/review** ran → verdict `ready`. 4 fixes applied (export `SpinnerSize` from the barrel +
  `Spinner/index.ts`; `--ui-spinner-radius` var for Badge parity; track derived from
  `--ui-spinner-indicator`; keyframes moved inside `@layer`). Discarded false-positives: JSDoc/`Readonly<>`
  findings that contradict the validated Badge pattern; reduced-motion "stop" (a spinner is _essential_
  motion, WCAG-exempt); border-width tokenisation (deliberate literal, Badge precedent).
- **Stale docs corrected** (`61efd07`): CLAUDE.md + `architecture.md` wrongly listed every
  `apps/storybook-*` as an empty scaffold — **`storybook-react` is set up** (Storybook 10 + React-Vite,
  stories in `apps/storybook-react/stories/reference/*.stories.tsx`, preview loads tokens + skin, run via
  `pnpm storybook:ref`). Only `angular`/`vuejs`/`web-component` remain empty scaffolds.

### 2026-06-07 — CI + git remote

- **git remote created**: `origin` = https://github.com/fubaritico/fubaritico-ds (public, org `fubaritico`), `main` pushed. Needed `gh auth refresh -s workflow` + `gh auth setup-git`.
- **CI built** (`.github/`): composite `setup` action → `ci.yml` orchestrates `validate` (lint/type-check/test) → `build` (`build:packages`, **stencil excluded** until its build is green) → `sonarqube` (self-skips without `SONAR_TOKEN`) → `quality-gate`. **Green on first run.**
- Deferred CI stubs (`e2e`, `pa11y`, `deploy-storybook`) as `workflow_dispatch`-only.
- GitHub Actions bumped to Node 24 majors (`pnpm/action-setup@v6`, `upload-artifact@v6`, `sonarqube-scan-action@v7`).
- SonarCloud project initialized (key `fubaritico-ds`, org `fubaritico`); `sonar-init` ran green; sonar now active in CI.
- `nx.json`: `lint`/`coverage` added to `targetDefaults` (`dependsOn: ['^build']`). Coverage v8 + lcov on shared/reference/stencil.

### 2026-06-09 — Button + Typography migrated; component-README doc rule

- **Button** migrated to the native skin and split into Button / LinkButton / NextLinkButton
  (commit `532cb3c`) — LinkButton keeps `react-router-dom` as a routing **adapter** (presentational
  primitive `Button` stays framework-free).
- **TMDB MovieCard composites removed** (base + `next/` + `react-router/` dirs) + dropped the
  `./react-router` package export (`5953964`) — out of migration scope, infra-named dirs.
- **Typography** migrated to the native skin: BEM `.ui-typography` skin (`@layer`, logical props),
  `typographyVariants` CVA resolver, semantic `--typography-*` token scale (fluid headings via
  `clamp`, fixed body roles), `font.letterSpacing` tokens (`e1b3ba8`). 5-level tests + story.
- **/review** ran on the migration → 1 fix applied: `ComponentProps` (ref-as-prop) instead of
  `ComponentPropsWithoutRef` (`f27d34b`). Discarded false positives (import-order — lint is green;
  STYLE-008 `--ui-*` layer — tokens already are the override surface; STYLE-011 left/right — MUI
  parity, physical on purpose).
- **`label` variant fix** (`5d3ae53`): renders a `<span>` (was an orphan `<label>`, WCAG 1.3.1); a
  real form label is an explicit opt-in via `as="label"` with **`htmlFor` required at compile time**.
- **New rule — every component ships a co-located `README.md`** usage doc (`.claude/rules/component-docs.md`):
  structured like a DS site page (identity, capabilities, import, basic/variants/edge examples, props,
  a11y, consumer-facing **Notes** for gotchas/misuse). Wired into `new-react-component` (scaffold) +
  `review` (Step 2b presence check). First applied to Typography (`c8f18e7`). CLAUDE.md workflow rule
  tightened: confirm the approach ONCE, then execute the whole block without re-asking.

### 2026-06-08/09 — White-label native-CSS pivot + Badge spike

- **New `packages/styles`** (`@fubaritico/styles`, CSS-only): portable native **BEM skin** in `@layer ui.components`, **component-scoped `--ui-*` variables** for override, PostCSS bundle (import+nested+autoprefixer+minify) → `dist/styles.css`. peerDep on tokens.
- **tokens**: primary amber → **Material UI blue** (`#1976d2`, new `blue` primitive) — white-label proof.
- **Badge migrated off Tailwind** to BEM + **CVA** (`badgeVariants`), `extends ComponentProps<'span'>`; tests rewritten in BEM (5-level); static demo harness (`packages/styles/demo/index.html`).
- **`/review` hardened**: added 7th subagent **`review-styles`** (CSS/BEM rules) + `*.css` scope; it immediately caught real CSS issues the TS-only review had missed (tokenized paddings, line-height var, md emits no class).
- Added BEM skills (`bem-structure`, ` audit-style`); cleaned `settings.local.json` (removed obsolete RN/Expo skills + context7); refined `CLAUDE.md` rules (plans in `files/plans/`, challenge-by-default, push allowed).
- All green: `type-check && lint && test && build:packages`. Plan: `files/plans/badge-spike-native-css.md`.
- **Decision locked**: `packages/reference` is a **guide/sandbox, NOT a deliverable** (may be deleted at the end). Real deliverables = framework packages consuming `@fubaritico/{tokens,styles}`.

### 2026-06-09 — CVA resolver package `@fubaritico/variants` + import group

- **New package `packages/variants`** (`@fubaritico/variants`): framework-agnostic CVA resolvers
  (pure TS, no React/DOM, dep `class-variance-authority` only) emitting the skin's BEM classes.
  Home for variant→class logic — **decided over `shared`** (React grab-bag) **and over a `styles`
  JS-entry** (keeps `styles` CSS-only), after challenging the dev twice. Rationale: variants are
  reused across React/WC/Angular/Vue and must stay React-free. tsconfig (type-check) + tsconfig.build
  (emit, excludes tests) + vitest (node) + scoped eslint override. Commit `b487b4c`.
- **Badge migrated** off `reference`-local `Badge.variants.ts` onto `@fubaritico/variants`
  (`badgeVariants` + `BADGE_ICON_CLASS`); `class-variance-authority` dropped from `reference` deps.
  13 resolver tests (5-level). `architecture.md` documents 6 packages + `variants → reference` order.
- **eslint `@fubaritico/*` import group** (commit `01e6b63`): `import/order` pathGroup
  (`group: internal`, `pathGroupsExcludedImportTypes: ['builtin','type']` keeps `import type` last);
  6 reference files auto-reordered. Makes the documented import convention actually enforced.
- **Plan**: `files/plans/native-css-migration.md`. **Memory**: `native-css-migration-backlog`.
- **Workflow locked**: migrate EXISTING reference primitives onto the Badge pattern first (web-only,
  primitives only, one commit each) → THEN copy in 9 new components one-by-one (+ `icons` package).
