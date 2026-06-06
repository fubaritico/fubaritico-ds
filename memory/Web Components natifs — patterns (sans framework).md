---
title: Web Components natifs — patterns (sans framework)
type: guide
permalink: main/stencil/web-components-natifs-patterns-sans-framework
tags:
- web-components
- vanilla
- patterns
- attribute-driven
- shadow-dom
---

# Web Components natifs — patterns (sans framework)

> Condensé du skill `new-web-component` : construire des WC **natifs** (sans Stencil) avec des patterns
> propres. Utile comme contre-point pour comprendre ce que Stencil **génère**, et pour les cas où on
> écrit un WC à la main. Stencil pose une couche réactive par-dessus ces mêmes primitives.

## Principes architecturaux (stricts)

1. **Zéro sélection DOM** : jamais `querySelector`/`querySelectorAll`/`getElementById`.
2. **État piloté par attributs** : tout l'état entre via attributs HTML.
3. **Délégation d'événements sur `this`** : `this.addEventListener` + pattern `handleEvent`.
4. **Aucune dépendance externe** : seulement les API standard de la plateforme web.
5. **Declarative Shadow DOM** : `<template shadowrootmode="open">` pour rendu instantané.
6. **Progressive enhancement** : le composant marche (dégradé) même si JS échoue.
7. **Customized built-ins > autonomous** : étendre les éléments natifs pour préserver l'accessibilité.

## Customized built-in (préféré)

Étend un élément HTML natif → garde l'accessibilité et le comportement intégrés.

```javascript
class AsyncAction extends HTMLButtonElement {
  connectedCallback() { this.addEventListener('click', this); }   // délégation sur self
  async handleEvent(e) {                                          // pattern handleEvent (pas de .bind)
    if (e.type === 'click') {
      this.setAttribute('aria-busy', 'true'); this.disabled = true;  // état IN via attribut
      await new Promise((r) => setTimeout(r, 1_500));
      this.removeAttribute('aria-busy'); this.disabled = false;
      this.dispatchEvent(new CustomEvent('action-complete', { bubbles: true, detail: {} })); // OUT via event
    }
  }
  disconnectedCallback() { this.removeEventListener('click', this); }  // cleanup
}
customElements.define('async-action', AsyncAction, { extends: 'button' });
```
```html
<button is="async-action" aria-label="Add to cart">Add to Cart</button>
```

## État piloté par attributs : IN attributs, OUT events

```javascript
static get observedAttributes() { return ['data-url', 'refresh-interval']; }
attributeChangedCallback(name, oldValue, newValue) {
  if (oldValue === newValue) return;
  if (name === 'data-url' && newValue) this.loadData(newValue);
}
// OUT : jamais modifier le DOM externe — seulement émettre
this.dispatchEvent(new CustomEvent('value-changed', { bubbles: true, composed: true, detail: { value } }));
```

## Declarative Shadow DOM

```html
<product-card>
  <template shadowrootmode="open">
    <style>
      :host { display: block; }
      button[aria-busy="true"] { opacity: .7; cursor: wait; }
      .card { background: var(--card-bg, white); }
    </style>
    <article class="card" part="container"><slot name="header"></slot><slot></slot></article>
  </template>
  <h3 slot="header">Title</h3>
</product-card>
```

## API de styling

- **CSS custom properties** (theming) : le consommateur définit `--primary-color`, etc.
- **`::part()`** : exposer des internes (`part="container"`) → `card::part(container){...}`.
- **`:host`, `:host([disabled])`, `:host-context(.dark-mode)`** : styler le host selon état/contexte.

## Form-associated (ElementInternals)

```javascript
class CustomInput extends HTMLElement {
  static formAssociated = true;
  constructor() { super(); this.internals = this.attachInternals(); }
  updateValue(value) {
    this.internals.setFormValue(value);
    this.internals.setValidity(value ? {} : { valueMissing: true }, value ? '' : 'Required');
    this.dispatchEvent(new CustomEvent('value-changed', { bubbles: true, detail: { value } }));
  }
  formResetCallback() { this.updateValue(''); }
  formDisabledCallback(d) { this.setAttribute('aria-disabled', d); }
}
```

## Anti-patterns (JAMAIS)

- ❌ `querySelector` dans `connectedCallback`.
- ❌ Manipulation directe du DOM externe (`document.getElementById('result').textContent = ...`).
- ❌ `innerHTML` pour du contenu dynamique.
- ❌ Création impérative du Shadow DOM (préférer le DSD).
- ❌ État global mutable.

## Lien avec Stencil

Stencil **génère** ces classes `extends HTMLElement` + `customElements.define`, mais remplace :
état-par-attribut → `@Prop`/`@State` réactifs ; `handleEvent` manuel → `onClick` JSX ; DSD manuel →
VDOM diff. Le mapping conceptuel est dans [[Stencil — Concepts Web Components (avant de coder)]] §1.

## Relations

- Concepts Stencil (WC vanilla vs compilé) : [[Stencil — Concepts Web Components (avant de coder)]]
- Index : [[Stencil — Index de la base de connaissances]]
