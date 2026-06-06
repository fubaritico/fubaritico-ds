---
title: Stencil — Wrapper React
type: guide
permalink: main/stencil/stencil-wrapper-react
tags:
- stencil
- react
- wrapper
- output-target
- ssr
---

# Stencil — Wrapper React (`@stencil/react-output-target`)

> Génère de **vrais composants React** qui enveloppent les Web Components — props, refs et events
> deviennent idiomatiques React. On ne les écrit jamais à la main ; le build les régénère.

## Compatibilité

- React ≥ 17 · TypeScript ≥ 5 · Stencil ≥ 4.2.0
- Le `tsconfig.json` de la lib React **doit** avoir `"moduleResolution": "bundler"` (+ `"module": "esnext"`).

## Structure (packages siblings)

```
packages/
├── stencil-library/   # source — stencil.config.ts écrit les wrappers dans ../react-library
└── react-library/     # composants React générés ; package.json + build tsc propres
```

## stencil.config.ts

```typescript
import { reactOutputTarget } from '@stencil/react-output-target'

export const config: Config = {
  namespace: 'stencil-library',
  outputTargets: [
    reactOutputTarget({ outDir: '../react-library/src/components/stencil-generated/' }),
    { type: 'dist-custom-elements' }, // REQUIS — dist seul ne marche pas
  ],
}
```

## Options `reactOutputTarget`

| Option                          | Type                              | Notes                                                          |
| ------------------------------- | --------------------------------- | -------------------------------------------------------------- |
| `outDir` _(requis)_             | `string`                          | où les wrappers sont générés (relatif à la racine Stencil)     |
| `stencilPackageName`            | `string`                          | nom du package exportant les WC ; défaut = nom détecté         |
| `customElementsDir`             | `string`                          | dir des custom elements ; auto-détecté                         |
| `excludeComponents`             | `string[]`                        | tags à ignorer                                                 |
| `esModules`                     | `boolean` (défaut `true`)         | un ES module séparé par wrapper                                |
| `hydrateModule`                 | `string`                          | active le SSR Next.js (ex `'stencil-library/hydrate'`)         |
| `excludeServerSideRenderingFor` | `string[]`                        | tags exclus du SSR (browser-only)                              |
| `serializeShadowRoot`           | `'declarative-shadow-dom'\|'scoped'\|object\|false` | stratégie de sérialisation shadow SSR     |

## `package.json` lib React

```json
{
  "main": "dist/index.js",
  "module": "dist/index.js",
  "types": "dist/types/index.d.ts",
  "scripts": { "build": "tsc -p . --outDir ./dist" },
  "files": ["dist"],
  "dependencies": { "stencil-library": "*" }
}
```
Entrée (`src/index.ts`) : `export * from './components/stencil-generated/components'`

## Mapping props & events

```tsx
// Stencil:  @Prop() variant; @Event() buttonClick: EventEmitter<void>
import { MyButton, MyInput } from 'react-library'

function App() {
  const [value, setValue] = useState('')
  return (
    <>
      <MyInput value={value} onInputChange={(e) => setValue(e.detail.value)} />
      <MyButton variant="primary" onButtonClick={() => console.log('Clicked!')}>Submit</MyButton>
    </>
  )
}
```
- `@Prop()` → prop React (même nom).
- `@Event({ eventName: 'buttonClick' })` → callback `onButtonClick` ; **le payload est dans `e.detail`**, pas la forme synthetic-event de React.
- Le wrapper attache les listeners DOM et set les props non-attribut (objet/array) comme propriétés — résout le problème « props complexes ≠ attributs » pour toi.

## SSR / Next.js (App Router)

1. Ajouter `{ type: 'dist-hydrate-script', dir: './hydrate' }` aux output targets.
2. Set `hydrateModule: 'stencil-library/hydrate'` sur `reactOutputTarget`.
3. Choisir `serializeShadowRoot` (`'declarative-shadow-dom'` pour DSD, `'scoped'` pour hydratation client).
4. Optionnel : `excludeServerSideRenderingFor: ['needs-browser-el']`.

## Build & consommer

```bash
cd packages/stencil-library && npm run build  # 1. régénère les wrappers React
cd ../react-library && npm run build          # 2. build la lib React
# 3. import { MyComponent } from 'react-library'
```

## Pièges / troubleshooting

- **Erreurs d'import dans `components.ts`** → champ `exports` incomplet dans le package.json de la lib Stencil.
- **Échecs de résolution de module** → tsconfig React sans `"moduleResolution": "bundler"`.
- **« dist suffit ? »** → Non. `dist-custom-elements` obligatoire.
- **TypeScript < 5** → la résolution de types échoue. Mettre à jour.
- **Events vides** → lire `e.detail`, pas l'objet event React.
- **Caractères spéciaux dans les noms d'events** → cassent l'interop ; camelCase dans `@Event`.
- **Oubli de re-export** des composants générés depuis `index.ts` → consommateurs ne peuvent pas importer.

## Relations

- Output targets : [[Stencil — Output Targets]]
- Wrapper Angular : [[Stencil — Wrapper Angular]]
- Port React→WC : [[Stencil — Porter un composant React vers un Web Component]]
