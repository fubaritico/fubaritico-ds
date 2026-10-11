# Next — current actionable state

> Loaded at session start (CLAUDE.md `### Next` → `@next.md`). Single source for "what's next".
> North-star program: **`files/plans/roadmap.md`** (phases A→F).

> ## ▶ ÉTAT AU 2026-10-09 SOIR — **0.4.0 PUBLIÉE** (run `37972322360`, tag `v0.4.0`)
>
> Les 5 paquets `@fubaritico/*` en 0.4.0 sur GitHub Packages. Handoff déposé chez europe-map
> (`~/Desktop/WebstormProjects/europe-map/HANDOFF-from-fubaritico-ds.md`) : bump `^0.4.0`,
> `ColorField` dans le dialogue des polities, `density="compact"`.
>
> **Livré** : `behaviors` (« state as a service » — `TabsService`, `ColorPickerService`,
> `PopoverService`, `Store` commun ; skill `/behavior-service`), `ColorPicker` (panneau inline),
> `Popover` (top layer natif, **pas de portal** — c'est ce qui le rend utilisable DANS une Modal),
> `ColorField` (label + pastille + hex + picker en popover), densité `compact`, état pressé du
> Button par variante. Vitest Browser Mode en place (Chromium).
>
> **Procédure de release** : `README.md` → « Publishing a release », skill **`/release`** (2026-10-11). Résumé (rodée 4 fois) : `pnpm exec lerna version minor --yes` → vérifier que le
> lockfile n'a pas été reformaté → `gh workflow run release.yml -f dry_run=false` →
> `gh run watch <id> --exit-status` → chercher `+ @fubaritico/*@x.y.z` dans le log. Feu vert du dev
> à chaque publication.
>
> **Prochaine étape probable** : attendre le retour d'europe-map (intégration du ColorField dans
> leur modale) ; sinon reprendre un des chantiers ci-dessous. Pistes ouvertes : sortir
> `LinkButton` / `NextLinkButton` en paquets d'adaptateurs (`@fubaritico/react-router`,
> `@fubaritico/next`) ; mode « curseurs par canal » du picker (même `Slider`, autre `track-image`) ;
> bande « Recent Colors » ; EyeDropper en amélioration progressive (Chromium seul).
>
> **Dette doc** : `completed.md` dépassait 570 lignes → entrées du 2026-09-16 et antérieures archivées
> dans `completed-archive.md` (non chargé). `patterns-ui.md` scindé le 2026-10-11 (section Compound → `rules/patterns-compound.md`).

## EN SUSPENS — à finir proprement, PAS abandonné

Un chantier ouvert laissé **non commité** dans le working tree (`ArrowUpDown` a été soldé le
2026-10-08 par `742887e`). **Ne pas supprimer, ne pas commiter en l'état.**

- **`components/WithTooltip/WithTooltip.tsx`** — **désormais TRACKÉ** (balayé par erreur dans
  `30d557d`, puis parti dans le tarball 0.1.0 ; corrigé en `7aa569f` : exclu de `tsup` et de
  l'émission des déclarations, en-tête explicatif dans le fichier). Il **ne peut plus atteindre un
  consommateur**, et le garder tracké évite qu'un `git add -A` le reprenne. Toujours un **stub vide** (`prop: unknown`, `console.warn`,
  `return null`, non typé). C'était le démarrage de la feature **« Tooltip on truncated text »** :
  déclencher la `Tooltip` DS quand un texte est **tronqué** (ellipsis), pour remplacer les stopgaps
  `title`/`aria-label` partout où on tronque (cells DataTable, `TruncatedContent`, `DateCell`, Badge
  `canTruncate`, items Listbox…). Bases prêtes : `Tooltip` migrée + hook `useIsTextTruncated`
  (ResizeObserver). Idée notée : wrapper `TruncateWithTooltip` via `ConditionalWrapper`, qui n'affiche la
  Tooltip **que si** tronqué. ⚠️ Nom à trancher (`WithTooltip` vs `TruncateWithTooltip`).

## FAIT (2026-10-09) — tests navigateur (Vitest Browser Mode + Playwright)

> **En place** : projets `unit` (jsdom) + `browser` (Chromium, `*.browser.test.tsx`) dans
> `packages/reference/vitest.config.ts`, skin réel chargé, commandes pointeur, CI installe Chromium.
> Premier lot : `Slider` (clavier natif). **Restent** : ColorPicker (en cours), Drawer/Modal (`<dialog>`
> réel + règle `display`), Image (IntersectionObserver). Cadrage d'origine : historique git de ce fichier.

## FAIT (2026-10-11) — border-radius : l'API des coins

Coins logiques sur les 21 skins, formes rondes sur `--radius-full`, littéral du dropdown nettoyé.
Détails : `known-issues.md`. **Suite = le chantier des THÈMES** (dev, 2026-10-11) : deux ou trois
thèmes par défaut, pour montrer qu'à partir des seuls tokens on obtient ce qu'on veut — dont un
« coins carrés » (tokens `sm`/`md`/`lg` à 0) et au moins un arrondi. Voir [[theming-strategy]].

## À FAIRE — les autres portals sur `body` (relevé 2026-10-11)

La Tooltip est passée dans le top layer (prouvé : un portal sur `body` ouvert depuis une Modal
finit SOUS le `<dialog>`, dans la partie inerte). **Même défaut** chez `Dropdown`, `Typeahead`
(menu), `BottomSheet`, `DataTable/DropdownFilter` et `TableFooterContent` : ils portalisent via
`components/Portal`. Décision dev (2026-10-11) : top layer sur place par défaut, portal en
option. À traiter composant par composant, chacun avec son test navigateur « ouvert dans une Modal ».

## Thread parallèle

Adoption « agent-ready » (étude Astryx) — plans dans `files/plans/agent-ready/`, commencer par
**P1 doc-as-data** (Button cobaye). Voir [[astryx-agent-ready-study]].

## Fils longs

North-star, DataTable (milestone en cours), thread white-label, livraison 0.1.0, décisions
verrouillées, artefacts d'analyse : **`.claude/next-threads.md`** (à lire quand on y touche).
