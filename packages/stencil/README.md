# @fubaritico-ds/stencil

Sandbox **Stencil** : socle d'un **design system** en Web Components, stylé en **BEM** avec des
styles **overridables** (light DOM + variables CSS), alimenté par `@fubaritico-ds/tokens`.
On y porte quelques composants de `packages/reference` (React/Tailwind) pour les **comparer** au code
généré, et pour découvrir comment Stencil compile et génère des wrappers **React** et **Angular**
à partir d'un seul projet.

> Ce README contient aussi, pour l'instant, le **journal de mise en place pas à pas** avec les
> explications de chaque fichier. On en déplacera une partie plus tard dans une doc dédiée.

---

## Comprendre les Web Components avant de coder

> Cette partie est volontairement **conceptuelle** : avant de porter un composant, il faut savoir
> comment un Web Component « pense ». Tout le reste (le port des `Tabs`, du `Menu`…) découle de ces
> quatre idées.

### 1. « Composant Stencil » vs « Web Component » — ce ne sont pas deux camps

Le piège de vocabulaire le plus courant. Il faut distinguer **deux axes**.

**Axe A — Stencil n'est pas un concurrent du Web Component, c'est une _usine à_ Web Components.**
Contrairement à React (qui s'exécute via un runtime `react-dom` à côté), Stencil est un **compilateur** :
on écrit une classe confortable (décorateurs + JSX), il **génère** un vrai custom element natif,
utilisable partout (HTML pur, Vue, Angular).

```
   Ce que TU écris (source)            Ce que Stencil PRODUIT (artefact)
   ───────────────────────            ─────────────────────────────────
   @Component({ tag: 'ui-tab' })  ──►  class UiTab extends HTMLElement { … }
   class UiTab {                       customElements.define('ui-tab', UiTab)
     @State() active = false           + un petit runtime réactif (VDOM)
     render() { return <Host/> }
   }
```

Donc « composant Stencil » = le **code source** ; « Web Component » = le **résultat compilé**.
Source → produit, pas deux écoles opposées.

**Axe B — La vraie différence : WC écrit « à la main » vs WC compilé par Stencil.**

|            | **WC natif vanilla**                      | **Composant Stencil**                             |
| ---------- | ----------------------------------------- | ------------------------------------------------- |
| Classe     | `class X extends HTMLElement` à la main   | `extends HTMLElement` **généré**                  |
| Rendu      | on manipule le DOM soi-même               | **JSX** + **VDOM diff** automatique               |
| Réactivité | **aucune** (on re-dessine à la main)      | `@State`/`@Prop` change → **re-render auto**      |
| État       | piloté par **attributs** (`getAttribute`) | propriétés typées (`@Prop`, `@State`)             |
| Lifecycle  | 4 callbacks natifs                        | ces 4 **+ ~6 hooks réactifs**                     |
| Événements | `dispatchEvent(new CustomEvent(...))`     | `@Event()` typé (→ génère aussi le wrapper React) |
| Coût       | 0 Ko                                      | petit runtime Stencil (~quelques Ko)              |

En une phrase : le WC natif donne un **squelette pauvre** (4 callbacks, état = attributs, rendu manuel) ;
Stencil pose **par-dessus** une couche réactive « façon React » **sans renoncer au standard**. C'est
exactement « la pauvreté du cycle de vie » dont parlent les gens : ils décrivent la colonne de gauche.

**Axe C — Piège _interne_ à Stencil.** Une classe `@Component` → vrai WC. Un `FunctionalComponent`
→ simple helper de rendu **inliné au compile-time** (aucun élément DOM, pas de lifecycle).

### 2. La règle d'or : « props down, events up » 🔑

**C'est LE point à intégrer.** Un Web Component communique dans **deux sens, par deux canaux différents** —
et c'est _mot pour mot_ le modèle de Vue (`props` / `$emit`).

```
        ┌─────────────────────────┐
        │      <ui-tabs>          │  ← le PARENT
        │   (détient l'état)      │
        └─────────────────────────┘
            │  ▲
  top-down  │  │  bottom-up
  (props /  │  │  (events /
  attributs)│  │   émission)
            ▼  │
        ┌─────────────────────────┐
        │     <ui-tab>            │  ← l'ENFANT
        └─────────────────────────┘
```

- **TOP-DOWN — les _props_ descendent.** Le parent passe une donnée à l'enfant via un attribut/propriété
  (`active`, `value`…). L'enfant la **reçoit** et l'affiche. Sens : **parent → enfant**.
- **BOTTOM-UP — les _events_ remontent.** L'enfant ne modifie **jamais** son parent directement. Il
  **émet** un événement (« on m'a cliqué »), qui **remonte** l'arbre du DOM (`bubbles`). Le parent
  **écoute** et réagit. Sens : **enfant → parent**.

**Pourquoi cette asymétrie ?** Parce que le DOM est un **arbre**. Une donnée qu'on passe en attribut
descend naturellement ; un événement, par nature, **bouillonne vers le haut** (`bubbling`). Les WC
épousent ce sens naturel — au lieu de laisser l'enfant « tripoter » le parent.

**Le parallèle Vue, terme à terme :**

| Intention                    | Vue.js                      | Web Component / Stencil            | Sens        |
| ---------------------------- | --------------------------- | ---------------------------------- | ----------- |
| Donner une valeur à l'enfant | `props`                     | attribut / `@Prop()`               | top-down ↓  |
| Prévenir le parent           | `this.$emit('change', val)` | `this.change.emit(val)` (`@Event`) | bottom-up ↑ |
| Réagir côté parent           | `@change="onChange"`        | `@Listen('change')`                | bottom-up ↑ |
| Recevoir la donnée           | `event.payload`             | `event.detail`                     | bottom-up ↑ |

> **À retenir :** en WC, l'enfant **n'écrit jamais** dans le parent. Il **émet**, et c'est le parent
> qui décide quoi faire. Cette discipline (« events up ») est ce qui rend les composants réutilisables
> et découplés — exactement la philosophie Vue. La verbosité en plus (vs le Context React) est le prix
> de ce découplage.

### 3. Compound component en WC : slots + events + `@Listen` / `@Method`

Un _compound_ (`Tabs` + `Tab`, `Menu` + `Menu.Item`) a besoin que parent et enfants collaborent.
Sans Context (voir §4), on assemble **4 outils**, chacun rattaché à un sens de communication :

| Outil           | Rôle                                                                                | Sens                   |
| --------------- | ----------------------------------------------------------------------------------- | ---------------------- |
| **`<slot>`**    | l'emplacement où le parent accueille les enfants (= `{children}` / `<slot>` de Vue) | composition            |
| **`@Event()`**  | l'enfant émet un message                                                            | bottom-up ↑            |
| **`@Listen()`** | le parent écoute ces messages                                                       | bottom-up ↑            |
| **`@Method()`** | le parent appelle une fonction publique de l'enfant (« mets-toi en surbrillance »)  | top-down ↓ (impératif) |

```tsx
// PARENT <ui-tabs>
@Listen('tabSelect')                       // ↑ il écoute la remontée
onTabSelect(e: CustomEvent<string>) { this.value = e.detail }
render() { return <Host role="tablist"><slot/></Host> }   // les <ui-tab> sont slottés

// ENFANT <ui-tab>
@Prop() value: string
@Event() tabSelect: EventEmitter<string>   // ↑ il crie vers le haut
render() {
  return <Host role="tab" onClick={() => this.tabSelect.emit(this.value)}><slot/></Host>
}
```

### 4. Reproduire le Context : 3 stratégies (et pourquoi le Context est, lui aussi, bottom-up en WC)

Le Context React/Vue (`useContext` / `provide`+`inject`) sert à **sauter des niveaux** : partager une
donnée avec des descendants lointains **sans la faire transiter** par chaque enfant intermédiaire.
Le DOM n'a pas cette « magie ». On la reconstruit avec l'une de 3 stratégies :

| Stratégie                           | Mécanisme                                                       | Sens     | Pour quoi                            |
| ----------------------------------- | --------------------------------------------------------------- | -------- | ------------------------------------ |
| **Top-down par props**              | le parent passe l'état actif à chaque enfant                    | ↓        | `value` (quel onglet est actif)      |
| **Bottom-up par events**            | l'enfant émet « clic » / « je m'enregistre » ; le parent écoute | ↑        | clic, registre des triggers          |
| **Context Protocol** (standard W3C) | l'enfant **demande** un contexte, un ancêtre **répond**         | ↑ puis ↓ | l'équivalent fidèle du Context React |

**Le point qui éclaire tout :** en React/Vue, le partage de contexte est **top-down** — le `Provider`
_enveloppe_ et _pousse_ la valeur vers le bas. En **Web Components, il n'y a pas de Provider qui
enveloppe** ; alors le standard inverse le sens : **c'est l'enfant qui réclame, et sa demande remonte**
(`bubbles` + `composed`). Donc **même le Context, en WC, démarre par une émission bottom-up.** C'est la
suite logique de la §2 : tout, ici, commence par un événement qui remonte.

Voici le cœur réel de `@lit/context` (récupéré dans `opensrc/`) — le standard tient dans **un événement** :

```ts
// @lit/context — context-request-event.ts (l'essentiel)
export class ContextRequestEvent extends Event {
  readonly context // la "clé" du contexte demandé
  readonly callback // (value, unsubscribe?) => void  → par où la valeur ARRIVE
  readonly subscribe // veut-on les mises à jour futures ?
  constructor(context, contextTarget, callback, subscribe?) {
    super('context-request', { bubbles: true, composed: true }) // ⬅ il REMONTE
    // …
  }
}
```

Le flux, en 4 temps :

```
1. ENFANT (consumer)  →  dispatchEvent(new ContextRequestEvent(tabsCtx, el, cb, true))
2. l'event REMONTE       bubbles:true + composed:true  → franchit même le shadow DOM      ↑
3. ANCÊTRE (provider) →  @Listen('context-request'): if (e.context === tabsCtx) e.callback(this.value, unsub)
4. la valeur ARRIVE      via cb ; si subscribe:true, le provider rappelle cb à CHAQUE changement  ↓
```

Correspondance terme à terme avec React :

| React Context           | Context Protocol (WC)                         | Vue            |
| ----------------------- | --------------------------------------------- | -------------- |
| `createContext(key)`    | `createContext('tabs')`                       | clé d'`inject` |
| `<Provider value={…}>`  | un ancêtre écoute `context-request` et répond | `provide()`    |
| `useContext(Ctx)`       | l'enfant émet `context-request`               | `inject()`     |
| re-render au changement | `subscribe:true` → rappel du `callback`       | réactivité     |

> **Décision pour notre sandbox :** Stencil **n'a pas** de système de contexte intégré. Sa réponse
> « maison » au compound est **events + `@Listen`** (+ `@Method`). Le Context Protocol, lui, est
> _framework-agnostic_ : on pourra l'ajouter par-dessus Stencil si un cas l'exige. Sur les `Tabs`, on
> commencera **sans** contexte (props down + events up), puis on jugera si le registre clavier justifie
> le Context Protocol.

### 5. Peut-on étendre l'usine ? (décorateurs fermés vs plugins & output targets)

Question naturelle quand on a compris que Stencil est une **usine à Web Components** (§1) : peut-on la
prolonger pour qu'elle fasse « plus de transformations » ? **Oui — mais pas en ajoutant des
décorateurs.** C'est le point qui surprend.

**Les décorateurs sont une liste _fermée_, et ce ne sont même pas de vrais décorateurs.** Le
compilateur ne reconnaît que ces 11 marqueurs (`STENCIL_DECORATORS`) :

```
Component · Prop · State · Watch · Event · Listen · Method · Element
· AttachInternals · AttrDeserialize · PropSerialize
```

Ils ne **s'exécutent jamais** au runtime : le compilateur les **lit dans l'AST TypeScript**, les
convertit en _static getters_, puis **les retire** du code généré (`CLASS_DECORATORS_TO_REMOVE` /
`MEMBER_DECORATORS_TO_REMOVE`). Ce sont des **annotations de compilation**, pas du code. Inventer un
`@MonDécorateur` que Stencil comprendrait imposerait de **forker le compilateur**.

**Les deux vrais points d'extension** sont ailleurs :

| Levier                                      | Ce que c'est                                                                                                               | Ce que tu étends                                         |
| ------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------- |
| **`config.plugins`**                        | des **plugins Rollup** (+ preprocesseurs CSS : sass, postcss)                                                              | la **transformation de l'entrée** (code/styles au build) |
| **Custom Output Target** (`type: 'custom'`) | une fonction `generator(config, compilerCtx, buildCtx, docs)` recevant **les métadonnées de tous les composants compilés** | la **génération de sorties** (nouveaux artefacts)        |

```ts
// declarations/stencil-public-compiler.ts — l'interface réelle
export interface OutputTargetCustom {
  type: 'custom'
  name: string
  generator: (config, compilerCtx, buildCtx, docs) => Promise<void> // ← reçoit les métadonnées, génère ce qu'il veut
  validate?: (config, diagnostics) => void
}
```

**La preuve que l'usine est bien extensible :** `reactOutputTarget` et `angularOutputTarget` **ne sont
pas des features intégrées magiques — ce sont des custom output targets.** Ils branchent un
`generator`, lisent les props/events/méthodes (via les JSDoc), et **produisent une lib React /
Angular**. Donc pour générer demain un wrapper Vue, de la doc maison ou des types pour un autre
framework → on écrit **son propre** custom output target. C'est exactement ça, « étendre l'usine ».

> **Reformulation :** ❌ _« ajouter des décorateurs pour plus de transformations »_ →
> ✅ _« brancher un plugin (transformer l'entrée) ou un custom output target (générer de nouvelles
> sorties) »_. Le jeu de décorateurs est figé ; la chaîne de build et de génération, elle, est ouverte.

---

## Journal de mise en place (par étape)

### Étape 1 — `package.json`

```jsonc
{
  "name": "@fubaritico-ds/stencil", // nom workspace, cohérent avec les autres packages
  "version": "0.0.0", // aligné sur le monorepo (Lerna)
  "private": true, // sandbox : on ne publie pas sur npm
  "type": "module", // ESM, comme packages/reference
  "files": ["dist", "loader"], // ce qui serait publié un jour (non utilisé tant que private)

  "scripts": {
    "build": "stencil build", // génère tous les output targets
    "dev": "stencil build --dev --watch --serve", // app de dev Stencil (preview live)
    "test": "vitest run --passWithNoTests", // @stencil/vitest (voir « Tests »)
    "test:watch": "vitest --passWithNoTests",
    "type-check": "tsc --noEmit -p tsconfig.eslint.json", // ajouté étape 4
    "lint": "eslint . --max-warnings 0", // résout la config flat racine (override stencil)
  },

  "dependencies": {
    "@stencil/core": "^4.43.5", // compilateur + runtime
  },
  "devDependencies": {
    "@stencil/angular-output-target": "^1.3.1", // génère le wrapper Angular
    "@stencil/react-output-target": "^1.5.3", // génère le wrapper React
    "@stencil/vitest": "^1.12.1", // runner de test (voir « Tests »)
    "react": "catalog:",
    "react-dom": "catalog:", // peer du target React 1.x (génération typée)
    "@types/react": "catalog:",
    "@types/react-dom": "catalog:",
    "@fubaritico-ds/tokens": "workspace:*", // niveau 1 des CSS variables (tokens)
    "vitest": "^3.1.2", // aligné sur le vitest racine
  },
}
```

> Les champs `exports` / `main` / `module` / `types` / `customElements` ainsi que le `type-check`
> sont ajoutés à l'**étape 4** (intégration toolchain) — voir le PLAN.

À retenir :

- **`@stencil/core` est en `dependencies`** (pas devDeps) : le bundle `dist-custom-elements`
  référence le runtime Stencil — convention pour une lib de composants.
- **`react`/`react-dom` en devDeps** : le `@stencil/react-output-target` **1.x** les déclare en
  `peerDependencies` (`react: ^18 || ^19`). Ils servent uniquement à générer/typer les wrappers,
  pas à exécuter les composants (qui sont des Web Components natifs).

**Vérification des versions (registre npm, le 2026-06-03) :**

| Paquet                           | Version retenue | Note                                                   |
| -------------------------------- | --------------- | ------------------------------------------------------ |
| `@stencil/core`                  | `4.43.5`        | = la version de la doc utilisée (v4.43)                |
| `@stencil/react-output-target`   | `1.5.3`         | major 1.x ; peer `react ^18 \|\| ^19`                  |
| `@stencil/angular-output-target` | `1.3.1`         | major 1.x (cible Angular 19+) ; peer = `@stencil/core` |

### Tests — choix du runner

On utilise **`@stencil/vitest`** (le plan initial — confirmé bon). L'idée première d'utiliser le runner
« intégré » `stencil test --spec` reposait sur deux prémisses **fausses**, vérifiées à l'exécution sur
`@stencil/core@4.43.5` :

- ❌ « aucune dépendance supplémentaire / livré avec `@stencil/core` » → faux : la commande exige
  d'installer `jest@29` + `@types/jest@29` + `jest-cli@29` (sinon erreur au lancement) ;
- ❌ « solution pérenne » → faux : `stencil test --spec` (et les flags `--spec`/`--e2e`) sont
  **dépréciés** en v4.43 et **supprimés en v5** ; Stencil redirige officiellement vers `@stencil/vitest`
  (cf. `stenciljs/core#6584`).

Côté collision : l'argument « `*.spec.tsx` vs `*.test.tsx` » était lui aussi caduc — c'est le
`vitest.config.ts` racine avec `projects: ['packages/*']` qui décide. On en tire parti : la
`vitest.config.ts` du package est **auto-découverte** par le `vitest run` racine (pas de modif du script
`test` racine). Specs en `*.spec.{ts,tsx}`, environnement `stencil`. La config complète + le 1er spec
arrivent à l'étape 6.

### Étape 2 — `tsconfig.json`

C'est le fichier clé de l'**isolation** : la config TypeScript de Stencil diffère de celle de React.

```jsonc
{
  "compilerOptions": {
    "experimentalDecorators": true, // indispensable : @Component, @Prop, @Event… sont des décorateurs
    "jsx": "react", // Stencil n'utilise PAS "react-jsx"
    "jsxFactory": "h", // le JSX se compile vers h() (la fabrique de Stencil)
    "jsxFragmentFactory": "Fragment", // <>…</> → Fragment de @stencil/core
    "target": "es2017",
    "module": "esnext",
    "moduleResolution": "node",
    "lib": ["dom", "es2017"],
    "allowSyntheticDefaultImports": true,
    "declaration": false, // les .d.ts sont produits par les output targets, pas ici
    "noUnusedLocals": true,
    "noUnusedParameters": true,
  },
  "include": ["src"],
  "exclude": ["node_modules", "dist"],
}
```

Les 3 lignes qui comptent :

- **`experimentalDecorators: true`** → sans ça, `@Component()` ne compile pas.
- **`jsx: "react"` + `jsxFactory: "h"`** → LA différence avec le repo : ici `<div>` devient
  `h('div', …)` (fabrique Stencil), pas le `_jsx(...)` de React.
- **Ce fichier n'étend PAS `../../tsconfig.json`** (qui est en `jsx: "react-jsx"`). Les deux modes
  JSX sont incompatibles ; l'autonomie du tsconfig garantit que Stencil et React ne se polluent pas.

---

### Étape 3 — `stencil.config.ts` (le cœur : les output targets)

Un seul fichier décide **ce qui est produit**. Un projet → plusieurs sorties.

```typescript
export const config: Config = {
  namespace: 'ui-stencil', // préfixe des fichiers générés + dossier dist
  globalStyle: 'src/global/ui-stencil.css', // feuille globale (tokens + accent + reset) — étape suivante

  outputTargets: [
    // 1) bundle auto-lazy + loader : <ui-button> utilisable directement dans une page HTML
    { type: 'dist', esmLoaderPath: '../loader' },

    // 2) custom elements tree-shakeables — REQUIS par le wrapper React (dist seul ne suffit pas)
    {
      type: 'dist-custom-elements',
      customElementsExportBehavior: 'auto-define-custom-elements',
      externalRuntime: false, // EXIGÉ par @stencil/react-output-target 1.x (inline le runtime Stencil)
    },

    // 3) wrapper React généré → dist/react/ (à comparer à packages/reference)
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

À retenir :

- **`dist-custom-elements` est obligatoire** dès qu'on veut le wrapper React — `dist` seul ne suffit pas.
- **`externalRuntime: false` est obligatoire** sur `dist-custom-elements` avec le React target 1.x :
  sinon `@stencil/react-output-target` **refuse de valider la config** (« requires … `externalRuntime: false` »).
  Le runtime Stencil est alors inliné dans chaque composant au lieu d'être importé de `@stencil/core`.
- **`outputType: 'standalone'`** (Angular) s'appuie sur `dist-custom-elements` et génère des composants
  standalone (Angular 14+), sans loader ni `CUSTOM_ELEMENTS_SCHEMA`.
- **`componentCorePackage`** doit correspondre exactement au `name` du `package.json`, sinon les imports
  des wrappers générés sont faux.
- **`globalStyle`** pointe vers une feuille qu'on crée à l'étape suivante (tokens + variables d'accent).
- Les wrappers `dist/react` et `dist/angular` sont des **artefacts à lire/comparer**, pas des packages
  installables (dans cette itération).

## Suite du journal

_(étapes suivantes — styles globaux/tokens, puis composants ui-badge / ui-button / ui-rating)_
