---
title: Stencil — Concepts Web Components (avant de coder)
type: guide
permalink: main/stencil/stencil-concepts-web-components-avant-de-coder
tags:
- stencil
- web-components
- concepts
---

# Stencil — Concepts Web Components (avant de coder)

> Base de connaissances pour mettre en place un **projet exclusivement Stencil** sur un nouveau repo.
> Ces 5 sections conceptuelles viennent de `packages/stencil/README.md` (repo fubaritico-ds).
> À lire AVANT de porter/écrire un composant. Tout le reste découle de ces idées.

## 1. « Composant Stencil » vs « Web Component » — ce ne sont pas deux camps

Distinguer **deux axes** (piège de vocabulaire le plus courant).

**Axe A — Stencil n'est pas un concurrent du Web Component, c'est une _usine à_ Web Components.**
Contrairement à React (runtime `react-dom` à côté), Stencil est un **compilateur** : on écrit une
classe confortable (décorateurs + JSX), il **génère** un vrai custom element natif, utilisable partout
(HTML pur, Vue, Angular).

```
   Ce que TU écris (source)            Ce que Stencil PRODUIT (artefact)
   @Component({ tag: 'ui-tab' })  ──►  class UiTab extends HTMLElement { … }
   class UiTab {                       customElements.define('ui-tab', UiTab)
     @State() active = false           + un petit runtime réactif (VDOM)
     render() { return <Host/> }
   }
```

« composant Stencil » = le **code source** ; « Web Component » = le **résultat compilé**. Source → produit.

**Axe B — La vraie différence : WC écrit « à la main » vs WC compilé par Stencil.**

|            | WC natif vanilla                      | Composant Stencil                          |
| ---------- | ------------------------------------- | ------------------------------------------ |
| Classe     | `class X extends HTMLElement` à la main | `extends HTMLElement` **généré**         |
| Rendu      | on manipule le DOM soi-même           | **JSX** + **VDOM diff** automatique        |
| Réactivité | **aucune** (re-dessin manuel)         | `@State`/`@Prop` change → **re-render auto** |
| État       | piloté par **attributs** (`getAttribute`) | propriétés typées (`@Prop`, `@State`)  |
| Lifecycle  | 4 callbacks natifs                    | ces 4 **+ ~6 hooks réactifs**              |
| Événements | `dispatchEvent(new CustomEvent(...))` | `@Event()` typé (→ génère le wrapper React) |
| Coût       | 0 Ko                                  | petit runtime Stencil (~quelques Ko)       |

Le WC natif = **squelette pauvre** (4 callbacks, état = attributs, rendu manuel) ; Stencil pose
**par-dessus** une couche réactive « façon React » **sans renoncer au standard**.

**Axe C — Piège interne à Stencil.** Une classe `@Component` → vrai WC. Un `FunctionalComponent`
→ simple helper de rendu **inliné au compile-time** (aucun élément DOM, pas de lifecycle).

## 2. La règle d'or : « props down, events up » 🔑

LE point à intégrer. Un WC communique dans **deux sens, par deux canaux** — mot pour mot le modèle Vue (`props` / `$emit`).

- **TOP-DOWN — les props descendent.** Le parent passe une donnée à l'enfant via attribut/propriété
  (`active`, `value`). L'enfant la reçoit et l'affiche. Sens : **parent → enfant**.
- **BOTTOM-UP — les events remontent.** L'enfant ne modifie **jamais** son parent directement. Il
  **émet** un événement, qui remonte l'arbre du DOM (`bubbles`). Le parent écoute et réagit. Sens : **enfant → parent**.

**Pourquoi l'asymétrie ?** Le DOM est un **arbre** : une donnée en attribut descend naturellement ; un
événement bouillonne vers le haut (`bubbling`). Les WC épousent ce sens naturel.

| Intention                    | Vue.js                      | Web Component / Stencil            | Sens        |
| ---------------------------- | --------------------------- | ---------------------------------- | ----------- |
| Donner une valeur à l'enfant | `props`                     | attribut / `@Prop()`               | top-down ↓  |
| Prévenir le parent           | `this.$emit('change', val)` | `this.change.emit(val)` (`@Event`) | bottom-up ↑ |
| Réagir côté parent           | `@change="onChange"`        | `@Listen('change')`                | bottom-up ↑ |
| Recevoir la donnée           | `event.payload`             | `event.detail`                     | bottom-up ↑ |

> En WC, l'enfant **n'écrit jamais** dans le parent. Il **émet**, le parent décide. La verbosité (vs Context React) est le prix du découplage.

## 3. Compound component en WC : slots + events + `@Listen` / `@Method`

Un compound (`Tabs`+`Tab`, `Menu`+`Menu.Item`) a besoin que parent et enfants collaborent. Sans Context (§4), on assemble **4 outils** :

| Outil           | Rôle                                                          | Sens                   |
| --------------- | ------------------------------------------------------------ | ---------------------- |
| `<slot>`        | emplacement où le parent accueille les enfants (= `children` / `<slot>` Vue) | composition |
| `@Event()`      | l'enfant émet un message                                     | bottom-up ↑            |
| `@Listen()`     | le parent écoute ces messages                                | bottom-up ↑            |
| `@Method()`     | le parent appelle une fonction publique de l'enfant          | top-down ↓ (impératif) |

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

## 4. Reproduire le Context : 3 stratégies (le Context est, lui aussi, bottom-up en WC)

Le Context React/Vue (`useContext` / `provide`+`inject`) sert à **sauter des niveaux**. Le DOM n'a pas cette magie. On la reconstruit :

| Stratégie                | Mécanisme                                                       | Sens     | Pour quoi                       |
| ------------------------ | --------------------------------------------------------------- | -------- | ------------------------------- |
| Top-down par props       | le parent passe l'état actif à chaque enfant                    | ↓        | `value` (quel onglet actif)     |
| Bottom-up par events     | l'enfant émet « clic » / « je m'enregistre » ; le parent écoute | ↑        | clic, registre des triggers     |
| Context Protocol (W3C)   | l'enfant **demande** un contexte, un ancêtre **répond**         | ↑ puis ↓ | équivalent fidèle du Context React |

**Le point clé :** en React/Vue le partage de contexte est **top-down** (le `Provider` enveloppe et
pousse vers le bas). En **WC, pas de Provider qui enveloppe** ; le standard inverse le sens : **c'est
l'enfant qui réclame, et sa demande remonte** (`bubbles` + `composed`). Donc **même le Context, en WC,
démarre par une émission bottom-up.**

Cœur réel de `@lit/context` — le standard tient dans **un événement** :

```ts
// @lit/context — context-request-event.ts (l'essentiel)
export class ContextRequestEvent extends Event {
  readonly context   // la "clé" du contexte demandé
  readonly callback  // (value, unsubscribe?) => void  → par où la valeur ARRIVE
  readonly subscribe // veut-on les mises à jour futures ?
  constructor(context, contextTarget, callback, subscribe?) {
    super('context-request', { bubbles: true, composed: true }) // ⬅ il REMONTE
  }
}
```

Le flux en 4 temps :
```
1. ENFANT (consumer)  →  dispatchEvent(new ContextRequestEvent(tabsCtx, el, cb, true))
2. l'event REMONTE       bubbles:true + composed:true → franchit même le shadow DOM       ↑
3. ANCÊTRE (provider) →  @Listen('context-request'): if (e.context === tabsCtx) e.callback(this.value, unsub)
4. la valeur ARRIVE      via cb ; si subscribe:true, le provider rappelle cb à CHAQUE changement   ↓
```

| React Context           | Context Protocol (WC)                         | Vue            |
| ----------------------- | --------------------------------------------- | -------------- |
| `createContext(key)`    | `createContext('tabs')`                       | clé d'`inject` |
| `<Provider value={…}>`  | un ancêtre écoute `context-request` et répond | `provide()`    |
| `useContext(Ctx)`       | l'enfant émet `context-request`               | `inject()`     |
| re-render au changement | `subscribe:true` → rappel du `callback`       | réactivité     |

> **Décision sandbox :** Stencil **n'a pas** de Context intégré. Sa réponse maison au compound est
> **events + `@Listen`** (+ `@Method`). Le Context Protocol est framework-agnostic : ajoutable
> par-dessus Stencil si un cas l'exige.

## 5. Peut-on étendre l'usine ? (décorateurs fermés vs plugins & output targets)

Oui — **mais pas en ajoutant des décorateurs.**

**Les décorateurs sont une liste fermée**, et ce ne sont même pas de vrais décorateurs. Le compilateur
ne reconnaît que ces 11 marqueurs (`STENCIL_DECORATORS`) :
```
Component · Prop · State · Watch · Event · Listen · Method · Element
· AttachInternals · AttrDeserialize · PropSerialize
```
Ils ne s'exécutent **jamais** au runtime : le compilateur les lit dans l'AST TS, les convertit en
_static getters_, puis **les retire** (`CLASS_DECORATORS_TO_REMOVE` / `MEMBER_DECORATORS_TO_REMOVE`).
Inventer un `@MonDécorateur` imposerait de **forker le compilateur**.

**Les deux vrais points d'extension :**

| Levier                                | Ce que c'est                                                          | Ce que tu étends                        |
| ------------------------------------- | -------------------------------------------------------------------- | --------------------------------------- |
| `config.plugins`                      | des plugins Rollup (+ preprocesseurs CSS : sass, postcss)            | la transformation de l'entrée (build)   |
| Custom Output Target (`type:'custom'`)| une fonction `generator(config, compilerCtx, buildCtx, docs)` recevant les métadonnées de tous les composants compilés | la génération de sorties (artefacts) |

```ts
export interface OutputTargetCustom {
  type: 'custom'
  name: string
  generator: (config, compilerCtx, buildCtx, docs) => Promise<void>
  validate?: (config, diagnostics) => void
}
```

**Preuve que l'usine est extensible :** `reactOutputTarget` et `angularOutputTarget` **ne sont pas des
features magiques — ce sont des custom output targets.** Ils branchent un `generator`, lisent les
props/events/méthodes (via JSDoc), et produisent une lib React/Angular. Pour générer un wrapper Vue, de
la doc maison, des types pour un autre framework → on écrit **son propre** custom output target.

> ❌ « ajouter des décorateurs » → ✅ « brancher un plugin (transformer l'entrée) ou un custom output
> target (générer de nouvelles sorties) ». Décorateurs figés ; chaîne de build/génération ouverte.

## Relations

- Voir [[Stencil — Setup & Configuration d'un projet]] pour la mise en pratique
- Voir [[Stencil — Plan ORIGINAL (sandbox fubaritico-ds)]] pour le contexte d'origine
- Voir [[Stencil — Plan NOUVEAU (projet Stencil autonome)]] pour le projet cible
