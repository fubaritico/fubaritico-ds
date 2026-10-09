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
> **Procédure de release** (rodée 3 fois) : `pnpm exec lerna version minor --yes` → vérifier que le
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
> dans `completed-archive.md` (non chargé). `patterns-ui.md` toujours au-dessus du plafond (ci-dessous).

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

## Dette doc — `patterns-ui.md` dépasse le plafond

**202 lignes pour un plafond de 200** (`CLAUDE.md`). Il était déjà à 197 avant l'ajout de la règle
« généreux en variables de surcharge » du 2026-10-09 : il allait céder au prochain ajout, quel
qu'il soit. Raboter encore la formulation serait contourner la règle, pas la respecter.

**À scinder.** Découpe la plus naturelle : sortir la section **Compound Components (React 19)**
dans son propre `rules/patterns-compound.md` — c'est un bloc autonome, long, et qui ne concerne
qu'une minorité de composants. `patterns-ui.md` garderait le template, la structure de fichiers,
les règles de style et l'ordre des imports. Penser à repointer les références
(`new-react-component` cite la section Compound).

## FAIT (2026-10-09) — tests navigateur (Vitest Browser Mode + Playwright)

> **En place** : projets `unit` (jsdom) + `browser` (Chromium, `*.browser.test.tsx`) dans
> `packages/reference/vitest.config.ts`, skin réel chargé, commandes pointeur, CI installe Chromium.
> Premier lot : `Slider` (clavier natif). **Restent** : ColorPicker (en cours), Drawer/Modal (`<dialog>`
> réel + règle `display`), Image (IntersectionObserver). Cadrage d'origine : historique git de ce fichier.

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

## Fils longs

North-star, DataTable (milestone en cours), thread white-label, livraison 0.1.0, décisions
verrouillées, artefacts d'analyse : **`.claude/next-threads.md`** (à lire quand on y touche).
