# 07 — Angular Wrapper (`@stencil/angular-output-target`)

Generates Angular directive/component wrappers so the Web Components integrate with Angular change
detection, `@Output()` (RxJS), and forms (`ngModel`).

## Compatibility

| `@stencil/angular-output-target` | Angular         |
| -------------------------------- | --------------- |
| `0.10.2`                         | v18.x and lower |
| `1.0.0`                          | v19.x and above |

## Project structure (ng workspace)

```
packages/
├── stencil-library/
└── angular-workspace/
    └── projects/component-library/
        └── src/
            ├── lib/stencil-generated/   # GENERATED components.ts + index.ts
            └── public-api.ts
```

Setup:

```bash
npx -p @angular/cli ng new angular-workspace --no-create-application
cd angular-workspace
npx -p @angular/cli ng generate library component-library
npm uninstall jasmine-core @types/jasmine   # avoid Jest/Jasmine type collisions
```

Add the Stencil lib as a peer dependency of the Angular library:

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
    { type: 'dist' }, // default pairing for outputType: 'component'
    angularOutputTarget({
      componentCorePackage: 'stencil-library', // MUST match the Stencil package.json name
      outputType: 'component',
      directivesProxyFile:
        '../angular-workspace/projects/component-library/src/lib/stencil-generated/components.ts',
      directivesArrayFile:
        '../angular-workspace/projects/component-library/src/lib/stencil-generated/index.ts',
    }),
  ],
}
```

## `outputType` — pick one

| Value          | Pairs with             | Result                                                                                                                        |
| -------------- | ---------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| `'component'`  | `dist`                 | all wrappers in one file; wrappers detached from change detection (no extra repaints); needs the loader via `APP_INITIALIZER` |
| `'scam'`       | `dist-custom-elements` | one Angular module (SCAM) per component; auto-defines elements                                                                |
| `'standalone'` | `dist-custom-elements` | standalone component wrappers (Angular 14+); auto-defines elements; no loader needed                                          |

`dist-custom-elements` variant:

```typescript
outputTargets: [
  { type: 'dist-custom-elements' },
  angularOutputTarget({
    componentCorePackage: 'stencil-library',
    outputType: 'standalone', // or 'scam'
    directivesProxyFile: '.../components.ts',
  }),
]
```

## `angularOutputTarget` options

| Option                              | Notes                                                          |
| ----------------------------------- | -------------------------------------------------------------- |
| `componentCorePackage` _(required)_ | published Stencil package name; drives import paths            |
| `outputType` _(required)_           | `'component' \| 'scam' \| 'standalone'`                        |
| `directivesProxyFile` _(required)_  | generated file with all wrapper definitions                    |
| `directivesArrayFile`               | generated `DIRECTIVES` array for convenient module declaration |
| `customElementsDir`                 | dir of custom elements (default `'components'`)                |
| `excludeComponents`                 | tags to skip (e.g. routing components handled natively)        |
| `valueAccessorConfigs`              | wire up `ngModel`/two-way binding (see below)                  |

## Custom element registration (loader, `dist` + `component`)

```typescript
import { APP_INITIALIZER, NgModule } from '@angular/core'
import { defineCustomElements } from 'stencil-library/loader'

@NgModule({
  providers: [
    {
      provide: APP_INITIALIZER,
      useFactory: () => defineCustomElements,
      multi: true,
    },
  ],
})
export class ComponentLibraryModule {}
```

Using `dist-custom-elements` + `standalone`/`scam` auto-defines the elements, so you can **remove**
this `APP_INITIALIZER` logic. Either way, the wrappers remove the need for `CUSTOM_ELEMENTS_SCHEMA`.

## Forms — `ngModel` via ValueAccessor

```typescript
import { ValueAccessorConfig } from '@stencil/angular-output-target'

const angularValueAccessorBindings: ValueAccessorConfig[] = [
  {
    elementSelectors: ['my-input[type=text]'],
    event: 'myChange',
    targetAttr: 'value',
    type: 'text',
  },
]
// pass to angularOutputTarget({ valueAccessorConfigs: angularValueAccessorBindings })
```

This generates a `ControlValueAccessor` so `[(ngModel)]` / reactive forms work with the component.

## Consuming

```typescript
// NgModule app
@NgModule({ imports: [ComponentLibraryModule] })
export class AppModule {}

// Standalone app (Angular 14+)
@Component({
  standalone: true,
  imports: [MyComponent],
  template: '<my-component first="A"></my-component>',
})
export class AppComponent {}
```

Library exports (`public-api.ts`):

```typescript
export * from './lib/component-library.module'
export { DIRECTIVES } from './lib/stencil-generated'
export * from './lib/stencil-generated/components'
```

## Pitfalls / troubleshooting

- **esbuild glob warning** during `ng build` — known, harmless, cannot be suppressed.
- **Events don't emit across component boundaries** — by design; wrappers convert events to RxJS
  `@Output()` observables on the wrapper itself.
- **`@ViewChild` access** — reference the wrapper class; call methods via `.nativeElement`:
  ```typescript
  @ViewChild(MyComponent) cmp!: ElementRef<MyComponent>
  await this.cmp.nativeElement.someMethod()
  ```
- **Missing type exports** — create `interfaces.d.ts` in the Stencil root re-exporting `./components`,
  and point `package.json` `"types"` at it.
- **Production (Ivy) build errors** — every component declared in the module must also be exported
  from `public-api.ts`.
- **Jasmine/Jest collision** — uninstall `jasmine-core` + `@types/jasmine` from the Angular library.
- **Package linking** — in a Lerna/Nx monorepo skip `npm link`; link before building the Angular lib
  in standalone setups.
