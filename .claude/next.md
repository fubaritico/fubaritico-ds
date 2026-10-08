# Next — current actionable state

> Loaded at session start (CLAUDE.md `### Next` → `@next.md`). Single source for "what's next".
> North-star program: **`files/plans/roadmap.md`** (phases A→F).

> ## ▶ PROCHAINE SESSION — LE COLOR PICKER, PAR LE SOCLE
>
> Cadrage fait le 2026-10-09, **`Slider` livré** (`dfe58e5`). Le reste est à construire.
>
> **Cible validée** : l'écran **Google** — aire 2D saturation/valeur + curseur de teinte + champ
> hex + lectures RGB/HSL. Les curseurs par canal d'Illustrator viendront comme **mode d'entrée**
> ultérieur, pas comme second composant : ils se réduisent au même `Slider` avec un `track-image`
> différent et la même machine. La bande « Recent Colors » est une option à part.
>
> **Décisions verrouillées :**
>
> - **La source de vérité est HSVA**, jamais le hex. Dériver le HSV d'un hex **perd de
>   l'information** : `#000000` n'a ni teinte ni saturation, donc saturation à 0 puis retour ⇒ la
>   teinte saute au rouge. C'est le bug de tous les pickers naïfs. Hex et RGB sont des **sorties**.
> - **Le champ hex a son propre brouillon**, validé au blur/Enter — sinon il se reformate pendant
>   qu'on tape.
> - **Machine (Tier 4)**, justifiée par 2 critères du skill `/state-storage` : mises à jour
>   partielles fréquentes (pointermove) + enfants lisant des tranches différentes (l'aire lit s/v,
>   la teinte lit h, le champ lit une chaîne). Cycle `idle → dragging(area|hue|alpha) → idle`, avec
>   `onChange` continu et `onChangeComplete` au relâché.
> - **Châssis neutre, dégradé = donnée.** Un picker est chromatique par nature ; ce qui reste
>   neutre et géométrique, c'est la piste, le pouce, l'anneau de focus, le panneau.
> - **Zéro dépendance de couleur.** ~100 lignes de conversions hex↔rgb↔hsv↔hsl à la main
>   (`react-colorful` fait 2,8 Ko sans dépendance — c'est la preuve). Ne PAS imposer colord/culori.
> - **a11y de l'aire 2D** : WAI-ARIA n'a **pas** de motif slider 2D (issue APG ouverte). Approche
>   retenue : deux `<input type="range">` visuellement masqués (rôle, aria-value*, clavier gratuits)
>   + `aria-roledescription="2D slider"`. Et `aria-valuetext` doit dire « rouge foncé, saturation
>   45 % », pas « x: 120 ». Référence : react-aria.adobe.com/blog/accessible-color-descriptions.
> - **EyeDropper API** : Chromium uniquement (ni Firefox ni Safari) ⇒ amélioration progressive.
> - **`<input type="color">`** a gagné `alpha`/`colorspace` (Safari 18.4 en tête). Si le besoin est
>   « un champ couleur dans un formulaire » sans exigence visuelle, c'est la bonne réponse — ne pas
>   reconstruire ce que la plateforme donne.
>
> **Ordre :**
>
> 1. **`packages/behaviors`** (TS pur, zéro React) — le paquet manque de toute façon pour le Toast.
>    Y poser les conversions de couleur + la `ColorPickerMachine`, testables sans rendu.
> 2. **`ColorArea`** — l'aire 2D, même mécanique de pouce que le Slider, deux axes.
> 3. **`Popover`** — surface ancrée libre, **absente** du DS (`Dropdown` est un menu, pas ça).
> 4. **`ColorPicker`** — l'assemblage.
>
> C'est **plusieurs sessions**, pas une.

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

**MIGRATION QUASI TERMINÉE.** 28 composants portent un README et un skin BEM. Ajouts du 2026-10-08/09
au-delà du backlog initial : **Menu, Modal, Typeahead, Image, Drawer, Tabs** migrés ; **Alert**,
**ProgressBar**, **Slider** écrits ; **BottomSheet** (ex-Drawer, renommé) ; **Drawer** réécrit sur
`<dialog>` natif.

**RESTE SUR TAILWIND — exclu du paquet publié, pas supprimé** : `Carousel` (138 classes) et
`next/*` (50). Ils vivent au dépôt, hors build. `HeroImage` est **parqué en `.bak`** (voir son
`PARKED.md`), `TrailerCard` supprimé — tous deux couplés au domaine TMDB.

**Icon, Portal, ConditionalWrapper** : zéro Tailwind, donc déjà compatibles ; il leur manque
seulement un README.

## LIVRÉ — paquets consommables par le monorepo voisin

`01be734`. Quatre paquets publics en **0.1.0**, tarballs dans `dist-tarballs/` (gitignoré) avec un
`INSTALL.md`. Doc d'intégration à la racine : **`INTEGRATION.md`**.

Cinq blocages levés : `styles` n'était pas publiable ; le barrel injectait Tailwind + preflight ;
l'export `./styles.css` pointait le mauvais fichier ; `msw` était livré en dépendance (désormais
peer optionnelle) ; **les 27 README de composants ne partaient pas** (`files: ['dist']`) — un script
les copie maintenant dans `dist`, ce qui compte surtout pour une IA intégratrice.

`getBlurDataUrl` est internalisé ⇒ `reference` ne dépend plus de `shared` à l'exécution.

⚠️ `reference` reste officiellement un **bac à sable, pas un livrable** (cf. `CLAUDE.md`). On le
consomme comme **v1 temporaire**, décision assumée du dev ; les chemins pourront bouger.

## Décisions verrouillées

Lerna + Nx (no Turbo) ; `reference` = sandbox **NON livrable** ; skin = `@fubaritico-ds/styles` ; CVA
resolvers in `@fubaritico-ds/variants` (pur TS, React/DOM-free) ; web-only. Stateful/compound → skill
`/state-storage`. Phase 2 (dev) = 9 composants neufs + package `icons`. Phase 3 = finir Stencil → wire `build:packages`.

## Artefacts d'analyse (ce soir, persistés)

`files/analysis/storage-port-design.md` (StoragePort seam/sink, observable, même-écran, commenté ligne à ligne).
Notes Basic Memory : `scope-object-builder-latency-analysis-odaseva`,
`data-table-industrial-multi-framework-goal-external-selection-store-decision`,
`data-table-review-backlog-deferred-findings` (résultats benchmark ajoutés).
