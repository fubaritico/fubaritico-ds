---
title: Stencil — Plan NOUVEAU (projet Stencil autonome)
type: report
permalink: main/stencil/stencil-plan-nouveau-projet-stencil-autonome
tags:
- stencil
- plan
- nouveau
- standalone
- roadmap
- tokens
- ui
---

# Stencil — Plan NOUVEAU (projet Stencil autonome)

> **Plan à suivre** pour monter le projet Stencil sur un repo neuf — destiné à une autre instance de
> Claude qui démarrera from scratch. Réécrit à partir du plan original (sandbox dans le monorepo Vite/MF).
> Archive du plan d'origine : [[Stencil — Plan ORIGINAL (sandbox fubaritico-ds)]].

## ⚠️ Contexte précisé : repo = mini-monorepo (3 packages)

Le repo cible **n'est pas « Stencil seul »**. On y **reporte deux packages existants** depuis le repo
source fubaritico-ds :

| Package           | Rôle dans le nouveau repo                                                                 |
| ----------------- | ----------------------------------------------------------------------------------------- |
| `packages/tokens` | **Design tokens** (OKLCH/DTCG, Style Dictionary). Source des variables CSS du global style. **Importé tel quel — PAS à recréer.** |
| `packages/reference`     | **Design system React** (référence). Sert de **modèle à reproduire** : chaque composant Stencil est porté à partir de son équivalent React/Tailwind. **Non porté, gardé comme référence.** |
| `packages/stencil`| Le nouveau package cible : porte les composants `ui` en Web Components.                    |

**Conséquences directes :**
1. C'est un **monorepo pnpm** (`pnpm-workspace.yaml`, `packages/*`). `stencil` consomme `tokens` via
   `workspace:*` (comme dans le repo source : `@.../tokens` en devDep, importé dans le global style).
2. **L'isolation toolchain REDEVIENT nécessaire** — `ui` est React (`jsx: "react-jsx"`), `stencil` est
   `jsx: "react"` + `jsxFactory: "h"` + `experimentalDecorators`. Les deux modes JSX sont incompatibles.
   → tsconfig Stencil autonome (n'étend pas celui de `ui`) + ESLint qui ne fait pas se battre le pragma
   `h` / l'import-order React avec le JSX Stencil. (C'était l'étape 4 du plan original — **elle revient**.)
3. Le mapping de port s'appuie sur le **code réel** de `packages/reference` (voir
   [[Stencil — Porter un composant React vers un Web Component]]).

## Objectif

Depuis `packages/stencil` (une seule base de WC), produire :
1. des **Web Components natifs** (`dist-custom-elements`, tree-shakeables) + bundle `dist` lazy,
2. un **wrapper React** généré (à comparer au `packages/reference` de référence),
3. un **wrapper Angular** généré,
4. de la **doc auto-générée** (`docs-readme`),

en **reproduisant** les composants de `packages/reference` (styling via tokens de `packages/tokens`).

## Décisions d'architecture (à acter au démarrage)

1. **Monorepo pnpm** avec `tokens` + `ui` + `stencil`. Confirmer `packages/*` dans `pnpm-workspace.yaml`.
2. **Layout des wrappers** — choisir :
   - **A. Self-contained** (rapide, recommandé pour démarrer) : wrappers émis dans
     `packages/stencil/dist/react` + `dist/angular` comme **artefacts à lire/comparer** au `ui` de référence.
   - **B. Multi-packages siblings** (production) : `react-library` / `angular-workspace` séparés,
     consommables/publiables. À viser une fois la chaîne validée.
3. **Isolation toolchain** (cf. ⚠️ ci-dessus) : tsconfig Stencil propre + ESLint local dans
   `packages/stencil` (ou ajout de `packages/stencil/{dist,src/components.d.ts}` aux ignores racine).
   **Stencil hors du `pnpm dev` parallèle** s'il existe.
4. **Tokens** : `@.../tokens` en `workspace:*` (devDep), importés dans `src/global/<ns>.css`. Pas de recréation.
5. **Préfixe de tags** : réutiliser `ui-` pour refléter le DS `packages/reference` reproduit (doit contenir un tiret).
6. **Test stack moderne** : `@stencil/vitest` + `@stencil/playwright`.
   ⚠️ **Nuance** : si un `vitest run` racine cible `*.test.tsx` au niveau monorepo, garder les specs
   Stencil sur un nom/scope distinct (ou un projet vitest dédié) pour éviter toute collision — comme la
   raison qui avait poussé à `stencil test --spec` dans le repo source. Sur un monorepo neuf, configurer
   les `projects` vitest proprement dès le départ lève ce risque.

## Conventions (à conserver)

- **JSDoc strict** sur chaque `@Prop`/`@Event`/`@Method` public (docs + types wrappers).
- **Jamais `console.log`** → `console.warn`/`console.error`. **Jamais `any` explicite** (TS strict).
- **Tests 5 niveaux** par composant. **Styling** documenté (shadow vs scoped) ; theming via CSS vars + `::part()`.

## Étapes & état

### Étape 0 — Importer les packages de référence ⬜
- [ ] Copier `packages/tokens` et `packages/reference` depuis le repo source. Vérifier qu'ils buildent (tokens) / lint (ui).
- [ ] `pnpm-workspace.yaml` + `pnpm install` → les workspaces se résolvent.

### Étape 1 — Scaffold `packages/stencil` + dépendances ⬜
- [ ] `npm init stencil` (dans `packages/`) → **components** (library).
- [ ] `@stencil/core` en **dependencies** ; `@stencil/react-output-target` + `@stencil/angular-output-target`
      + `reference`/`react-dom`/`@types/*` + `@stencil/vitest` + `@stencil/playwright` en devDeps ;
      `@.../tokens` en `workspace:*`.
- [ ] Scripts `build` / `dev` / `test` (vitest) / `test:e2e` (playwright) / `lint`.

### Étape 2 — `tsconfig.json` ISOLÉ ⬜
- [ ] `experimentalDecorators`, `jsx: "react"`, `jsxFactory: "h"`, `jsxFragmentFactory: "Fragment"`,
      `target: es2017`, `module: esnext`, `moduleResolution: node`, `declaration: false`. **N'étend PAS** le tsconfig de `ui`.
- [ ] **Créer `src/` immédiatement** (composant ou `.gitkeep`) pour éviter `TS18003`.

### Étape 3 — Isolation ESLint ⬜
- [ ] ESLint local `packages/stencil` (ou ignores racine) pour que le pragma `h` / l'import-order React de `ui` ne se battent pas avec le JSX Stencil.

### Étape 4 — `stencil.config.ts` + `exports` ⬜
- [ ] `namespace` unique, `globalStyle: 'src/global/<ns>.css'`.
- [ ] Output targets : `dist`+loader, `dist-custom-elements` auto-define, `reactOutputTarget`,
      `angularOutputTarget` standalone, `docs-readme`. `componentCorePackage` = `name` exact.
- [ ] Compléter `exports` du `package.json` (`.`, `./dist/*`, `./components/*`, `./loader`).

### Étape 5 — Style global (depuis les tokens) ⬜
- [ ] `src/global/<ns>.css` : **importer `@.../tokens`** (variables CSS niveau 1) + accent + reset minimal.
- [ ] `stencil build` → **vert** (valide la chaîne avant tout composant).

### Étape 6 — Port `ui-badge` (atome) ⬜
- [ ] Reproduire `packages/reference/Badge` : `@Component`/`@Prop`/JSDoc + `.css` (CSS vars overridables, tokens) + spec 5 niveaux.
- [ ] Build → lire `dist/react/` + `dist/angular/` + readme → **comparer au `ui/Badge`**.

### Étape 7 — Port `ui-button` (union discriminée + event) ⬜
- [ ] Reproduire `packages/reference/Button` : prop polymorphe `as`, `@Event` camelCase (`e.detail`).
- [ ] Build → vérifier wrapper React `onXxx` + `e.detail` → comparer à `ui/Button`.

### Étape 8 — Port composant compound : `Tabs` ⬜
- [ ] Reproduire `packages/reference/Tabs` (2 contextes React : `TabsContext` {value/onValueChange/variant/prefix}
      + `TabsListContext` {register/unregister/getTriggers/isDisabled}).
- [ ] Approche **props-down + events-up SANS Context** d'abord : `@Prop value` ↓ + `@Event tabSelect` /
      `@Listen('tabSelect')` ↑ + `<slot>`. Registre clavier via events `@Listen` (+ `@Method` si besoin).
- [ ] **Juger** ensuite si le registre clavier justifie le **Context Protocol** (`@lit/context`) — cf.
      [[Stencil — Concepts Web Components (avant de coder)]] §4. Sinon rester en events+`@Listen`.

### Étape 9 — Synthèse & (option) consommation réelle ⬜
- [ ] Notes : fidélité props, events `e.detail`, perte Tailwind / stratégie CSS vars+tokens, qualité types générés.
- [ ] (layout B) build libs React/Angular + test de consommation ; décider publication npm.

## Checkpoint de validation (à chaque composant)

```bash
# dans packages/stencil
stencil build              # doit être vert
vitest run                 # 5 niveaux verts (@stencil/vitest)
eslint . --max-warnings 0
# au niveau racine : s'assurer que tokens + ui ne sont pas cassés
```

## Point de départ

**Étape 0** (importer `tokens` + `ui`) puis **étape 1** (scaffold). L'isolation toolchain (étapes 2-3)
**est obligatoire** dès qu'on cohabite avec le React de `ui` — ne pas la sauter.

## Ce qui change vs le plan original (résumé)

| Sujet            | Plan original (sandbox dans fubaritico-ds) | Plan nouveau (repo dédié 3 packages)            |
| ---------------- | --------------------------------------------- | ----------------------------------------------- |
| Contexte         | package noyé dans un gros monorepo Vite/MF     | mini-monorepo `tokens` + `ui` (réf) + `stencil` |
| Tokens           | dépend du `tokens` du gros monorepo           | `tokens` **importé**, consommé en workspace dep |
| Référence de port| `packages/reference` du gros monorepo                | `packages/reference` **importé** comme référence       |
| Isolation        | nécessaire (étape 4)                           | **toujours nécessaire** (cohabite avec React de ui) |
| Wrappers         | artefacts `dist/`                              | artefacts d'abord (A), vrais packages ensuite (B) |
| Tests            | `stencil test --spec` (Jest, par contrainte)   | `@stencil/vitest` + `@stencil/playwright` (gérer collision vitest) |
| Cible riche      | ui-rating (puis Tabs)                          | **Tabs** assumé                                 |

## Relations

- Plan original archivé : [[Stencil — Plan ORIGINAL (sandbox fubaritico-ds)]]
- Concepts (compound, Context Protocol) : [[Stencil — Concepts Web Components (avant de coder)]]
- Setup détaillé : [[Stencil — Setup & Configuration d'un projet]]
- Port React→WC (mapping depuis ui) : [[Stencil — Porter un composant React vers un Web Component]]
- Index : [[Stencil — Index de la base de connaissances]]
