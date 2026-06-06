---
title: Stencil — API des composants (décorateurs & lifecycle)
type: guide
permalink: main/stencil/stencil-api-des-composants-decorateurs-lifecycle
tags:
- stencil
- decorators
- lifecycle
- api
---

# Stencil — API des composants (décorateurs & lifecycle)

> Référence des décorateurs, du lifecycle et de l'ordre canonique des membres.

## `@Component()`

```typescript
@Component({
  tag: 'my-component',        // REQUIS — doit contenir un tiret
  styleUrl: 'my-component.css',
  // OU styles par mode :
  styleUrls: { ios: 'x.ios.css', md: 'x.md.css' },
  shadow: true,               // true | false | { delegatesFocus: true }
  scoped: false,              // mutuellement exclusif avec shadow
  assetsDirs: ['assets'],
})
```

- `shadow: true` → encapsulation Shadow DOM native.
- `scoped: true` → scoping émulé via data-attributes (light DOM ; les styles peuvent fuir vers l'intérieur).
- Ni l'un ni l'autre → light DOM, pas de scoping.

## Décorateurs

### `@Prop()` — attribut/propriété public

```typescript
@Prop() name: string
@Prop() isActive: boolean = true
@Prop({ mutable: true }) count = 0          // réassignable en interne
@Prop({ reflect: true }) status = 'online'  // miroité vers un attribut HTML
@Prop({ attribute: 'user-id' }) userId: string  // nom d'attribut custom
@Prop() userData: { email: string }         // objet/array : settable SEULEMENT via propriété JS, PAS attribut HTML
```

- Props **immuables par défaut** — `mutable: true` pour réassigner en interne.
- `reflect: true` synchronise vers un attribut DOM (utile pour sélecteurs CSS d'attribut).
- Props primitives = settables en attribut HTML ; types complexes = seulement via propriété.

### `@State()` — état réactif interne

```typescript
@State() isOpen = false   // un changement déclenche un re-render ; NON exposé sur le host
```

### `@Watch()` — réagir aux changements de prop/state (+ validation)

```typescript
@Prop() age: number
@Watch('age')
validateAge(newValue: number, oldValue: number) {
  if (newValue < 0 || newValue > 150) throw new Error('Age out of range')
}
```
> `@Watch` ne se déclenche **pas** sur la valeur initiale — seulement sur les changements ultérieurs.

### `@Event()` — émettre des événements DOM custom

```typescript
import { Event, EventEmitter } from '@stencil/core'

@Event({
  eventName: 'todoCompleted',  // défaut = nom de la propriété
  bubbles: true,
  cancelable: true,
  composed: true,              // franchit la frontière shadow
}) todoCompleted: EventEmitter<Todo>

private complete(todo: Todo) {
  const ev = this.todoCompleted.emit(todo)   // retourne le CustomEvent
  if (!ev.defaultPrevented) { /* default handling */ }
}
```
Le consommateur lit le payload via `event.detail`. **Noms camelCase, sans caractères spéciaux** — ça
gouverne la génération des wrappers React (`onTodoCompleted`) et Angular (`@Output()`).

### `@Listen()` — listeners déclaratifs

```typescript
@Listen('click') handleClick(ev: MouseEvent) {}                  // sur le host
@Listen('selectChange') handleSelect(ev: CustomEvent<{value:string}>) {}  // event custom d'un enfant
@Listen('resize', { target: 'window' }) handleResize() {}        // target: 'body'|'document'|'window'
@Listen('keydown', { target: 'document', capture: true, passive: true }) handleKey(ev: KeyboardEvent) {}
```
Listeners ajoutés/retirés automatiquement avec le lifecycle.

### `@Method()` — API impérative publique

```typescript
@Method()
async open(): Promise<boolean> { return true }
```
- **Doit être `async`** (retourne une Promise). Exposé sur l'instance du host.
- Consommateur : `await el.open()`. À utiliser avec parcimonie — préférer props/events.

### `@Element()` — référence à l'élément host

```typescript
@Element() el: HTMLElement
private query() {
  this.el.shadowRoot?.querySelector('.thing')  // pour composants shadow, query via shadowRoot
}
```

## Lifecycle (ordre d'appel)

| Hook                                          | Se déclenche                                        | Usage                                |
| --------------------------------------------- | --------------------------------------------------- | ------------------------------------ |
| `connectedCallback()`                         | à chaque attache au DOM (peut être multiple)        | subscriptions, intervals             |
| `componentWillLoad()`                         | **une fois**, avant 1er render (peut être `async`)  | fetch async initial (retarde render) |
| `componentWillRender()`                       | avant chaque render (incl. 1er)                     | dériver les données de rendu         |
| `render()`                                    | à chaque render                                     | retourne le JSX                      |
| `componentDidRender()`                        | après chaque render (incl. 1er)                     | lectures DOM post-render             |
| `componentDidLoad()`                          | **une fois**, après 1er render                      | DOM prêt ; mesurer/focus             |
| `componentShouldUpdate(newVal,oldVal,prop)`   | avant re-render                                     | `return false` → skip re-render      |
| `componentWillUpdate()`                       | avant chaque render sauf 1er                        | —                                    |
| `componentDidUpdate()`                        | après chaque render sauf 1er                        | —                                    |
| `disconnectedCallback()`                      | retrait du DOM                                      | cleanup (clear intervals, unsub)     |

```typescript
async componentWillLoad() {
  // retourner une promesse retarde le 1er render jusqu'à sa résolution
  this.data = await (await fetch(`/api/users/${this.userId}`)).json()
}
```

## Ordre canonique des membres (style guide Ionic)

1. Propriétés own (non décorées) → 2. `@Element()` → 3. `@State()` → 4. `@Prop()` (avec leur `@Watch`
juste après) → 5. `@Event()` → 6. lifecycle hooks → 7. `@Listen()` → 8. `@Method()` public → 9.
méthodes privées → 10. `render()`.

JSDoc requis sur chaque `@Prop`/`@Event`/`@Method` public — alimente la doc générée + les types des wrappers.

## Relations

- Templating JSX : [[Stencil — Templating JSX]]
- Styling : [[Stencil — Styling (Shadow DOM, CSS vars, parts)]]
- Setup : [[Stencil — Setup & Configuration d'un projet]]
