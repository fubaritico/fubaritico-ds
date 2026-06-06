# 04 — Styling

## Shadow DOM vs Scoped vs Light DOM

| Mode       | `@Component`   | Encapsulation                | Outside styles leak in?      |
| ---------- | -------------- | ---------------------------- | ---------------------------- |
| Shadow DOM | `shadow: true` | native (real shadow root)    | **No**                       |
| Scoped     | `scoped: true` | emulated via data-attributes | **Yes** (light DOM seeps in) |
| Light DOM  | neither        | none                         | yes                          |

Shadow DOM is native in all modern browsers; Stencil falls back to scoped CSS where unsupported
(no polyfill needed). **Shadow DOM shields markup, styles, and behavior from the surrounding page.**

## `:host` and `:host()`

```css
:host {
  /* the custom element itself */
  display: flex;
  --heading-color: black; /* declare themeable vars here */
}
:host(.alert-error) {
  /* host when it has a class/attribute */
  background: #fee;
}
```

## CSS custom properties — the theming bridge

Because shadow styles can't be reached from outside, expose **CSS variables** as the public theming API:

```css
/* inside the component */
:host {
  --heading-color: black;
}
.heading {
  color: var(--heading-color);
}
```

```css
/* consumer overrides — variables DO pierce the shadow boundary */
shadow-card {
  --heading-color: blue;
}
```

## `::part()` — expose internals for styling

```tsx
<h1 part="heading">{this.heading}</h1>
```

```css
shadow-card::part(heading) {
  text-transform: uppercase; /* consumer can style this part */
}
```

For nested components, forward parts up with `exportparts`:

```tsx
<inner-component exportparts="inner-text"></inner-component>
```

## `::slotted()` — style slotted (projected) content

```css
::slotted(p) {
  margin: 0;
} /* style <p> passed into a slot */
::slotted(.highlight) {
  color: gold;
}
```

## Style modes (`styleUrls`)

Ship multiple design variants (e.g. iOS vs Material) of one component:

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

> Modes are **immutable after render** — to switch, the component must fully re-render.
> Setting an unsupported mode leaves the component unstyled — always validate.

## Global styles

```typescript
// stencil.config.ts
export const config: Config = {
  namespace: 'app',
  globalStyle: 'src/global/global.css',
}
```

Global CSS is injected into every shadow root via constructable stylesheets, so you can target
hosts globally:

```css
:host(my-button) {
  --button-border-radius: 8px;
}
```

Use for: design tokens / CSS variables, `@font-face`, resets. The compiled global file must be
linked in `index.html` for the non-shadow (page-level) parts.

## Gotchas

1. **Querying the DOM** inside a shadow component requires `@Element()` → `el.shadowRoot.querySelector(...)`.
2. **External CSS won't penetrate** shadow components — only CSS variables and `::part()` do.
3. **Tailwind utility classes from the page won't apply** inside a shadow root. To use a utility
   approach you must inject the stylesheet into the component (global style / constructable sheet)
   or rely on CSS variables. This is the central tension when porting Tailwind-based React components
   (see `references/08-porting-react-to-wc.md`).
