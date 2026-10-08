# Next — current actionable state

> Loaded at session start (CLAUDE.md `### Next` → `@next.md`). Single source for "what's next".
> North-star program: **`files/plans/roadmap.md`** (phases A→F).

> ## ✅ CONSIGNE DE BRIEFING — HONORÉE LE 2026-10-08
>
> Le briefing de reprise demandé le 2026-09-16 a été délivré (écart réel : ~12 semaines depuis le
> dernier commit de code `672acdc`, 2026-07-16). Garder le réflexe pour toute reprise espacée : se
> situer dans le temps d'abord (hook `SessionStart` + `~/.claude/hooks/session-log.sh report`), puis
> briefer avant de coder. Voir [[document-why-of-uncommitted-work]].
>
> **Soldé dans la foulée** : la dette doc (commit `199e99d`) et `ArrowUpDown` (commit `742887e`).
> **Reste ouvert** : le stub `WithTooltip` (voir EN SUSPENS) et `/sonar`, **bloqué faute de
> `SONAR_TOKEN`** — aucun fichier `.env` n'existe à la racine ; le dev doit en générer un sur
> SonarCloud (Account → Security) et l'y ajouter. Donc l'hypothèse **S3358** sur l'origine du ternaire
> imbriqué reste **non confirmée** (sans conséquence : le ternaire a disparu).

> **▶ PROCHAINE SESSION — PORTER LE COMPOSANT `ProgressBar`** (cadrage validé le 2026-09-16, rien de
> codé encore). Priorisée par le dev : composant **riche en options**, bon candidat **marque blanche**,
> destiné à être **réutilisé dans un autre projet** — c'est la raison de le faire maintenant.
>
> **Source à porter** (validée) : repo sibling
> `react-and-react-native-financial-app/packages/ui/src/components/atoms/ProgressBar/` (RN+Web → on garde
> **web-only**). Même origine que Checkbox/Tooltip/Pagination/Dropdown (cf. `completed.md` 2026-06-18).
> Cible : `packages/reference/src/components/ProgressBar/` (**dossier vide** aujourd'hui).
>
> **Décisions de cadrage (verrouillées) :**
>
> - **Périmètre v1 = déterminé seul** (`value`/`max`). `buffer` (2e segment, à la MUI) et **mode
>   indéterminé** = extensions v2 possibles, PAS dans ce lot. L'indéterminé recoupe le `Spinner` → devra
>   être justifié + trancher reduced-motion (précédents opposés : Skeleton retire / Spinner ralentit).
> - **REJET de `color: string`** (la source interpole `var(--color-base-${color}-DEFAULT)` → zéro
>   type-safety, token non garanti, contredit « neutral par défaut, brand en opt-in »). Remplacé par un
>   **axe `variant` fermé** (précédent Badge/Button) + override `--ui-progress-bar-indicator-color`.
> - **REJET de `size: thick | thin`** → **`sm | md | lg`**, l'axe de tous les composants migrés.
> - **`metaLeft`/`metaRight` GARDÉS** (ligne de légende sous la barre, choix explicite du dev contre ma
>   recommandation de les sortir en composition). ⚠️ **Question ouverte** : les renommer `metaStart`/
>   `metaEnd` (noms logiques, cohérent avec la culture logical-properties du repo / RTL de Rating) ?
> - **a11y — 2 trous de la source à corriger** : `role="progressbar"` **sans nom accessible**
>   (`aria-label`/`aria-labelledby` obligatoire) ; pas d'`aria-valuetext` pour un affichage non-%.
> - **RTL** : fill en **`inline-size`**, le **skin possède la direction** (la source utilise `width: %`
>   dans un flex row physique — même piège que le `clip-path` inline qui avait cassé le RTL de Rating).
>
> Livrables : skin BEM `progress-bar.css` + resolver `progressBarVariants` (`@fubaritico-ds/variants`) +
> composant + tests 5 niveaux + story + README. `/new-react-component` → `/story` → `/test` → `/review`.

## EN SUSPENS — à finir proprement, PAS abandonné

Un chantier ouvert laissé **non commité** dans le working tree (`ArrowUpDown` a été soldé le
2026-10-08 par `742887e`). **Ne pas supprimer, ne pas commiter en l'état.**

- **`components/WithTooltip/WithTooltip.tsx`** — **stub vide** (`prop: unknown`, `console.warn`,
  `return null`, non typé). C'était le démarrage de la feature **« Tooltip on truncated text »** :
  déclencher la `Tooltip` DS quand un texte est **tronqué** (ellipsis), pour remplacer les stopgaps
  `title`/`aria-label` partout où on tronque (cells DataTable, `TruncatedContent`, `DateCell`, Badge
  `canTruncate`, items Listbox…). Bases prêtes : `Tooltip` migrée + hook `useIsTextTruncated`
  (ResizeObserver). Idée notée : wrapper `TruncateWithTooltip` via `ConditionalWrapper`, qui n'affiche la
  Tooltip **que si** tronqué. ⚠️ Nom à trancher (`WithTooltip` vs `TruncateWithTooltip`).

## PASSE À FAIRE — border-radius & granularité de surcharge

**Décidé le 2026-10-08, pas encore planifié.** Une passe **transverse**, pas du composant par
composant : la forme de l'API doit être tranchée UNE fois puis appliquée partout, sinon les 14
composants divergeront.

Trois choses à traiter ensemble :

1. **Coins individuels** — aucun composant n'expose aujourd'hui de coin séparé. Besoin explicite du
   dev : pouvoir arrondir **un coin, deux coins** d'une forme carrée/rectangulaire. Piste à valider :
   `--ui-<bloc>-radius` (globale, existante) + quatre vars logiques
   `--ui-<bloc>-radius-{start-start,start-end,end-start,end-end}` retombant chacune sur la globale.
   Logique, pas physique — cohérent avec le reste du skin.
2. **Valeur par défaut** — le dev a énoncé « **zéro par défaut** » pour le thème de base, puis a
   constaté de petits arrondis un peu partout et préféré reporter. À trancher dans cette passe.
   Cas connu : `ProgressBar` est en `--radius-full` (pilule), divergence assumée.
3. **Deux littéraux à nettoyer** — `dropdown.css:96` (`9999px` en dur → token). Ne PAS toucher
   `progress-bar.css:68` (`border-radius: inherit`, légitime).

Objectif de fond : **le système de surcharge**, pas l'esthétique. Détails dans `known-issues.md`.
Voir [[theming-strategy]].

## Thread parallèle

Adoption « agent-ready » (étude Astryx) — plans dans `files/plans/agent-ready/`, commencer par
**P1 doc-as-data** (Button cobaye). Voir [[astryx-agent-ready-study]].

## North-star (roadmap.md)

White-label, multi-framework, **industrial-grade** DS — DataTable aiming at **AG-Grid parity**.
Foundation = **`@tanstack/table-core`** (no headless rewrite). Logic must be **agnostic / pluggable /
pure-TS** (TS is the real support, not React). **Perf rule: delegate a heavy op ONLY when necessary**
(150k / ~2M acceptable; Web Workers à la Handsontable for millions). Memory:
`data-table-industrial-multi-framework-goal-external-selection-store-decision`.

Phases: **A** DataTable skin (React) → **B** finish reference DS → **C** maximise DataTable features
(≈AG Grid) → **D** Stencil generation (WC/Angular/Vue/React, no DataTable) → **E** DataTable on
`table-core` (agnostic) → **F** DataTable in Stencil (multi-framework). Plans C/E/F = to write.

## ACTIVE — DataTable (milestone EN COURS, PAS finie)

**Objectif : ZÉRO bug.** Le skin BEM est largement fait mais la milestone table **n'est pas terminée** —
le dev pilote et donnera les prochaines tâches au fil de l'eau. Ne pas considérer la table comme « done ».

**Skin de-Tailwind DONE ✅** (session 2026-07-10, 8 commits `bd33847`..`5ad66f5`, cf. `completed.md`) :
cells + features + chrome skinnés, namespace **`ui-data-table`** ; **block `.ui-data-table` sur la Card**
(porte les vars, toolbar/footer héritent) ; `<table>` = `.ui-data-table__table` ; `Readonly<Props>`
partout ; a11y cells (aria-sort, texte masqué statut, noms accessibles) ; `DateCell` prop `truncate`.
Constantes dans `variants/src/table.ts`, tests de parité dans `table.test.ts`.

**Résolu cette session (2026-07-16)** : scroll paginé (`overflow: auto`) ; **quickfilter réparé**
(`getFilteredRowModel`) ; **footer = chrome sibling, PAS `<tfoot>`** (tranché — `<tfoot>` réservé aux
lignes de synthèse) ; **Tooltip-texte-tronqué = PROCHAINE SESSION** (voir bandeau haut) ; README draft.
Détails : [[datatable-behavior-decisions]].

**Loose ends restants (à traiter quand le dev le dira)** :

- **a11y root** : le `role="button"` sur `<tr>` (ligne cliquable) **casse la sémantique table** (finding
  A11Y-003 ouvert) ; `<caption>` / `aria-busy` sur le `<table>` ; label de région scrollable.
- **`DropdownFilter`** : gardé (biblio composable, PAS mort), non câblé — décision à venir.
- **Nettoyage tokens** : la direction est tranchée (rôle→value-scale, drop des alias shadcn — voir
  [[token-neutral-scale-role-vars]]) ; reste à repointer le skin DataTable (utilise encore les alias).

Perf (`data-table-review-backlog-deferred-findings`) : select-all 150k ≈ **207 ms (OFF, prod)**, coût =
bookkeeping TanStack O(N), pas le paint ; `startTransition` = pansement, pas par défaut. Le skin doit
survivre au swap `react-table`→`table-core` (Phase E) : classes sur les primitives sémantiques, pas sur
l'API TanStack. Plan/checklist : `files/plans/datatable-migration.md`.

## THREAD — white-label native-CSS DS (Phase B)

Plan : `files/plans/native-css-migration.md`. Memory : `native-css-migration-backlog`, `white-label-native-css`.
**DONE** (log dans `completed.md`) : Badge, Button(+Link/NextLink), Typography(body1/body2), Spinner,
Skeleton, Avatar(R19 compound), IconButton, Card — atoms ; Input, Rating — molecules. DS primary = neutral ;
radius ≤ 6px ; `react/jsx-no-leaked-render` enforced ; tokens kebab-case. Chaque composant migré = README + story.
**NEXT** : **Image** (25 `ui:`, →Icon, dernière Molecule) → Compounds : Listbox(37) → Menu(5) → Modal(8) →
Drawer(38) → Tabs(49) → Carousel(138) → Typeahead(23, capstone). Icon & Portal NON migrés (rien ne les bloque).
**A11Y follow-up** : Button `outline` emprunte `--color-input` (~1.48:1) → même gap WCAG 1.4.11 que l'input.

## Décisions verrouillées

Lerna + Nx (no Turbo) ; `reference` = sandbox **NON livrable** ; skin = `@fubaritico-ds/styles` ; CVA
resolvers in `@fubaritico-ds/variants` (pur TS, React/DOM-free) ; web-only. Stateful/compound → skill
`/state-storage`. Phase 2 (dev) = 9 composants neufs + package `icons`. Phase 3 = finir Stencil → wire `build:packages`.

## Artefacts d'analyse (ce soir, persistés)

`files/analysis/storage-port-design.md` (StoragePort seam/sink, observable, même-écran, commenté ligne à ligne).
Notes Basic Memory : `scope-object-builder-latency-analysis-odaseva`,
`data-table-industrial-multi-framework-goal-external-selection-store-decision`,
`data-table-review-backlog-deferred-findings` (résultats benchmark ajoutés).
