---
title: Stencil — Index de la base de connaissances
type: guide
permalink: main/stencil/stencil-index-de-la-base-de-connaissances
tags:
- stencil
- index
- sommaire
- moc
---

# Stencil — Index de la base de connaissances

> **Point d'entrée.** Base de connaissances Stencil dumpée depuis le repo source fubaritico-ds
> (README conceptuel + skill `stencil` + 10 références + `new-web-component` + sources `opensrc`), pour
> être **copiée vers un nouveau projet** où une autre instance de Claude montera un design system Stencil.
> Toutes les notes sont dans le dossier `stencil/` du projet Basic Memory `main`.

## Objectif du transfert

Sur le nouveau repo, on **reporte** `packages/tokens` (design tokens) et `packages/ui` (design system
React, **référence**), puis on monte `packages/stencil` qui **reproduit** les composants `ui` en Web
Components et **génère** des wrappers React + Angular depuis une seule source. Détail :
[[Stencil — Plan NOUVEAU (projet Stencil autonome)]].

## Ordre de lecture recommandé

1. **Comprendre d'abord** — [[Stencil — Concepts Web Components (avant de coder)]]
   (usine à WC, props-down/events-up, compound, Context Protocol, extensibilité). Le socle mental.
2. **Mettre en place** — [[Stencil — Setup & Configuration d'un projet]]
   (package.json, tsconfig isolé, stencil.config.ts, exports, versions).
3. **Écrire des composants** — [[Stencil — API des composants (décorateurs & lifecycle)]] ·
   [[Stencil — Templating JSX]] · [[Stencil — Styling (Shadow DOM, CSS vars, parts)]].
4. **Produire les sorties** — [[Stencil — Output Targets]] · [[Stencil — Wrapper React]] · [[Stencil — Wrapper Angular]].
5. **Porter depuis React** — [[Stencil — Porter un composant React vers un Web Component]] (mapping + problème Tailwind).
6. **Tester** — [[Stencil — Testing]] (`@stencil/vitest` + `@stencil/playwright`, politique 5 niveaux).
7. **Exécuter le plan** — [[Stencil — Plan NOUVEAU (projet Stencil autonome)]]
   (archive : [[Stencil — Plan ORIGINAL (sandbox fubaritico-ds)]]).

## Annexes

- [[Web Components natifs — patterns (sans framework)]] — ce que Stencil génère, en vanilla (contre-point).
- [[Stencil — Sources de référence (opensrc)]] — stencil core + `@lit/context` à refetcher pour lire l'implémentation.

## Faits saillants à ne pas perdre

- **`dist-custom-elements` est obligatoire** pour le wrapper React (`dist` seul ne suffit pas).
- **`@Method()` public DOIT être `async`**. **Events en camelCase** (gouverne `onXxx` React / `@Output` Angular). Payload dans **`e.detail`**.
- **Props objet/array** : settables seulement via propriété JS, pas attribut HTML.
- **Shadow DOM** : styles n'entrent/sortent pas → theming via **CSS variables** + **`::part()`**. Tailwind de page ne pénètre pas.
- **tsconfig Stencil** : `jsx: "react"` + `jsxFactory: "h"` + `experimentalDecorators` — **incompatible** avec `jsx: "react-jsx"` de React → **isoler** quand on cohabite avec `packages/ui`.
- **Piège `TS18003`** : `include: ["src"]` sans `src/` → casse l'ESLint typé → bloque les commits. Créer `src/` tôt.
- **Décorateurs = liste fermée de 11**, retirés au build. Extension réelle = `config.plugins` (Rollup) + **custom output target** (react/angular en sont).
- **Context en WC = bottom-up** : l'enfant émet `context-request` (`bubbles`+`composed`), l'ancêtre répond.
- **Cible compound retenue : Tabs** — props-down + events-up d'abord, Context Protocol seulement si le registre clavier le justifie.
- **Tests** : runner Jest `stencil test` déprécié (retiré v5) → `@stencil/vitest` + `@stencil/playwright`.

## Versions de référence (npm, 2026-06-03)

`@stencil/core@4.43.5` · `@stencil/react-output-target@1.5.3` (peer react ^18||^19) ·
`@stencil/angular-output-target@1.3.1` (Angular 19+) · `@lit/context@1.1.6`.
