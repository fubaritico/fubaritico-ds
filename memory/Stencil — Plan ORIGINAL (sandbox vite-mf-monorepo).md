---
title: Stencil — Plan ORIGINAL (sandbox fubaritico-ds)
type: report
permalink: main/stencil/stencil-plan-original-sandbox-fubaritico-ds
tags:
- stencil
- plan
- original
- sandbox
- archive
---

# Stencil — Plan ORIGINAL (sandbox fubaritico-ds)

> **Archive fidèle** du `packages/stencil/PLAN.md` tel qu'écrit dans le repo source fubaritico-ds.
> Conservé pour référence. Le plan à suivre sur un nouveau projet est [[Stencil — Plan NOUVEAU (projet Stencil autonome)]].
> Contexte : sandbox de découverte **dans** un monorepo Vite/MF existant (d'où les contraintes d'isolation).

## Objectif (original)

Mettre en place une **sandbox Stencil** (`packages/stencil`) qui, à partir d'**un seul** projet de
Web Components, produit :
1. des **Web Components** natifs (`dist-custom-elements`, tree-shakeables),
2. un **wrapper React** généré (`dist/react/`),
3. un **wrapper Angular** généré (`dist/angular/`),

en **portant des composants** déjà présents dans `packages/reference` pour comparer le code généré au code React/Tailwind écrit à la main.

**Composants portés (plan initial, du plus simple au plus riche) :** `ui-badge` → `ui-button` → `ui-rating`.

> ⚠️ **Changement de cible acté en cours de route :** la cible est devenue **Tabs** (compound, 2 contextes
> React : `TabsContext` {value/onValueChange/variant/prefix} + `TabsListContext`
> {register/unregister/getTriggers/isDisabled} pour la nav clavier) au lieu de ui-badge→button→rating.
> Approche : props-down + events-up **sans** Context d'abord, puis juger si le registre clavier justifie
> le Context Protocol. **Le PLAN.md original ne reflétait pas encore ce changement de cible.**

## Décisions d'architecture (figées)

- **Self-contained**, pas de nested-monorepo : un seul `package.json`, les wrappers sont des **artefacts
  de build** dans `dist/react` et `dist/angular` (pas des packages installables). Tout supprimable avec
  `rm -rf packages/stencil`.
- **Isolation totale du toolchain racine** : tsconfig propre (`jsx: "react"` + `jsxFactory: "h"`, n'étend
  PAS le tsconfig racine), ESLint local / ignore racine, **hors** du `pnpm dev` parallèle.
- **Tags préfixés `ui-`** pour refléter le DS `packages/reference`.
- **Runner de test** : `stencil test --spec` (Jest intégré, `*.spec.tsx`) — entorse assumée au plan
  initial (`@stencil/vitest`), justifiée (zéro dép. en plus, zéro collision avec le `vitest run` racine
  ciblant `*.test.tsx`). Migration vers `@stencil/vitest` triviale plus tard.

## Conventions (héritées de CLAUDE.md)

- **JSDoc strict** sur chaque `@Prop`/`@Event`/`@Method` public (alimente docs + types wrappers).
- **Jamais `console.log`** → `console.warn`/`console.error`.
- **Jamais `any` explicite** — TS strict.
- **Tests 5 niveaux** par composant.
- **Discuter l'approche d'abord** ; valider chaque étape par un `stencil build` vert.

## Étapes & état (au moment du gel)

| Étape | Description | État |
| ----- | ----------- | ---- |
| 1 | `package.json` (`@stencil/core` deps ; react/angular output targets + react/react-dom devDeps ; scripts build/dev/test/lint) | ✅ Fait |
| 2 | `tsconfig.json` isolé (decorators, `jsx: "react"`, `jsxFactory: "h"`, `jsxFragmentFactory: "Fragment"`) | ✅ Fait |
| 3 | `stencil.config.ts` (5 output targets : dist+loader, dist-custom-elements auto-define, reactOutputTarget, angularOutputTarget standalone, docs-readme) | ✅ Fait |
| 4 | **Isolation toolchain + `exports`** : eslint local OU ignores racine ; compléter `exports` (`.`, `./dist/*`, `./components/*`, `./loader`) ; vérifier hors `pnpm dev` parallèle | ⬜ À faire |
| 5 | **Style global** : créer `src/global/ui-stencil.css` (import tokens, variables d'accent, reset) → `stencil build` doit passer au vert | ⬜ À faire |
| 6 | Port `ui-badge` (atome, CSS simple) : `.tsx` + `.css` BEM + `.spec.tsx` (5 niveaux) → lire `dist/react` & `dist/angular` + readme généré → comparer au `packages/reference/Badge` | ⬜ À faire |
| 7 | Port `ui-button` (union discriminée + event) : mapper prop polymorphe `as` + event camelCase `e.detail` → rebuild → comparer | ⬜ À faire |
| 8 | Port `ui-rating` (état/interactivité) : sonder `@State`/`@Method` async/slots → rebuild → comparer | ⬜ À faire |
| 9 | Synthèse de découverte : fidélité props, events `e.detail`, perte Tailwind / stratégie BEM+CSS vars, qualité types générés (React & Angular) ; décider si on promeut `dist/react`/`dist/angular` en vrais packages | ⬜ À faire |

## Checkpoint de validation (à chaque étape composant)

```bash
cd packages/stencil
pnpm build          # = stencil build : doit être vert
pnpm test           # = stencil test --spec : 5 niveaux verts
pnpm lint           # eslint --max-warnings 0
```
Puis au niveau racine : `pnpm type-check && pnpm lint && pnpm test`.

## Point de reprise (au gel)

**Étape 4** (isolation ESLint + `exports`) puis **étape 5** (style global) — car `stencil build` échoue
tant que `src/global/ui-stencil.css` n'existe pas.

## Issues connues notées dans le repo source

- `tsconfig.json` déclare `include: ["src"]` mais `src/` n'existe pas → `error TS18003: No inputs were
  found` → casse l'ESLint typé de TOUT le repo → **bloque tout commit** via le hook pre-commit. Résolu
  dès que `src/` existe (étape 5). Sur projet autonome neuf : non pertinent.
- Étape 4-5 (isoler ESLint + `exports` + style global + `stencil build` vert) **non faites** — différées
  au profit de la doc conceptuelle.
- Cible désormais **Tabs** (pas ui-badge), et le PLAN.md ne reflétait pas ce changement.

## Relations

- Nouveau plan à suivre : [[Stencil — Plan NOUVEAU (projet Stencil autonome)]]
- Concepts : [[Stencil — Concepts Web Components (avant de coder)]]
- Setup : [[Stencil — Setup & Configuration d'un projet]]
