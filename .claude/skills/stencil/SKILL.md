---
name: stencil
description: Build, compile, and ship Web Components with Stencil — authoring components (decorators, JSX, styling, Shadow DOM), all output targets, and generating React + Angular wrapper libraries from a single project. Use when creating Stencil components, porting React components to Web Components, configuring stencil.config.ts, setting up output targets, generating framework wrappers, or scaffolding a Stencil package in this monorepo.
allowed-tools: Read Write Edit Bash WebFetch
metadata:
  author: fubaritico-ds
  version: '1.0'
  stencil-version: 'v4.x (docs v4.43)'
---

# Stencil — Web Components Toolchain

Stencil is a compiler (by the Ionic team) that generates standards-compliant Web Components from
TypeScript + JSX. One Stencil project compiles to **many output formats** (lazy-loaded bundle,
tree-shakeable custom elements, dev app, SSR hydrate script) and **generates native framework
wrapper libraries** (React, Angular, Vue) — each as a separate consumable package.

> **Key mental model**: you author components _once_ as Web Components. The `stencil.config.ts` > `outputTargets` array decides what gets produced. Framework wrappers are _generated code_ written
> into sibling/child directories — you never hand-write them.

## When to use this skill

- Authoring a Stencil component (`@Component`, `@Prop`, `@Event`, `@Method`, lifecycle, JSX)
- Configuring `stencil.config.ts` and choosing output targets
- Generating a **React** wrapper library (`@stencil/react-output-target`)
- Generating an **Angular** wrapper library (`@stencil/angular-output-target`)
- Porting an existing React component (e.g. from `packages/ui`) to a Web Component
- Scaffolding a Stencil package inside this monorepo (`packages/stencil`)
- Testing Stencil components

## Reference files (load on demand)

| File                                   | When to load                                                                                           |
| -------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| `references/01-setup.md`               | Scaffold a project, `stencil.config.ts`, project structure                                             |
| `references/02-component-api.md`       | Decorators (`@Component`/`@Prop`/`@State`/`@Event`/`@Listen`/`@Method`/`@Element`/`@Watch`), lifecycle |
| `references/03-templating-jsx.md`      | JSX, `Host`, slots, conditional/list rendering, forms, functional components                           |
| `references/04-styling.md`             | Shadow DOM vs scoped, CSS variables, `::part`, `::slotted`, modes, global styles                       |
| `references/05-output-targets.md`      | `dist`, `dist-custom-elements`, `www`, `dist-hydrate-script`, loader                                   |
| `references/06-react-wrapper.md`       | React wrapper generation + events→callbacks + SSR + **pitfalls**                                       |
| `references/07-angular-wrapper.md`     | Angular wrapper generation + `ngModel`/CVA + **pitfalls**                                              |
| `references/08-porting-react-to-wc.md` | Mapping React patterns → Stencil (our `packages/ui` → WC)                                              |
| `references/09-testing.md`             | `@stencil/vitest` + `@stencil/playwright` (modern), legacy Jest note                                   |
| `references/10-project-monorepo.md`    | **This repo**: self-contained `packages/stencil` discovery setup                                       |

## Quick start

```bash
# Scaffold a component library (run inside packages/ for a monorepo)
npm init stencil components stencil-library

# Build (produces everything declared in outputTargets)
npm run build
```

Minimal `stencil.config.ts` producing a custom-elements bundle + React + Angular wrappers:

```typescript
import { Config } from '@stencil/core'
import { reactOutputTarget } from '@stencil/react-output-target'
import { angularOutputTarget } from '@stencil/angular-output-target'

export const config: Config = {
  namespace: 'stencil-library',
  outputTargets: [
    { type: 'dist', esmLoaderPath: '../loader' },
    { type: 'dist-custom-elements' }, // required by the React target
    reactOutputTarget({ outDir: '../react-library/src/components/' }),
    angularOutputTarget({
      componentCorePackage: 'stencil-library',
      outputType: 'component',
      directivesProxyFile:
        '../angular-workspace/.../stencil-generated/components.ts',
      directivesArrayFile:
        '../angular-workspace/.../stencil-generated/index.ts',
    }),
  ],
}
```

## Golden rules

1. **`dist-custom-elements` is required for the React wrapper.** `dist` alone is not a substitute.
2. **Public `@Method()` must be `async`.** They are exposed on the host element.
3. **Object/array props can't be set via HTML attributes** — only via JS property assignment.
4. **Event names: camelCase, no special chars** — for clean React/Angular interop.
5. **Shadow DOM styles don't leak in or out** — expose theming via CSS custom properties or `::part()`.
6. **Wrapper packages need a complete `exports` field** in the Stencil lib `package.json`, or consumers hit import errors.
7. **Testing is now `@stencil/vitest` + `@stencil/playwright`** — the old Jest test runner is deprecated (removed in v5).

## Workflow for porting a React component to a WC

1. Read `references/08-porting-react-to-wc.md` for the pattern mapping.
2. Author the `@Component` in `packages/stencil/src/components/<name>/`.
3. Add a spec test (`references/09-testing.md`).
4. `npm run build` → inspect the generated React wrapper in the output dir.
5. Compare the generated wrapper against the hand-written `packages/ui` equivalent.
