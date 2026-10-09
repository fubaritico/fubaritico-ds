# Next — current actionable state

> Loaded at session start (CLAUDE.md `### Next` → `@next.md`). Single source for "what's next".
> North-star program: **`files/plans/roadmap.md`** (phases A→F).

> ## ▶ EN COURS (2026-10-09) — `behaviors` = « state as a service »
>
> Paquet `packages/behaviors` posé (`f9d5948`, conversions de couleur). **Modèle cible validé** :
> un service TS par composant + adaptateurs par framework — plan **`files/plans/behaviors-service-pattern.md`**
> (source indicative : `files/tabs-state-service (1).md`, 7 corrections relevées). Structure du paquet
> **provisoire** : par composant, le commun émerge en codant. `src/color/` descendra dans `src/color-picker/`.

> ## ▶ PUBLICATION GitHub Packages — **0.2.0 PUBLIÉE le 2026-10-09** (run `37938876637`)
>
> Étapes 1–3 faites (dry-run, `lerna version` → `v0.2.0`, publication). 3b et 4 faits.
>
> **0.2.1** (`1460cc7`, run `37957327629`) : `react` seul — imports ESM complétés (636), test de
> fumée Node dans le build, `next/link.js`. `peerDependenciesMeta` perdu par GitHub Packages →
> documenté (`auto-install-peers=false`). Piste : sortir `LinkButton` / `NextLinkButton` en paquets
> d'adaptateurs (`@fubaritico/react-router`, `@fubaritico/next`).
>
> _Historique du plan :_
>
> Décidé 2026-10-09 (`d9bc1db`) : scope **`@fubaritico`**, `reference` = **`@fubaritico/react`**,
> Lerna **mode fixe**, `shared` privé, workflow **`release.yml`** (manuel, dry-run par défaut). Reste,
> dans l'ordre — **chaque publication = action sortante, feu vert du dev à chaque fois** :
>
> 1. Lancer `release.yml` en **dry-run** → vérifier la liste des 5 paquets et leurs `dependencies`
>    (`workspace:*` réécrits en `0.1.0` exact). Confirmer au passage que GitHub accepte le scope.
> 2. `pnpm exec lerna version minor --conventional-commits` → **0.2.0** partout + changelogs, push du tag.
> 3. `release.yml` sans dry-run. Puis réglages du paquet sur GitHub : accès en lecture au dépôt europe-map.
> 4. **Note de livraison pour europe-map** : nouveaux noms (`@fubaritico/react` au lieu de
>    `@fubaritico-ds/reference` → imports à changer), `.npmrc` + token, suppression des tarballs
>    vendorisés ET de l'override `variants` (remplacé par le registre), `behaviors` arrive en dépendance.
>
> **Exigence consommateur pour le ColorPicker** (handoff europe-map) : un état explicite
> **« automatique / pas de couleur »** — valeur `HsvaColor | null`, `null` = état à part entière (UI +
> `aria-valuetext`), pas une absence de valeur.

> ## ▶ PUIS — LE COLOR PICKER, PAR LE SOCLE
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
> 1. **`ColorPickerService`** — fait (`4d897c4`) : état `null` (automatique), glisser, clavier, hex en
>    brouillon, ARIA, annonces. `Store` commun extrait. Reste les adaptateurs ci-dessous.
> 2. **`ColorPicker` composé (panneau inline)** — FAIT (`6cb5c5d`, review `d79c753`) : README,
>    `/review` 5 agents appliquée, 20 tests navigateur. **0.3.0 PUBLIÉE** (`e36bc86`, run `37967603707`) —
>    handoff déposé chez europe-map (bump `^0.3.0`).
> 3. **`Popover`** — surface ancrée libre, **absente** du DS (`Dropdown` est un menu, pas ça).
> 4. **`ColorPicker`** — l'assemblage.
>
> C'est **plusieurs sessions**, pas une.

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
