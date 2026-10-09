## Completed

Put here the completed tasks and plans to avoid cluttering the context window.

### 2026-10-09 — behaviors, publication GitHub Packages, ColorPicker → Popover → ColorField, 0.4.0

**Deux plages le même jour** (12:42 → 16:13, 3h31 ; 18:00 → 20:19, 2h19), suite directe de la nuit
du 08/10 (chantier de 12h44 cumulées sur 3 plages). **~26 commits**, trois publications.

- **`packages/behaviors`** (`f9d5948`) puis le modèle **« state as a service »** (`0503650`,
  `32497aa`) : un service TS pur par composant, adaptateurs minces ; Tabs migré dessus. Skills
  `/add-package` (refondu) et `/behavior-service` (nouveau).
- **Publication GitHub Packages** (`d9bc1db`) : scope `@fubaritico`, `reference` → **`@fubaritico/react`**,
  Lerna mode fixe, `release.yml`. **0.2.0**, **0.2.1** (imports ESM complétés + test de fumée Node),
  **0.3.0** (ColorPicker), **0.4.0** (Popover/ColorField). Handoffs successifs chez europe-map.
- **`ColorPickerService`** (`4d897c4`) + **`ColorPicker`** (`6cb5c5d`, review `d79c753`) : HSVA source
  de vérité, `null` = automatique (exigence europe-map), hex en brouillon, aire 2D accessible.
- **Vitest Browser Mode** (`a3511f6`) : projet `browser` Chromium à côté de jsdom ; convention
  `.browser.test.tsx` (Vitest) vs `.e2e.ts` (Playwright Test, réservé).
- **`Popover` + `ColorField`** (`38f99ae`) : `popover="auto"` natif, top layer, ancrage CSS, **sans
  portal** — le dev voulait « par-dessus tout » ; le top layer le donne, et c'est aussi ce qui permet
  l'ouverture **dans une Modal** (un portal hors du `<dialog>` serait inerte). Prouvé par test
  navigateur (empilement, saisie, Escape ferme le popover seul). Review 5 agents appliquée : état
  pressé du Button par variante, service injecté préservé, focus/réconciliation remontés dans le
  service, noms accessibles « Choose color Fill » / « Hex color Fill ».
- **Densité `compact`** (`1afd42b`) à la demande du dev (« plus tassée, en variante ») : panneau
  ≈13rem, aire 2:1, seules les vars bougent ; testée en géométrie réelle.
- **Incident** : `lerna version` interrompu par le dev au milieu → 12 fichiers modifiés sans commit
  ni tag ; restaurés, puis relance propre après la variante.

### 2026-10-08/09 — Nuit longue : 8 composants, le trio dialog réparé, le DS livrable, le Slider

**Une seule plage de 6 h 51** (19:29 → 02:21, à cheval sur minuit), 474 actions journalisées,
**28 commits poussés**, repo vert à chaque étape (690 tests reference / 227 variants / 19 shared
à la fin). Fichiers les plus retouchés : les stories et les skins du trio `Drawer` / `Modal` /
`BottomSheet` — c'est là qu'ont été les allers-retours.

- **Dette doc soldée** (`199e99d`) — le chemin `src/<Component>/` corrigé partout, mais surtout deux
  périmés plus graves : `patterns-ui.md` et `new-react-component` prescrivaient encore **Tailwind
  `ui:`** et le pattern **`const X: FC`**. Template réécrit sur le resolver, ordre **skin → resolver
  → composant**, `ui:` requalifié en legacy.
- **`ArrowUpDown`** (`742887e`) — le working tree était **cassé** (lint rouge) : Record map ajoutée
  mais jamais branchée + IIFE encore active. Soldé. Puis `7616184` : map partagée avec
  `SortableHeaderCellView`, `toSortableNumber` extrait (bloc dupliqué, `NaN` → 0, comparateur qui ne
  renvoyait **jamais** 0 ⇒ tri instable), et `9fecadd` sur `ListboxItem`. **S3358 : 7 → 2.**
- **SonarCloud : 4 mois de données fantômes.** Deux de mes conclusions intermédiaires étaient
  **fausses** (« la CI ne publie jamais », « le quality gate est décoratif ») — la CI publiait. Cause
  réelle : **branche principale `master`** (inexistante au dépôt) pendant que la CI analysait `main`,
  enregistrée en branche **SHORT** que le **plan gratuit interdit de lire**. Corrigé : projet en
  **public**, `master` renommée `main`. Secret CI mort (403) remplacé par le dev.
- **8 composants** — Menu, Modal, Typeahead (**Critical Sonar soldé**, complexité 19/15 → table de
  handlers), Image, Drawer, **Alert** (neuf), Tabs, puis **BottomSheet** + **Drawer** réécrit.
  Trouvailles au passage : focus-visible absent du Listbox, scroll lock qui **écrasait** l'overflow
  hôte, `left-0` physique cassant le RTL du Typeahead, leak `jsx-no-leaked-render` sur Image,
  **sélecteur `[.media-section:nth-of-type(even)]` couplé à l'app TMDB** dans Tabs, et le **contraste
  dark-on-dark** de la pilule active (`bg-primary` devenu quasi noir sans changer le texte).
- **Drawer ≠ BottomSheet.** L'ancien « Drawer » était un bottom sheet (son propre JSDoc le disait).
  Renommé (`3589b24`), puis **vrai Drawer** écrit sur `<dialog>` natif (`eb36157`) : piège de focus,
  inertie, Escape et top layer gratuits, trois bords **logiques**, `bottom` délibérément absent.
- **Bug prouvé par test avant correction** (`30d557d`) — `ComponentProps<'dialog'>` porte `ref` en
  React 19, donc un ref consommateur atterrissait dans le rest spread et **remplaçait** le ref
  interne : `showModal()` jamais appelé, **silencieusement**, sur Modal **et** Drawer. Corrigé par
  `useNativeDialog`, propriétaire unique du cycle de vie (la duplication que la review avait pointée).
- **Le piège `display` sur `<dialog>`, rencontré DEUX fois** (`77122a4`, `7d74755`) — `.ui-drawer`
  posait `display: flex`, écrasant la règle UA `dialog:not([open]) { display: none }` : tous les
  drawers visibles en permanence, d'où « tous ouverts au démarrage », l'empilement et le bouton close
  « inactif ». Même piège ensuite via la **story** du Modal (`style={{display:'grid'}}`). Layout
  déplacé sur `[open]`, le skin centre lui-même. Plus : le backdrop d'un `<dialog>` **se déclare
  lui-même comme cible du clic** ⇒ `backdropArea: 'self' | 'outside'`.
- **Passe de nettoyage des stories** (`30e7d59`) — trois défauts de **skin**, pas de stories :
  drawer/bottom-sheet/modal sans `font-family` (d'où le Times New Roman), bodies sans `gap`, et
  `.ui-card__footer` **sans `justify-content`** (ferrage à gauche accidentel) → axe `align`,
  **`center` par défaut** (choix dev ; la convention majoritaire serait `end`). Canvas Storybook doté
  d'une police de base, rôle d'une app hôte.
- **DS livrable** (`01be734`) — quatre paquets publics 0.1.0, **zéro Tailwind**, tarballs prêts.
  Cinq blocages levés, dont **les 27 README qui ne partaient pas**. Voir `next.md`.
- **`Slider`** (`dfe58e5`) — primitive absente du DS, prérequis du color picker. `<input
  type="range">` transparent par-dessus des divs peints (clavier et sémantique de la plateforme),
  **20 custom properties**, et `--ui-slider-track-image` comme couture : un curseur de teinte **est**
  ce composant.
- **Cadrage color picker** fait et consigné dans `next.md` (source de vérité HSVA, machine Tier 4,
  pas de dépendance couleur, a11y de l'aire 2D). **Correction** : les tokens ne sont **pas** en
  OKLCH contrairement à `CLAUDE.md` — ils sont en hexadécimal.

### 2026-10-08 — Reprise : briefing, dette doc soldée, ArrowUpDown, SonarCloud réparé

- **Reprise après ~12 semaines** (dernier commit de code `672acdc`, 2026-07-16). Briefing de reprise
  délivré comme exigé par la consigne de `next.md` (où on en est, origine de `WithTooltip`, origine du
  diff `ArrowUpDown`), **avant** toute action.
- **`199e99d` `docs(repo)`** — dette doc du commit `672acdc` soldée sur **7 fichiers**. Le chemin
  `src/<Component>/` → `src/components/<Component>/` partout (rules, agents, skills). Mais le ménage a
  révélé **deux périmés plus graves que le chemin** : `patterns-ui.md` et `new-react-component`
  prescrivaient encore **Tailwind `ui:`** (alors qu'un composant neuf se bâtit sur le skin BEM +
  resolver) et le pattern **`const X: FC`** (alors que la maison est `export function`). Corrigés :
  template basé sur le resolver, ordre **skin → resolver → composant**, README obligatoire, tests
  5 niveaux, `ui:` requalifié en **legacy** (ne subsiste que dans Tabs/Drawer/Carousel/Typeahead/
  `next/Image`), `Edit` ajouté aux `allowed-tools` du scaffolder (l'étape 8 édite le barrel racine).
- **`742887e` `refactor(reference)`** — `ArrowUpDown`. Le working tree était dans un **état
  intermédiaire cassé** (lint ROUGE) : la Record map `SORT_DIRECTION_SUFFIX` avait été ajoutée mais
  **jamais branchée**, et l'IIFE calculait encore le label. Record map branchée, IIFE supprimée (9
  lignes → 1). `/review` 6 agents : platform-safety/security/quality/architecture **vides** ;
  **REACT-004** (interface ad hoc au lieu de `ComponentProps<'button'>`, pas de `...rest`) corrigé mais
  **sévérité abaissée high→medium** (aucun bug, appelant unique servi) ; **A11Y-005** (chevron atténué
  ~2,05:1 vs WCAG 1.4.11) **rejeté sur le fond et consigné** — info redondante (chevron actif ~5,3:1 +
  `aria-label`), précédent `Rating`.
- **SonarCloud : 4 mois de données fantômes, diagnostiqué et réparé.** Enchaînement d'erreurs levées
  une par une — et **deux de mes conclusions intermédiaires étaient fausses** (« la CI ne publie
  jamais », « le quality gate est décoratif ») : la CI publiait bien. Cause réelle : **branche
  principale `master`** (inexistante dans le dépôt) pendant que la CI analysait `main`, enregistrée en
  branche **SHORT** que le **plan gratuit interdit de lire**. D'où une CI verte, des tâches Compute
  Engine en `SUCCESS`, et une API renvoyant un instantané du 07/06. Correctifs : projet basculé
  **public**, branche SHORT `main` supprimée, `master` **renommée `main`** (`isMain: true`, LONG).
  Au passage, le secret CI était réellement mort (**403 Forbidden** sur le JRE metadata) — remplacé par
  le dev. Gotchas consignés dans `known-issues.md` (piège `master`/`main` + user token vs analysis token).
- **Première analyse à jour depuis juin** (révision `742887e`) : **11 701 ncloc** (vs 6 415), couverture
  **68,1 %**, **102 issues** (0 blocker, **1 critical** = `TypeaheadInput.tsx:65`, complexité cognitive
  19/15), 39 des 102 sur les **scripts shell** `publish*.sh`. Quality gate encore `NONE` (branche
  principale recréée, pas de baseline new-code) — à revérifier au prochain run.
- **Question d'origine tranchée (corroborée, pas prouvée)** : `ArrowUpDown` ne remonte plus rien (la
  révision analysée contient le correctif), mais **S3358 est active avec 7 occurrences**, dont
  `SortableHeaderCellView.tsx:50` — **l'appelant direct** — et `DataTable/sorting/index.ts:20,26`.
  L'hypothèse SonarLint/Sonar tient ; la Record map était la bonne réponse.
- **Non commité, volontairement** : `WithTooltip` (stub en suspens), `next.md`, `completed.md`,
  `known-issues.md`, le skill `/timeline` et les skills start/end-session.

> Entrées antérieures : `completed-archive.md`.
