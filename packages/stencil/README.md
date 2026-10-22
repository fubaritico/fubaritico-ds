# @fubaritico/stencil

**Stencil** sandbox: the foundation of a **design system** in Web Components, styled in **BEM** with
**overridable** styles (light DOM + CSS variables), fed by `@fubaritico/tokens`. A few components of
`packages/reference` are ported here to **compare** them with the generated code, and to find out how Stencil
compiles and generates **React** and **Angular** wrappers from a single project.

> For now this README also holds the **step-by-step set-up log** with the explanation of each file. Part of it
> will move to a dedicated doc later.

---

## Understanding Web Components before coding

> This part is deliberately **conceptual**: before porting a component, you need to know how a Web Component
> "thinks". Everything else (porting the `Tabs`, the `Menu`…) follows from these four ideas.

### 1. "Stencil component" vs "Web Component" — not two camps

The most common vocabulary trap. Two **axes** must be told apart.

**Axis A — Stencil is not a competitor of the Web Component, it is a Web Component _factory_.** Unlike React
(which runs through a `react-dom` runtime beside it), Stencil is a **compiler**: you write a comfortable class
(decorators + JSX), it **generates** a real native custom element, usable anywhere (plain HTML, Vue, Angular).

```
   What YOU write (source)             What Stencil PRODUCES (artefact)
   ───────────────────────             ────────────────────────────────
   @Component({ tag: 'ui-tab' })  ──►  class UiTab extends HTMLElement { … }
   class UiTab {                       customElements.define('ui-tab', UiTab)
     @State() active = false           + a small reactive runtime (VDOM)
     render() { return <Host/> }
   }
```

So "Stencil component" = the **source code**; "Web Component" = the **compiled result**. Source → product,
not two opposed schools.

**Axis B — The real difference: a WC written "by hand" vs a WC compiled by Stencil.**

|            | **Vanilla native WC**                     | **Stencil component**                                 |
| ---------- | ----------------------------------------- | ----------------------------------------------------- |
| Class      | `class X extends HTMLElement` by hand     | `extends HTMLElement` **generated**                   |
| Rendering  | you manipulate the DOM yourself           | **JSX** + automatic **VDOM diff**                     |
| Reactivity | **none** (you redraw by hand)             | `@State`/`@Prop` change → **automatic re-render**     |
| State      | driven by **attributes** (`getAttribute`) | typed properties (`@Prop`, `@State`)                  |
| Lifecycle  | 4 native callbacks                        | those 4 **+ ~6 reactive hooks**                       |
| Events     | `dispatchEvent(new CustomEvent(...))`     | typed `@Event()` (→ also generates the React wrapper) |
| Cost       | 0 KB                                      | a small Stencil runtime (a few KB)                    |

In one sentence: the native WC gives a **bare skeleton** (4 callbacks, state = attributes, manual rendering);
Stencil lays a "React-like" reactive layer **on top** **without giving up the standard**. That is exactly the
"poverty of the lifecycle" people talk about: they are describing the left column.

**Axis C — A trap _inside_ Stencil.** A `@Component` class → a real WC. A `FunctionalComponent` → a plain
rendering helper **inlined at compile time** (no DOM element, no lifecycle).

### 2. The golden rule: "props down, events up" 🔑

**THE point to take in.** A Web Component communicates in **two directions, through two different channels** —
_word for word_ Vue's model (`props` / `$emit`).

```
        ┌─────────────────────────┐
        │      <ui-tabs>          │  ← the PARENT
        │   (holds the state)     │
        └─────────────────────────┘
            │  ▲
  top-down  │  │  bottom-up
  (props /  │  │  (events /
  attributes)  │   emission)
            ▼  │
        ┌─────────────────────────┐
        │     <ui-tab>            │  ← the CHILD
        └─────────────────────────┘
```

- **TOP-DOWN — _props_ go down.** The parent passes data to the child through an attribute/property (`active`,
  `value`…). The child **receives** and shows it. Direction: **parent → child**.
- **BOTTOM-UP — _events_ go up.** The child **never** changes its parent directly. It **emits** an event ("I was
  clicked"), which **climbs** the DOM tree (`bubbles`). The parent **listens** and reacts. Direction:
  **child → parent**.

**Why this asymmetry?** Because the DOM is a **tree**. Data passed as an attribute naturally goes down; an
event, by nature, **bubbles up**. WCs follow that natural direction — instead of letting the child "fiddle with"
the parent.

**The Vue parallel, term by term:**

| Intent                   | Vue.js                      | Web Component / Stencil            | Direction   |
| ------------------------ | --------------------------- | ---------------------------------- | ----------- |
| Give the child a value   | `props`                     | attribute / `@Prop()`              | top-down ↓  |
| Tell the parent          | `this.$emit('change', val)` | `this.change.emit(val)` (`@Event`) | bottom-up ↑ |
| React on the parent side | `@change="onChange"`        | `@Listen('change')`                | bottom-up ↑ |
| Receive the data         | `event.payload`             | `event.detail`                     | bottom-up ↑ |

> **Takeaway:** in WCs the child **never writes** into the parent. It **emits**, and the parent decides what to
> do. This discipline ("events up") is what makes components reusable and decoupled — exactly Vue's philosophy.
> The extra verbosity (vs React's Context) is the price of that decoupling.

### 3. A compound component in WCs: slots + events + `@Listen` / `@Method`

A _compound_ (`Tabs` + `Tab`, `Menu` + `Menu.Item`) needs parent and children to collaborate. Without Context
(see §4), you assemble **4 tools**, each tied to one direction of communication:

| Tool            | Role                                                                   | Direction               |
| --------------- | ---------------------------------------------------------------------- | ----------------------- |
| **`<slot>`**    | where the parent hosts the children (= `{children}` / Vue's `<slot>`)  | composition             |
| **`@Event()`**  | the child emits a message                                              | bottom-up ↑             |
| **`@Listen()`** | the parent listens to those messages                                   | bottom-up ↑             |
| **`@Method()`** | the parent calls a public function of the child ("highlight yourself") | top-down ↓ (imperative) |

```tsx
// PARENT <ui-tabs>
@Listen('tabSelect')                       // ↑ it listens to what climbs
onTabSelect(e: CustomEvent<string>) { this.value = e.detail }
render() { return <Host role="tablist"><slot/></Host> }   // the <ui-tab> are slotted

// CHILD <ui-tab>
@Prop() value: string
@Event() tabSelect: EventEmitter<string>   // ↑ it calls upward
render() {
  return <Host role="tab" onClick={() => this.tabSelect.emit(this.value)}><slot/></Host>
}
```

### 4. Reproducing Context: 3 strategies (and why Context, too, is bottom-up in WCs)

React/Vue Context (`useContext` / `provide`+`inject`) is there to **skip levels**: share data with distant
descendants **without passing it through** every intermediate child. The DOM has no such "magic". It is rebuilt
with one of 3 strategies:

| Strategy                            | Mechanism                                                  | Direction | For what                                   |
| ----------------------------------- | ---------------------------------------------------------- | --------- | ------------------------------------------ |
| **Top-down by props**               | the parent passes the active state to each child           | ↓         | `value` (which tab is active)              |
| **Bottom-up by events**             | the child emits "click" / "I register"; the parent listens | ↑         | click, registry of triggers                |
| **Context Protocol** (W3C standard) | the child **asks** for a context, an ancestor **answers**  | ↑ then ↓  | the faithful equivalent of React's Context |

**The point that lights it all up:** in React/Vue, context sharing is **top-down** — the `Provider` _wraps_ and
_pushes_ the value down. In **Web Components there is no wrapping Provider**; so the standard reverses the
direction: **the child asks, and its request climbs** (`bubbles` + `composed`). So **even Context, in WCs,
starts with a bottom-up emission.** The logical sequel of §2: everything here starts with an event that climbs.

Here is the real core of `@lit/context` (fetched into `opensrc/`) — the standard fits in **one event**:

```ts
// @lit/context — context-request-event.ts (the essentials)
export class ContextRequestEvent extends Event {
  readonly context // the "key" of the requested context
  readonly callback // (value, unsubscribe?) => void  → where the value ARRIVES
  readonly subscribe // does it want future updates?
  constructor(context, contextTarget, callback, subscribe?) {
    super('context-request', { bubbles: true, composed: true }) // ⬅ it CLIMBS
    // …
  }
}
```

The flow, in 4 beats:

```
1. CHILD (consumer)   →  dispatchEvent(new ContextRequestEvent(tabsCtx, el, cb, true))
2. the event CLIMBS      bubbles:true + composed:true  → even crosses the shadow DOM      ↑
3. ANCESTOR (provider) → @Listen('context-request'): if (e.context === tabsCtx) e.callback(this.value, unsub)
4. the value ARRIVES     through cb; with subscribe:true, the provider calls cb again on EVERY change  ↓
```

Term-by-term mapping with React:

| React Context          | Context Protocol (WC)                                | Vue          |
| ---------------------- | ---------------------------------------------------- | ------------ |
| `createContext(key)`   | `createContext('tabs')`                              | `inject` key |
| `<Provider value={…}>` | an ancestor listens to `context-request` and answers | `provide()`  |
| `useContext(Ctx)`      | the child emits `context-request`                    | `inject()`   |
| re-render on change    | `subscribe:true` → the `callback` is called again    | reactivity   |

> **Decision for our sandbox:** Stencil has **no** built-in context system. Its "house" answer to the compound is
> **events + `@Listen`** (+ `@Method`). The Context Protocol is _framework-agnostic_: it can be added on top of
> Stencil if a case calls for it. On the `Tabs`, we start **without** context (props down + events up), then
> judge whether the keyboard registry justifies the Context Protocol. (Since 2026-10-09 the Tabs' behaviour lives
> in `@fubaritico/behaviors`' `TabsService`, which a Stencil adapter can drive as thinly as the React one.)

### 5. Can the factory be extended? (closed decorators vs plugins & output targets)

A natural question once you understand that Stencil is a **Web Component factory** (§1): can it be extended to
do "more transformations"? **Yes — but not by adding decorators.** That is the surprising part.

**The decorators are a _closed_ list, and they are not even real decorators.** The compiler only recognises these
11 markers (`STENCIL_DECORATORS`):

```
Component · Prop · State · Watch · Event · Listen · Method · Element
· AttachInternals · AttrDeserialize · PropSerialize
```

They **never run** at run time: the compiler **reads them in the TypeScript AST**, turns them into _static
getters_, then **removes them** from the generated code (`CLASS_DECORATORS_TO_REMOVE` /
`MEMBER_DECORATORS_TO_REMOVE`). They are **compile-time annotations**, not code. Inventing a `@MyDecorator` that
Stencil would understand would mean **forking the compiler**.

**The two real extension points** are elsewhere:

| Lever                                       | What it is                                                                                                         | What you extend                                            |
| ------------------------------------------- | ------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------- |
| **`config.plugins`**                        | **Rollup plugins** (+ CSS preprocessors: sass, postcss)                                                            | the **transformation of the input** (code/styles at build) |
| **Custom Output Target** (`type: 'custom'`) | a function `generator(config, compilerCtx, buildCtx, docs)` receiving **the metadata of every compiled component** | the **generation of outputs** (new artefacts)              |

```ts
// declarations/stencil-public-compiler.ts — the real interface
export interface OutputTargetCustom {
  type: 'custom'
  name: string
  generator: (config, compilerCtx, buildCtx, docs) => Promise<void> // ← receives the metadata, generates anything
  validate?: (config, diagnostics) => void
}
```

**The proof that the factory is extensible:** `reactOutputTarget` and `angularOutputTarget` **are not magic
built-in features — they are custom output targets.** They plug a `generator`, read the props/events/methods
(through the JSDoc), and **produce a React / Angular library**. So to generate a Vue wrapper tomorrow, house docs
or types for another framework → write **your own** custom output target. That is exactly "extending the
factory".

> **Rephrased:** ❌ _"add decorators for more transformations"_ → ✅ _"plug a plugin (transform the input) or a
> custom output target (generate new outputs)"_. The set of decorators is frozen; the build and generation chain
> is open.

---

## Set-up log (step by step)

### Step 1 — `package.json`

```jsonc
{
  "name": "@fubaritico/stencil", // workspace name, consistent with the other packages
  "version": "0.0.0", // aligned on the monorepo (Lerna)
  "private": true, // sandbox: not published
  "type": "module", // ESM, like packages/reference
  "files": ["dist", "loader"], // what would be published one day (unused while private)

  "scripts": {
    "build": "stencil build", // generates every output target
    "dev": "stencil build --dev --watch --serve", // Stencil dev app (live preview)
    "test": "vitest run --passWithNoTests", // @stencil/vitest (see "Tests")
    "test:watch": "vitest --passWithNoTests",
    "type-check": "tsc --noEmit -p tsconfig.eslint.json", // added at step 4
    "lint": "eslint . --max-warnings 0", // resolves the root flat config (stencil override)
  },

  "dependencies": {
    "@stencil/core": "^4.43.5", // compiler + runtime
  },
  "devDependencies": {
    "@stencil/angular-output-target": "^1.3.1", // generates the Angular wrapper
    "@stencil/react-output-target": "^1.5.3", // generates the React wrapper
    "@stencil/vitest": "^1.12.1", // test runner (see "Tests")
    "react": "catalog:",
    "react-dom": "catalog:", // peer of the React 1.x target (typed generation)
    "@types/react": "catalog:",
    "@types/react-dom": "catalog:",
    "@fubaritico/tokens": "workspace:*", // level 1 of the CSS variables (tokens)
    "vitest": "^3.1.2", // aligned on the root vitest
  },
}
```

> The fields `exports` / `main` / `module` / `types` / `customElements` and the `type-check` are added at **step
> 4** (toolchain integration) — see the PLAN.

Takeaways:

- **`@stencil/core` is in `dependencies`** (not devDeps): the `dist-custom-elements` bundle references the
  Stencil runtime — the convention for a component library.
- **`react`/`react-dom` in devDeps**: `@stencil/react-output-target` **1.x** declares them as
  `peerDependencies` (`react: ^18 || ^19`). They only serve to generate/type the wrappers, not to run the
  components (which are native Web Components).

**Versions checked (npm registry, 2026-06-03):**

| Package                          | Chosen version | Note                                                    |
| -------------------------------- | -------------- | ------------------------------------------------------- |
| `@stencil/core`                  | `4.43.5`       | = the version of the docs used (v4.43)                  |
| `@stencil/react-output-target`   | `1.5.3`        | major 1.x; peer `react ^18 \|\| ^19`                    |
| `@stencil/angular-output-target` | `1.3.1`        | major 1.x (targets Angular 19+); peer = `@stencil/core` |

### Tests — choosing the runner

We use **`@stencil/vitest`** (the initial plan — confirmed right). The first idea of using the "built-in" runner
`stencil test --spec` rested on two **false** premises, checked by running it on `@stencil/core@4.43.5`:

- ❌ "no extra dependency / shipped with `@stencil/core`" → false: the command requires installing `jest@29` +
  `@types/jest@29` + `jest-cli@29` (otherwise it errors at launch);
- ❌ "a lasting solution" → false: `stencil test --spec` (and the `--spec`/`--e2e` flags) are **deprecated** in
  v4.43 and **removed in v5**; Stencil officially redirects to `@stencil/vitest` (see `stenciljs/core#6584`).

On collisions: the "`*.spec.tsx` vs `*.test.tsx`" argument was moot too — the root `vitest.config.ts` with
`projects: ['packages/*']` decides. We use it: the package's `vitest.config.ts` is **auto-discovered** by the root
`vitest run` (no change to the root `test` script). Specs in `*.spec.{ts,tsx}`, environment `stencil`. The full
config + the first spec come at step 6.

### Step 2 — `tsconfig.json`

The key file of the **isolation**: Stencil's TypeScript config differs from React's.

```jsonc
{
  "compilerOptions": {
    "experimentalDecorators": true, // essential: @Component, @Prop, @Event… are decorators
    "jsx": "react", // Stencil does NOT use "react-jsx"
    "jsxFactory": "h", // JSX compiles to h() (Stencil's factory)
    "jsxFragmentFactory": "Fragment", // <>…</> → @stencil/core's Fragment
    "target": "es2017",
    "module": "esnext",
    "moduleResolution": "node",
    "lib": ["dom", "es2017"],
    "allowSyntheticDefaultImports": true,
    "declaration": false, // the .d.ts are produced by the output targets, not here
    "noUnusedLocals": true,
    "noUnusedParameters": true,
  },
  "include": ["src"],
  "exclude": ["node_modules", "dist"],
}
```

The 3 lines that matter:

- **`experimentalDecorators: true`** → without it, `@Component()` does not compile.
- **`jsx: "react"` + `jsxFactory: "h"`** → THE difference with the rest of the repository: here `<div>` becomes
  `h('div', …)` (Stencil's factory), not React's `_jsx(...)`.
- **This file does NOT extend `../../tsconfig.json`** (which is `jsx: "react-jsx"`). The two JSX modes are
  incompatible; a standalone tsconfig guarantees Stencil and React do not pollute each other.

---

### Step 3 — `stencil.config.ts` (the core: the output targets)

One file decides **what is produced**. One project → several outputs.

```typescript
export const config: Config = {
  namespace: 'ui-stencil', // prefix of the generated files + dist folder
  globalStyle: 'src/global/ui-stencil.css', // global sheet (tokens + accent + reset) — next step

  outputTargets: [
    // 1) auto-lazy bundle + loader: <ui-button> usable directly in an HTML page
    { type: 'dist', esmLoaderPath: '../loader' },

    // 2) tree-shakeable custom elements — REQUIRED by the React wrapper (dist alone is not enough)
    {
      type: 'dist-custom-elements',
      customElementsExportBehavior: 'auto-define-custom-elements',
      externalRuntime: false, // REQUIRED by @stencil/react-output-target 1.x (inlines the Stencil runtime)
    },

    // 3) generated React wrapper → dist/react/ (to compare with packages/reference)
    reactOutputTarget({ outDir: './dist/react/' }),

    // 4) generated Angular wrapper (standalone, built on dist-custom-elements)
    angularOutputTarget({
      componentCorePackage: '@fubaritico/stencil', // must = the package.json "name"
      outputType: 'standalone',
      directivesProxyFile: './dist/angular/components.ts',
      directivesArrayFile: './dist/angular/index.ts',
    }),

    // 5) generated docs (a readme.md per component) from the JSDoc
    { type: 'docs-readme' },
  ],
}
```

Takeaways:

- **`dist-custom-elements` is mandatory** as soon as the React wrapper is wanted — `dist` alone is not enough.
- **`externalRuntime: false` is mandatory** on `dist-custom-elements` with the React target 1.x: otherwise
  `@stencil/react-output-target` **refuses to validate the config** ("requires … `externalRuntime: false`"). The
  Stencil runtime is then inlined into each component instead of being imported from `@stencil/core`.
- **`outputType: 'standalone'`** (Angular) builds on `dist-custom-elements` and generates standalone components
  (Angular 14+), with no loader and no `CUSTOM_ELEMENTS_SCHEMA`.
- **`componentCorePackage`** must match the `package.json` `name` exactly, otherwise the generated wrappers'
  imports are wrong.
- **`globalStyle`** points to a sheet created at the next step (tokens + accent variables).
- The `dist/react` and `dist/angular` wrappers are **artefacts to read/compare**, not installable packages (in
  this iteration).

## Rest of the log

_(next steps — global styles/tokens, then the ui-badge / ui-button / ui-rating components; tracked on the board:
STENCIL-130, DESIGN-122)_
