# Plan — `@fubaritico-ds/stencil`

> Source de vérité du travail à faire sur le package Stencil. Le pas-à-pas détaillé de chaque
> fichier vit dans `README.md` (journal de mise en place) ; ce fichier liste **les étapes** et
> leur **état**. Référence skill : `.claude/skills/stencil/references/10-project-monorepo.md`.

## Objectif

Mettre en place une **sandbox Stencil** (`packages/stencil`) qui, à partir d'**un seul** projet
de Web Components, produit :

1. des **Web Components** natifs (`dist-custom-elements`, tree-shakeables),
2. un **wrapper React** généré (`dist/react/`),
3. un **wrapper Angular** généré (`dist/angular/`),

en **portant 3 composants** déjà présents dans `packages/reference` pour comparer le code généré au code
React/Tailwind écrit à la main.

**Composants portés** (du plus simple au plus riche) : `ui-badge` → `ui-button` → `ui-rating`.

## Décisions d'architecture (figées)

- **Self-contained**, pas de nested-monorepo : un seul `package.json`, les wrappers sont des
  **artefacts de build** dans `dist/react` et `dist/angular` (pas des packages installables). Tout
  est supprimable avec `rm -rf packages/stencil`.
- **Toolchain propre, mais package first-class** : Stencil **est le sujet du projet**, donc il
  n'est **pas exclu** des scripts ni des vérifs racine. Il garde un tsconfig autonome (`jsx: "react"` +
  `jsxFactory: "h"` + `jsxFragmentFactory: "Fragment"`, n'étend PAS le tsconfig racine — les deux modes
  JSX sont incompatibles) et un **bloc override** dans le `eslint.config.js` racine (pragma `h`, règles
  d'import React désactivées) plutôt qu'un ignore. Il est branché dans les vérifs racine
  (`lint` / `type-check` / `test` / `build`).
- **Tags préfixés `ui-`** pour refléter le design system `packages/reference`.
- **Runner de test** : `@stencil/vitest` (le plan initial — confirmé bon). Le « runner intégré »
  `stencil test --spec` est **déprécié** en Stencil v4.43 (supprimé en v5) ET n'est **pas** zéro-dépendance
  (il réclame `jest@29` + `@types/jest@29` + `jest-cli@29`) : sa justification figée était fausse.
  `@stencil/vitest` s'aligne sur le Vitest déjà présent dans le repo. La `vitest.config.ts` du package
  (via `defineVitestConfig`, specs `*.spec.{ts,tsx}`, env `stencil`) est ramassée **automatiquement** par
  le `vitest run` racine grâce à `projects: ['packages/*']` — pas de modif du script `test` racine. La
  config vitest complète + le 1er spec sont posés à l'étape 6.
- Créer une application storybook pour chaque framework UI.

## Conventions (héritées de CLAUDE.md)

- **JSDoc strict** sur chaque `@Prop` / `@Event` / `@Method` public (alimente docs + types des wrappers).
- **Jamais `console.log`** → `console.warn` / `console.error`.
- **Jamais `any` explicite** — TS strict.
- **Tests 5 niveaux** par composant (`tests.md`).
- **Discuter l'approche d'abord** ; valider chaque étape par un `stencil build` vert.

---

## Étapes & état

### ✅ Étape 1 — `package.json`

Fait. `@stencil/core` en deps ; `@stencil/react-output-target` + `@stencil/angular-output-target` +
react/react-dom en devDeps ; scripts `build` / `dev` / `test` / `lint`. _(détail : README étape 1)_

### ✅ Étape 2 — `tsconfig.json`

Fait. Config isolée (decorators, `jsx: "react"`, `jsxFactory: "h"`, `jsxFragmentFactory: "Fragment"`).
_(détail : README étape 2)_

### ✅ Étape 3 — `stencil.config.ts`

Fait. 5 output targets : `dist` (+loader), `dist-custom-elements` (auto-define +
**`externalRuntime: false`**, exigé par `@stencil/react-output-target` 1.x — sans ça la config ne valide
pas), `reactOutputTarget`, `angularOutputTarget` (standalone), `docs-readme`. _(détail : README étape 3)_

### ⬜ Étape 4 — Intégration toolchain + `exports` (pré-requis avant tout build)

- [ ] **Override ESLint racine** : bloc `{ files: ['packages/stencil/**/*.{ts,tsx}'], ... }` dans le
      `eslint.config.js` racine (pragma `h`, `jsxFragmentFactory: 'Fragment'`, désactivation des règles
      d'import-order React) — pas un ignore : `pnpm lint` doit couvrir stencil. Ignorer seulement
      `packages/stencil/dist` + fichiers générés (`src/components.d.ts`).
- [ ] Compléter le champ `exports` de `package.json` (`.`, `./dist/*`, `./components/*`, `./loader`) — sinon erreurs de résolution d'import sur les wrappers (skill golden rule #6).
- [ ] Ajouter un script `type-check` (`tsc --noEmit -p tsconfig.json`) au `package.json` du package.
- [ ] **Brancher stencil dans les vérifs racine** : `type-check`, `test` (`stencil test --spec`) et
      `build` doivent inclure `@fubaritico-ds/stencil`. _(L'orchestration `dev`/`dev:apps` des apps
      héritées reste à recâbler dans une passe dédiée — refs périmées `@fubaritico-ds/ui` / `@fubar-it-co/tmdb-client`.)_

### ⬜ Étape 5 — Style global (`globalStyle` pointe vers un fichier manquant → build casse aujourd'hui)

- [ ] Créer `src/global/ui-stencil.css` : import des tokens (`@fubaritico-ds/tokens`), variables d'accent, reset minimal.
- [ ] `stencil build` → **doit passer au vert** (validation de la chaîne avant tout composant).

### ⬜ Étape 6 — Port `ui-badge` (atome, CSS simple) — valide la chaîne complète

- [ ] `src/components/ui-badge/ui-badge.tsx` (`@Component`, `@Prop`, JSDoc) + `ui-badge.css` (BEM, variables CSS overridables).
- [ ] `src/components/ui-badge/test/ui-badge.spec.tsx` (5 niveaux).
- [ ] `stencil build` → lire `dist/react/` et `dist/angular/` + `readme.md` généré.
- [ ] Comparer le wrapper React généré au `packages/reference/Badge`.

### ⬜ Étape 7 — Port `ui-button` (union discriminée + événement)

- [ ] Mapper la prop polymorphe (`as`) et l'event (`@Event` camelCase, `e.detail`).
- [ ] `.tsx` + `.css` BEM + `.spec.tsx` (5 niveaux).
- [ ] Rebuild → comparer wrapper vs `packages/reference/Button` (fidélité props, events, perte Tailwind).

### ⬜ Étape 8 — Port `ui-rating` (état / interactivité)

- [ ] Sonder `@State` / `@Method` (async) / slots si besoin.
- [ ] `.tsx` + `.css` BEM + `.spec.tsx` (5 niveaux).
- [ ] Rebuild → comparer wrapper vs `packages/reference/Rating`.

### ⬜ Étape 9 — Synthèse de découverte

- [ ] Notes dans le README : fidélité des props, events (`e.detail`), perte de Tailwind / stratégie BEM+CSS vars, qualité des types générés (React & Angular).
- [ ] Décider si on promeut `dist/react` / `dist/angular` en vrais packages consommables par le host.

---

## Checkpoint de validation (à chaque étape de composant)

```bash
cd packages/stencil
pnpm build          # = stencil build : doit être vert
pnpm test           # = stencil test --spec : 5 niveaux verts
pnpm lint           # eslint --max-warnings 0
```

Puis, au niveau racine, s'assurer que rien n'est cassé ailleurs :
`pnpm type-check && pnpm lint && pnpm test`.

## Point de reprise actuel

**Étape 4** (override ESLint racine + `exports` + branchement vérifs) puis **étape 5** (style global) —
car `stencil build` échoue tant que `src/global/ui-stencil.css` n'existe pas.
