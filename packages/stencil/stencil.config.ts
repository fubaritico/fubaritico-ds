import { angularOutputTarget } from '@stencil/angular-output-target'
import { Config } from '@stencil/core'
import { reactOutputTarget } from '@stencil/react-output-target'

export const config: Config = {
  // Préfixe des fichiers générés + nom du dossier dist. Doit être unique par lib.
  namespace: 'ui-stencil',

  // Feuille de styles globale du DS (tokens niveau 1 + variables d'accent + reset).
  // Compilée et émise comme CSS global distribuable. En light DOM (shadow: false), c'est une
  // feuille de page classique : auto-liée dans l'app de dev (www), à importer une fois côté
  // consommateur (import statique React ou <link> HTML). Elle s'applique par cascade. Créée à l'étape suivante.
  globalStyle: 'src/global/ui-stencil.css',

  outputTargets: [
    // 1) Bundle auto-lazy + loader : pour utiliser <ui-button> directement dans une page HTML.
    { type: 'dist', esmLoaderPath: '../loader' },

    // 2) Custom elements tree-shakeables — REQUIS par le wrapper React. Auto-enregistrement à l'import.
    // externalRuntime: false → le runtime Stencil est inliné dans chaque composant (exigé par
    // @stencil/react-output-target 1.x, qui refuse de valider la config sans ça).
    {
      type: 'dist-custom-elements',
      customElementsExportBehavior: 'auto-define-custom-elements',
      externalRuntime: false,
    },

    // 3) Wrapper React généré → on ouvrira dist/react/ pour comparer à packages/reference.
    reactOutputTarget({
      outDir: './dist/react/',
    }),

    // 4) Wrapper Angular généré (standalone, s'appuie sur dist-custom-elements).
    angularOutputTarget({
      componentCorePackage: '@fubaritico-ds/stencil', // doit = "name" du package.json
      outputType: 'standalone',
      directivesProxyFile: './dist/angular/components.ts',
      directivesArrayFile: './dist/angular/index.ts',
    }),

    // 5) Doc auto-générée (readme.md par composant) à partir des JSDoc sur @Prop/@Event/@Method.
    { type: 'docs-readme' },
  ],
}
