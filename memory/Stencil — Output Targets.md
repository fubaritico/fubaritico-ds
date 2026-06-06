---
title: Stencil — Output Targets
type: guide
permalink: main/stencil/stencil-output-targets
tags:
- stencil
- output-targets
- dist
- custom-elements
- build
---

# Stencil — Output Targets

> Tout est déclaré dans `stencil.config.ts → outputTargets`. Un projet, plusieurs cibles.

## `dist` — distribution lazy-loaded

```typescript
{ type: 'dist', esmLoaderPath: '../loader' }
```
- Produit un bundle auto-lazy-loading + une entrée `loader` (`defineCustomElements()`).
- Composants fetchés à la demande au runtime. Bon pour des apps qui veulent juste que `<my-el>` marche.
- Cible utilisée par défaut par le wrapper **Angular** (`outputType: 'component'`).

## `dist-custom-elements` — custom elements tree-shakeables

```typescript
{
  type: 'dist-custom-elements',
  customElementsExportBehavior: 'auto-define-custom-elements',
  dir: 'dist/components',          // défaut
  generateTypeDeclarations: true,  // défaut — émet les .d.ts dans dist/types
  externalRuntime: true,           // défaut — marque @stencil/core/* comme external
  minify: false,
  empty: true,                     // vide le dir entre builds
}
```

`customElementsExportBehavior` :
| Valeur                          | Comportement                                              |
| ------------------------------- | --------------------------------------------------------- |
| `'default'`                     | un export par composant, **pas** d'auto-enregistrement    |
| `'auto-define-custom-elements'` | les composants s'auto-enregistrent à l'import             |
| `'bundle'`                      | expose un seul `defineCustomElements()` depuis `index.js` |
| `'single-export-module'`        | tous re-exportés depuis `index.js` (distribution lib)     |

- Chaque composant étend `HTMLElement` directement avec un helper `defineCustomElement()`.
- Entièrement tree-shakeable — le consommateur importe seulement ce qu'il utilise.
- **REQUIS pour le React output target.** `dist` ne peut pas le remplacer.

```typescript
import { defineCustomElement as defineMyButton } from 'stencil-library/dist/components/my-button.js'
defineMyButton()
```
> Assets : avec `dist-custom-elements`, fixer les chemins via `setAssetPath()` (`import.meta.url` ou
> `document.currentScript.src`), pas de loader intégré.

## `www` — app de dev / site statique

```typescript
{ type: 'www', serviceWorker: null, baseUrl: 'https://myapp.com/' }
```
Cible par défaut d'une app Stencil standalone. Héberge le dev server. Pas pour les libs.

## `dist-hydrate-script` — SSR

```typescript
{ type: 'dist-hydrate-script', dir: './hydrate' }
```
Génère un module `renderToString`/`hydrate` pour le SSR. Requis pour l'option `hydrateModule` du
wrapper React (Next.js SSR).

## `docs-readme` / `docs-json` / `docs-vscode`

Doc auto-générée depuis les JSDoc sur `@Prop`/`@Event`/`@Method` :
```typescript
{ type: 'docs-readme' }                  // README.md par composant
{ type: 'docs-json', file: 'docs.json' } // machine-readable
```

## Wrappers framework (packages générés)

Ce sont aussi des output targets — ils écrivent du code généré dans un autre package :
```typescript
reactOutputTarget({ outDir: '../react-library/src/components/' })   // voir note Wrapper React
angularOutputTarget({ /* ... */ })                                  // voir note Wrapper Angular
vueOutputTarget({ /* ... */ })                                      // Vue (non prioritaire)
```

## Combinaison typique (lib npm + React + Angular)

```typescript
outputTargets: [
  { type: 'dist', esmLoaderPath: '../loader' },   // Angular 'component' + consommateurs simples
  { type: 'dist-custom-elements' },               // React (requis)
  reactOutputTarget({ outDir: '../react-library/src/components/' }),
  angularOutputTarget({ componentCorePackage: 'stencil-library', outputType: 'component' /* ... */ }),
  { type: 'docs-readme' },
]
```

## Relations

- Wrapper React : [[Stencil — Wrapper React]]
- Wrapper Angular : [[Stencil — Wrapper Angular]]
- Setup : [[Stencil — Setup & Configuration d'un projet]]
