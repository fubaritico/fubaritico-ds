---
title: Stencil — Wrapper Angular
type: guide
permalink: main/stencil/stencil-wrapper-angular
tags:
- stencil
- angular
- wrapper
- output-target
- ngmodel
---

# Stencil — Wrapper Angular (`@stencil/angular-output-target`)

> Génère des wrappers directive/composant Angular pour intégrer les WC à la change detection Angular,
> `@Output()` (RxJS) et les formulaires (`ngModel`).

## Compatibilité

| `@stencil/angular-output-target` | Angular         |
| -------------------------------- | --------------- |
| `0.10.2`                         | v18.x et moins  |
| `1.0.0`                          | v19.x et plus   |

## Structure (ng workspace)

```
packages/
├── stencil-library/
└── angular-workspace/
    └── projects/component-library/src/
        ├── lib/stencil-generated/   # GÉNÉRÉ components.ts + index.ts
        └── public-api.ts
```
Setup :
```bash
npx -p @angular/cli ng new angular-workspace --no-create-application
cd angular-workspace
npx -p @angular/cli ng generate library component-library
npm uninstall jasmine-core @types/jasmine   # éviter collisions de types Jest/Jasmine
```
Ajouter la lib Stencil en peer dep de la lib Angular :
```json
"peerDependencies": {
  "@angular/common": "^15.1.0",
  "@angular/core": "^15.1.0",
  "stencil-library": "*"
}
```

## stencil.config.ts

```typescript
import { angularOutputTarget } from '@stencil/angular-output-target'

export const config: Config = {
  namespace: 'stencil-library',
  outputTargets: [
    { type: 'dist' }, // pairing par défaut pour outputType: 'component'
    angularOutputTarget({
      componentCorePackage: 'stencil-library', // DOIT matcher le name du package.json Stencil
      outputType: 'component',
      directivesProxyFile: '../angular-workspace/projects/component-library/src/lib/stencil-generated/components.ts',
      directivesArrayFile: '../angular-workspace/projects/component-library/src/lib/stencil-generated/index.ts',
    }),
  ],
}
```

## `outputType` — en choisir un

| Valeur         | S'associe à             | Résultat                                                                                       |
| -------------- | ----------------------- | ---------------------------------------------------------------------------------------------- |
| `'component'`  | `dist`                  | tous les wrappers dans un fichier ; détachés de la change detection ; loader via `APP_INITIALIZER` |
| `'scam'`       | `dist-custom-elements`  | un module Angular (SCAM) par composant ; auto-define                                            |
| `'standalone'` | `dist-custom-elements`  | wrappers standalone (Angular 14+) ; auto-define ; pas de loader                                 |

```typescript
outputTargets: [
  { type: 'dist-custom-elements' },
  angularOutputTarget({
    componentCorePackage: 'stencil-library',
    outputType: 'standalone', // ou 'scam'
    directivesProxyFile: '.../components.ts',
  }),
]
```

## Options `angularOutputTarget`

| Option                              | Notes                                                          |
| ----------------------------------- | -------------------------------------------------------------- |
| `componentCorePackage` _(requis)_   | nom du package Stencil publié ; pilote les chemins d'import     |
| `outputType` _(requis)_             | `'component' \| 'scam' \| 'standalone'`                        |
| `directivesProxyFile` _(requis)_    | fichier généré avec toutes les définitions de wrappers          |
| `directivesArrayFile`               | array `DIRECTIVES` généré pour déclaration de module pratique   |
| `customElementsDir`                 | dir des custom elements (défaut `'components'`)                 |
| `excludeComponents`                 | tags à ignorer                                                  |
| `valueAccessorConfigs`              | câbler `ngModel`/two-way binding                                |

## Enregistrement (loader, `dist` + `component`)

```typescript
import { APP_INITIALIZER, NgModule } from '@angular/core'
import { defineCustomElements } from 'stencil-library/loader'

@NgModule({
  providers: [{ provide: APP_INITIALIZER, useFactory: () => defineCustomElements, multi: true }],
})
export class ComponentLibraryModule {}
```
Avec `dist-custom-elements` + `standalone`/`scam`, l'auto-define rend ce `APP_INITIALIZER` inutile.
Dans tous les cas, les wrappers suppriment le besoin de `CUSTOM_ELEMENTS_SCHEMA`.

## Formulaires — `ngModel` via ValueAccessor

```typescript
import { ValueAccessorConfig } from '@stencil/angular-output-target'
const angularValueAccessorBindings: ValueAccessorConfig[] = [
  { elementSelectors: ['my-input[type=text]'], event: 'myChange', targetAttr: 'value', type: 'text' },
]
// passer à angularOutputTarget({ valueAccessorConfigs: angularValueAccessorBindings })
```
Génère un `ControlValueAccessor` → `[(ngModel)]` / reactive forms marchent.

## Consommer

```typescript
// NgModule
@NgModule({ imports: [ComponentLibraryModule] })
export class AppModule {}

// Standalone (Angular 14+)
@Component({ standalone: true, imports: [MyComponent], template: '<my-component first="A"></my-component>' })
export class AppComponent {}
```
`public-api.ts` :
```typescript
export * from './lib/component-library.module'
export { DIRECTIVES } from './lib/stencil-generated'
export * from './lib/stencil-generated/components'
```

## Pièges / troubleshooting

- **Warning esbuild glob** durant `ng build` — connu, sans danger, non supprimable.
- **Events n'émettent pas entre composants** — by design ; les wrappers convertissent en `@Output()` RxJS.
- **Accès `@ViewChild`** — référencer la classe wrapper ; appeler via `.nativeElement` :
  `@ViewChild(MyComponent) cmp!: ElementRef<MyComponent>; await this.cmp.nativeElement.someMethod()`
- **Exports de types manquants** — créer `interfaces.d.ts` à la racine Stencil re-exportant `./components`, pointer `package.json` `"types"` dessus.
- **Erreurs build prod (Ivy)** — chaque composant déclaré dans le module doit aussi être exporté depuis `public-api.ts`.
- **Collision Jasmine/Jest** — désinstaller `jasmine-core` + `@types/jasmine` de la lib Angular.
- **Linking de package** — en monorepo Lerna/Nx, skip `npm link`.

## Relations

- Output targets : [[Stencil — Output Targets]]
- Wrapper React : [[Stencil — Wrapper React]]
