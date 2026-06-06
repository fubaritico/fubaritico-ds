---
title: Stencil — Templating JSX
type: guide
permalink: main/stencil/stencil-templating-jsx
tags:
- stencil
- jsx
- templating
- host
- slots
---

# Stencil — Templating JSX

> Stencil utilise JSX, mais **ce n'est PAS le JSX de React**. Le pragma est le `h` de Stencil. Toujours l'importer.

```tsx
import { Component, h } from '@stencil/core'
```

## `render()` et `<Host>`

`render()` retourne l'arbre JSX. Pour poser attributs/classes/listeners sur **l'élément host lui-même**
(et pour retourner plusieurs racines comme un fragment), envelopper dans `<Host>` :

```tsx
import { Component, Prop, Host, h } from '@stencil/core'

@Component({ tag: 'alert-box', styleUrl: 'alert-box.css', shadow: true })
export class AlertBox {
  @Prop() type: 'info' | 'warning' | 'error' | 'success' = 'info'
  @Prop() dismissible = false

  render() {
    return (
      <Host
        role="alert"
        aria-live="polite"
        class={{ alert: true, [`alert-${this.type}`]: true, dismissible: this.dismissible }}
      >
        <div class="alert-content"><slot></slot></div>
        {this.dismissible && <button aria-label="Dismiss">×</button>}
      </Host>
    )
  }
}
```

## Binding class & style

```tsx
<div class={{ active: this.isActive, 'is-open': this.isOpen }} />   // objet : clés truthy appliquées
<div class={`base ${this.isActive ? 'active' : ''}`} />            // string OK aussi
<div style={{ color: this.color, '--gap': `${this.gap}px` }} />    // style inline = objet
```

## Rendu conditionnel

```tsx
{ this.name ? <p>Hello {this.name}</p> : <p>Hello World</p> }  // ternaire
{ this.isLoading && <spinner-el /> }                          // short-circuit
if (!this.data) return null                                   // early return dans render()
```

## Listes — `key` requis

```tsx
{ this.todos.map((todo) => <div key={todo.uid}>{todo.taskName}</div>) }
```
`key` permet à Stencil de matcher les éléments entre renders et d'éviter de recréer les nœuds DOM (même rôle que le key de React).

## Slots (composition Shadow DOM)

```tsx
<div class="card">
  <slot name="header"></slot>
  <slot></slot> {/* default */}
  <slot name="footer"></slot>
</div>
```
Consommateur :
```html
<my-card>
  <h2 slot="header">Title</h2>
  <p>Body dans le slot par défaut</p>
  <span slot="footer">Footer</span>
</my-card>
```

## Formulaires

Pattern input contrôlé via `@State` + `onInput` :

```tsx
@State() value: string
private handleChange = (e: Event) => { this.value = (e.target as HTMLInputElement).value }
render() {
  return (
    <form onSubmit={(e) => this.handleSubmit(e)}>
      <input type="text" value={this.value} onInput={this.handleChange} />
      <input type="submit" value="Submit" />
    </form>
  )
}
```
> `onInput` (à chaque frappe) pour binding live ; `onChange` ne se déclenche qu'au blur/commit.

## Functional components

Légers, stateless, render-only — pas de décorateurs, pas de shadow, pas de lifecycle :

```tsx
import { FunctionalComponent, h } from '@stencil/core'
interface BadgeProps { color: string }
export const Badge: FunctionalComponent<BadgeProps> = ({ color }, children) => (
  <span class="badge" style={{ background: color }}>{children}</span>
)
// usage dans un render() : <Badge color="red">New</Badge>
```
2e argument = `children` (array de vnodes). Inlinés au compile-time — ne produisent **pas** de custom element.

## Raw HTML

```tsx
<div innerHTML={this.trustedHtml}></div>
```
Pas de `dangerouslySetInnerHTML` — utiliser le `innerHTML` natif (sanitize toi-même l'input non fiable).

## Relations

- Décorateurs & lifecycle : [[Stencil — API des composants (décorateurs & lifecycle)]]
- Styling : [[Stencil — Styling (Shadow DOM, CSS vars, parts)]]
