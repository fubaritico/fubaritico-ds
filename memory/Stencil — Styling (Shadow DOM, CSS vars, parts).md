---
title: Stencil — Styling (Shadow DOM, CSS vars, parts)
type: guide
permalink: main/stencil/stencil-styling-shadow-dom-css-vars-parts
tags:
- stencil
- styling
- shadow-dom
- css-variables
- parts
---

# Stencil — Styling (Shadow DOM, CSS vars, parts)

## Shadow DOM vs Scoped vs Light DOM

| Mode       | `@Component`   | Encapsulation                | Styles externes fuient à l'intérieur ? |
| ---------- | -------------- | ---------------------------- | -------------------------------------- |
| Shadow DOM | `shadow: true` | native (vrai shadow root)    | **Non**                                |
| Scoped     | `scoped: true` | émulée via data-attributes   | **Oui** (light DOM s'infiltre)         |
| Light DOM  | (ni l'un ni l'autre) | aucune                 | oui                                    |

Shadow DOM natif dans tous les navigateurs modernes ; Stencil retombe en scoped CSS si non supporté
(pas de polyfill). Shadow DOM protège markup, styles ET comportement de la page environnante.

## `:host` et `:host()`

```css
:host {                /* l'élément custom lui-même */
  display: flex;
  --heading-color: black;  /* déclarer les variables thématisables ici */
}
:host(.alert-error) {  /* host quand il a une classe/attribut */
  background: #fee;
}
```

## CSS custom properties — le pont de theming

Les styles shadow ne sont pas atteignables de l'extérieur → exposer des **variables CSS** comme API publique de theming :

```css
/* dans le composant */
:host { --heading-color: black; }
.heading { color: var(--heading-color); }
```
```css
/* override consommateur — les variables PERCENT la frontière shadow */
shadow-card { --heading-color: blue; }
```

## `::part()` — exposer des internes pour styling

```tsx
<h1 part="heading">{this.heading}</h1>
```
```css
shadow-card::part(heading) { text-transform: uppercase; }
```
Pour composants imbriqués, forwarder les parts avec `exportparts` :
```tsx
<inner-component exportparts="inner-text"></inner-component>
```

## `::slotted()` — styler le contenu slotté (projeté)

```css
::slotted(p) { margin: 0; }            /* styler <p> passé dans un slot */
::slotted(.highlight) { color: gold; }
```

## Style modes (`styleUrls`)

Livrer plusieurs variantes design (ex: iOS vs Material) d'un même composant :

```tsx
@Component({
  tag: 'simple-button',
  styleUrls: { md: './simple-button.md.css', ios: './simple-button.ios.css' },
})
```
```typescript
import { setMode, getMode } from '@stencil/core'
setMode((el) => el.getAttribute('mode') || 'md')
```
> Modes **immuables après render** — pour switcher, le composant doit re-render complètement.
> Un mode non supporté laisse le composant non stylé — toujours valider.

## Styles globaux

```typescript
// stencil.config.ts
export const config: Config = { namespace: 'app', globalStyle: 'src/global/global.css' }
```
Le CSS global est injecté dans chaque shadow root via constructable stylesheets → on peut cibler les hosts globalement :
```css
:host(my-button) { --button-border-radius: 8px; }
```
Usage : design tokens / variables CSS, `@font-face`, resets. Le fichier global compilé doit être lié
dans `index.html` pour les parties non-shadow (niveau page).

## Gotchas

1. **Querier le DOM** dans un composant shadow nécessite `@Element()` → `el.shadowRoot.querySelector(...)`.
2. **Le CSS externe ne pénètre pas** les composants shadow — seules les variables CSS et `::part()` le font.
3. **Les classes utilitaires Tailwind de la page ne s'appliquent PAS** dans un shadow root. Pour une
   approche utilitaire : injecter la feuille dans le composant (global style / constructable sheet) ou
   compter sur les variables CSS. C'est la tension centrale du port de composants React/Tailwind →
   voir [[Stencil — Porter un composant React vers un Web Component]].

## Relations

- Templating : [[Stencil — Templating JSX]]
- Port React→WC (problème Tailwind) : [[Stencil — Porter un composant React vers un Web Component]]
