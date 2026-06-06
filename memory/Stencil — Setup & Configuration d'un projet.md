---
title: Stencil — Setup & Configuration d'un projet
type: guide
permalink: main/stencil/stencil-setup-configuration-dun-projet
tags:
- stencil
- setup
- config
- package-json
- tsconfig
---

# Stencil — Setup & Configuration d'un projet

> Tous les fichiers de base d'un projet Stencil, avec l'explication de chaque ligne qui compte.
> Issu du journal de mise en place de `packages/stencil` (fubaritico-ds), étapes 1-3 validées.
> Versions vérifiées sur le registre npm le 2026-06-03.

## Scaffold

```bash
npm init stencil
# choisir "component" (library) — PAS "app"
# pour un design system / lib génératrice de wrappers, toujours "components"
# en monorepo, lancer l'init DANS packages/ :
cd packages
npm init stencil components stencil-library
cd stencil-library && npm install
```

## Structure générée

```
stencil-library/
├── stencil.config.ts          # config de build — le cœur de tout
├── package.json
├── tsconfig.json
├── src/
│   ├── components/
│   │   └── my-component/
│   │       ├── my-component.tsx
│   │       ├── my-component.css
│   │       └── test/
│   │           ├── my-component.spec.ts
│   │           └── my-component.e2e.ts
│   ├── index.ts               # barrel — export * from './components/...'
│   ├── components.d.ts        # GÉNÉRÉ — ne pas éditer
│   └── utils/
└── dist/                      # sortie de build (par output target)
```

## Étape 1 — `package.json`

```jsonc
{
  "name": "@fubaritico-ds/stencil", // nom workspace, cohérent avec les autres packages
  "version": "0.0.0",                  // aligné monorepo (Lerna)
  "private": true,                     // sandbox : pas de publication npm
  "type": "module",                    // ESM
  "files": ["dist", "loader"],         // ce qui serait publié un jour
  "scripts": {
    "build": "stencil build",                       // génère tous les output targets
    "dev": "stencil build --dev --watch --serve",   // app de dev Stencil (preview live)
    "test": "stencil test --spec",                  // runner spec intégré
    "test:watch": "stencil test --spec --watchAll",
    "lint": "eslint . --max-warnings 0"
  },
  "dependencies": {
    "@stencil/core": "^4.43.5"                       // compilateur + runtime
  },
  "devDependencies": {
    "@stencil/angular-output-target": "^1.3.1",      // génère le wrapper Angular
    "@stencil/react-output-target": "^1.5.3",        // génère le wrapper React
    "@types/react": "catalog:",
    "@types/react-dom": "catalog:",
    "@fubaritico-ds/tokens": "workspace:*",       // tokens (CSS variables niveau 1)
    "react": "catalog:",
    "react-dom": "catalog:"                          // peer du react-output-target 1.x
  }
}
```

**À retenir :**
- `@stencil/core` est en **`dependencies`** (pas devDeps) : le bundle `dist-custom-elements` référence
  le runtime Stencil — convention pour une lib de composants.
- `reference`/`react-dom` en **devDeps** : le `react-output-target` **1.x** les déclare en peerDeps
  (`react ^18 || ^19`). Servent uniquement à générer/typer les wrappers, pas à exécuter les WC.

**Versions vérifiées (npm, 2026-06-03) :**

| Paquet                           | Version | Note                                              |
| -------------------------------- | ------- | ------------------------------------------------- |
| `@stencil/core`                  | `4.43.5`| = version de la doc utilisée (v4.43)              |
| `@stencil/react-output-target`   | `1.5.3` | major 1.x ; peer `react ^18 \|\| ^19`             |
| `@stencil/angular-output-target` | `1.3.1` | major 1.x (Angular 19+) ; peer = `@stencil/core`  |

## Étape 2 — `tsconfig.json` (fichier clé de l'ISOLATION)

La config TS de Stencil **diffère** de celle de React. Les 2 modes JSX sont incompatibles.

```jsonc
{
  "compilerOptions": {
    "experimentalDecorators": true,  // INDISPENSABLE : @Component, @Prop, @Event… sont des décorateurs
    "jsx": "react",                  // Stencil n'utilise PAS "react-jsx"
    "jsxFactory": "h",               // le JSX se compile vers h() (fabrique Stencil)
    "jsxFragmentFactory": "Fragment",// <>…</> → Fragment de @stencil/core
    "target": "es2017",
    "module": "esnext",
    "moduleResolution": "node",
    "lib": ["dom", "es2017"],
    "allowSyntheticDefaultImports": true,
    "declaration": false,            // les .d.ts sont produits par les output targets, pas ici
    "noUnusedLocals": true,
    "noUnusedParameters": true
  },
  "include": ["src"],
  "exclude": ["node_modules", "dist"]
}
```

**Les 3 lignes qui comptent :**
- `experimentalDecorators: true` → sans ça, `@Component()` ne compile pas.
- `jsx: "react"` + `jsxFactory: "h"` → LA différence avec un repo React : ici `<div>` devient
  `h('div', …)`, pas le `_jsx(...)` de React.
- **N'étend PAS** le tsconfig racine React (`jsx: "react-jsx"`). L'autonomie garantit que Stencil et
  React ne se polluent pas.

> ⚠️ Piège constaté : `include: ["src"]` alors que `src/` n'existe pas encore → `error TS18003: No
> inputs were found` → casse l'ESLint typé de TOUT le repo (« Unable to parse tsconfig ») → bloque
> tout commit via le hook pre-commit. Résolu dès que `src/` existe (créer un composant ou un
> `.gitkeep`). Sur un projet autonome dédié Stencil, ce piège disparaît (pas de hook partagé).

## Étape 3 — `stencil.config.ts` (le cœur : les output targets)

Un seul fichier décide **ce qui est produit**. Un projet → plusieurs sorties.

```typescript
import { Config } from '@stencil/core'
import { reactOutputTarget } from '@stencil/react-output-target'
import { angularOutputTarget } from '@stencil/angular-output-target'

export const config: Config = {
  namespace: 'ui-stencil',                       // préfixe fichiers générés + dossier dist (unique par lib)
  globalStyle: 'src/global/ui-stencil.css',      // feuille globale (tokens + accent + reset)

  outputTargets: [
    // 1) bundle auto-lazy + loader : <ui-button> utilisable directement dans une page HTML
    { type: 'dist', esmLoaderPath: '../loader' },

    // 2) custom elements tree-shakeables — REQUIS par le wrapper React (dist seul ne suffit pas)
    {
      type: 'dist-custom-elements',
      customElementsExportBehavior: 'auto-define-custom-elements',
    },

    // 3) wrapper React généré → dist/react/ (à comparer à packages/ui)
    reactOutputTarget({ outDir: './dist/react/' }),

    // 4) wrapper Angular généré (standalone, s'appuie sur dist-custom-elements)
    angularOutputTarget({
      componentCorePackage: '@fubaritico-ds/stencil', // doit = "name" du package.json
      outputType: 'standalone',
      directivesProxyFile: './dist/angular/components.ts',
      directivesArrayFile: './dist/angular/index.ts',
    }),

    // 5) doc auto-générée (readme.md par composant) à partir des JSDoc
    { type: 'docs-readme' },
  ],
}
```

**À retenir :**
- `dist-custom-elements` est **obligatoire** dès qu'on veut le wrapper React — `dist` seul ne suffit pas.
- `outputType: 'standalone'` (Angular) s'appuie sur `dist-custom-elements`, génère des composants
  standalone (Angular 14+), sans loader ni `CUSTOM_ELEMENTS_SCHEMA`.
- `componentCorePackage` doit correspondre **exactement** au `name` du `package.json`, sinon les
  imports des wrappers générés sont faux.
- `globalStyle` doit pointer vers un fichier qui **existe** — sinon `stencil build` casse.
- `dist/react` et `dist/angular` sont des **artefacts à lire/comparer**, pas des packages installables
  (dans cette itération).

## `package.json` exports (CRITIQUE — golden rule #6)

La lib Stencil doit déclarer une `exports` complète, sinon wrappers + consommateurs ont des erreurs de
résolution d'import :

```json
{
  "exports": {
    ".": {
      "import": "./dist/stencil-library/stencil-library.esm.js",
      "require": "./dist/stencil-library/stencil-library.cjs.js"
    },
    "./dist/*": { "import": "./dist/*", "types": "./dist/*" },
    "./components/*": { "import": "./dist/components/*.js", "types": "./dist/components/*.d.ts" },
    "./loader": { "import": "./loader/index.js", "require": "./loader/index.cjs", "types": "./loader/index.d.ts" }
  }
}
```

## Choix du runner de test

On utilise **`stencil test --spec`** (runner spec intégré à `@stencil/core`, basé Jest) plutôt que
`@stencil/vitest`. Raisons : aucune dépendance supplémentaire ; zéro collision (`*.spec.tsx` vs le
`vitest run` racine qui cible `*.test.tsx`) ; build vert plus sûr pour une 1re itération.

> ⚠️ Note : sur Stencil v4→v5, le runner Jest (`stencil test`) est **déprécié, retiré en v5**. Le stack
> recommandé est `@stencil/vitest` (unit/spec) + `@stencil/playwright` (e2e). Voir [[Stencil — Testing]].
> Sur un projet autonome neuf, partir directement sur `@stencil/vitest` est plus pérenne.

## CLI

```bash
stencil build              # build one-off
stencil build --watch      # rebuild on change
stencil build --dev        # non minifié, plus rapide
stencil build --prod       # production
stencil generate <tag>     # scaffold un nouveau composant
stencil test --spec        # (legacy) spec tests
stencil test --e2e         # (legacy) e2e tests
```

## Relations

- Concepts préalables : [[Stencil — Concepts Web Components (avant de coder)]]
- API des composants : [[Stencil — API des composants (décorateurs & lifecycle)]]
- Output targets détaillés : [[Stencil — Output Targets]]
- Wrappers : [[Stencil — Wrapper React]] · [[Stencil — Wrapper Angular]]
