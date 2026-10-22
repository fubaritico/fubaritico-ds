import { angularOutputTarget } from '@stencil/angular-output-target'
import { Config } from '@stencil/core'
import { reactOutputTarget } from '@stencil/react-output-target'

export const config: Config = {
  // Prefix of the generated files + name of the dist folder. Must be unique per library.
  namespace: 'ui-stencil',

  // The DS's global stylesheet (level-1 tokens + accent variables + reset).
  // Compiled and emitted as distributable global CSS. In light DOM (shadow: false) it is a
  // plain page stylesheet: auto-linked in the dev app (www), to import once on the
  // consumer side (static React import or HTML <link>). It applies by cascade. Created at PLAN step 5.
  globalStyle: 'src/global/ui-stencil.css',

  outputTargets: [
    // 1) Auto-lazy bundle + loader: to use <ui-button> directly in an HTML page.
    { type: 'dist', esmLoaderPath: '../loader' },

    // 2) Tree-shakeable custom elements — REQUIRED by the React wrapper. Self-registering on import.
    // externalRuntime: false → the Stencil runtime is inlined into each component (required by
    // @stencil/react-output-target 1.x, which refuses to validate the config without it).
    {
      type: 'dist-custom-elements',
      customElementsExportBehavior: 'auto-define-custom-elements',
      externalRuntime: false,
    },

    // 3) Generated React wrapper → open dist/react/ to compare with packages/reference.
    reactOutputTarget({
      outDir: './dist/react/',
    }),

    // 4) Generated Angular wrapper (standalone, built on dist-custom-elements).
    angularOutputTarget({
      componentCorePackage: '@fubaritico/stencil', // must = the package.json "name"
      outputType: 'standalone',
      directivesProxyFile: './dist/angular/components.ts',
      directivesArrayFile: './dist/angular/index.ts',
    }),

    // 5) Generated docs (a readme.md per component) from the JSDoc on @Prop/@Event/@Method.
    { type: 'docs-readme' },
  ],
}
