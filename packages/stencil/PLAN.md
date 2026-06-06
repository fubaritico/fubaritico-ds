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

en **portant 3 composants** déjà présents dans `packages/ui` pour comparer le code généré au code
React/Tailwind écrit à la main.

**Composants portés** (du plus simple au plus riche) : `ui-badge` → `ui-button` → `ui-rating`.

## Décisions d'architecture (figées)

- **Self-contained**, pas de nested-monorepo : un seul `package.json`, les wrappers sont des
  **artefacts de build** dans `dist/react` et `dist/angular` (pas des packages installables). Tout
  est supprimable avec `rm -rf packages/stencil`.
- **Isolation totale du toolchain racine** : tsconfig propre (`jsx: "react"` + `jsxFactory: "h"`,
  n'étend PAS le tsconfig racine), ESLint local / ignore racine, **hors** du `pnpm dev` parallèle.
- **Tags préfixés `ui-`** pour refléter le design system `packages/ui`.
- **Runner de test** : `stencil test --spec` (Jest intégré, fichiers `*.spec.tsx`) — entorse assumée
  au plan initial (`@stencil/vitest`), justifiée dans le README (zéro dép. en plus, zéro collision
  avec le `vitest run` racine qui cible `*.test.tsx`). Migration vers `@stencil/vitest` triviale plus tard.

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

Fait. 5 output targets : `dist` (+loader), `dist-custom-elements` (auto-define), `reactOutputTarget`,
`angularOutputTarget` (standalone), `docs-readme`. _(détail : README étape 3)_

### ⬜ Étape 4 — Isolation toolchain + `exports` (pré-requis avant tout build)

- [ ] `eslint.config.js` local dans `packages/stencil` **ou** ajout de `packages/stencil/{dist,src/components.d.ts}` aux `ignores` racine (le `h` pragma / import-order React ne doit pas se battre avec le JSX Stencil).
- [ ] Compléter le champ `exports` de `package.json` (`.`, `./dist/*`, `./components/*`, `./loader`) — sinon erreurs de résolution d'import sur les wrappers (skill golden rule #6).
- [ ] Vérifier que `packages/stencil` n'est PAS dans le `pnpm dev` parallèle racine.

### ⬜ Étape 5 — Style global (`globalStyle` pointe vers un fichier manquant → build casse aujourd'hui)

- [ ] Créer `src/global/ui-stencil.css` : import des tokens (`@fubaritico-ds/tokens`), variables d'accent, reset minimal.
- [ ] `stencil build` → **doit passer au vert** (validation de la chaîne avant tout composant).

### ⬜ Étape 6 — Port `ui-badge` (atome, CSS simple) — valide la chaîne complète

- [ ] `src/components/ui-badge/ui-badge.tsx` (`@Component`, `@Prop`, JSDoc) + `ui-badge.css` (BEM, variables CSS overridables).
- [ ] `src/components/ui-badge/test/ui-badge.spec.tsx` (5 niveaux).
- [ ] `stencil build` → lire `dist/react/` et `dist/angular/` + `readme.md` généré.
- [ ] Comparer le wrapper React généré au `packages/ui/Badge`.

### ⬜ Étape 7 — Port `ui-button` (union discriminée + événement)

- [ ] Mapper la prop polymorphe (`as`) et l'event (`@Event` camelCase, `e.detail`).
- [ ] `.tsx` + `.css` BEM + `.spec.tsx` (5 niveaux).
- [ ] Rebuild → comparer wrapper vs `packages/ui/Button` (fidélité props, events, perte Tailwind).

### ⬜ Étape 8 — Port `ui-rating` (état / interactivité)

- [ ] Sonder `@State` / `@Method` (async) / slots si besoin.
- [ ] `.tsx` + `.css` BEM + `.spec.tsx` (5 niveaux).
- [ ] Rebuild → comparer wrapper vs `packages/ui/Rating`.

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

**Étape 4** (isolation ESLint + `exports`) puis **étape 5** (style global) — car `stencil build`
échoue tant que `src/global/ui-stencil.css` n'existe pas.
