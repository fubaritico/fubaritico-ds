---
title: Stencil — Porter un composant React vers un Web Component
type: guide
permalink: main/stencil/stencil-porter-un-composant-react-vers-un-web-component
tags:
- stencil
- react
- porting
- tailwind
- mapping
---

# Stencil — Porter un composant React vers un Web Component

> Guide pour convertir des composants React (ex `packages/ui` : React 19 + Tailwind préfixe `ui:`) en
> WC Stencil, puis régénérer un wrapper React pour comparer à l'original.

## Mapping des patterns

| React (`packages/ui`)                     | Stencil                                                    |
| ----------------------------------------- | --------------------------------------------------------- |
| `const C: FC<CProps> = ({ ... }) => {}`   | `@Component({ tag: 'c-el' }) export class C {}`            |
| props via params destructurés             | `@Prop() name: type` (une par prop publique)              |
| `useState`                                | `@State()`                                                 |
| `useEffect(cb, [])` mount                 | `componentDidLoad()` / `connectedCallback()`               |
| `useEffect` cleanup                       | `disconnectedCallback()`                                   |
| `useEffect(cb, [dep])`                    | `@Watch('dep')`                                            |
| `useRef` vers un nœud DOM                 | `@Element()` + `el.shadowRoot?.querySelector`              |
| `onClick={fn}` callback prop              | `@Event()` emitter → le consommateur écoute un event DOM   |
| imperative handle / `useImperativeHandle` | `@Method() async`                                          |
| `children`                                | `<slot></slot>`                                            |
| slots render-prop nommés                  | `<slot name="...">`                                        |
| `clsx(...)` classes conditionnelles       | `class={{ ... }}` syntaxe objet                            |
| props union discriminée (`as`)            | `@Prop() as: 'button' \| 'link'` + branche dans `render()` |
| `import type { ComponentProps }`          | déclarations `@Prop` simples ; pas d'équivalent `ComponentProps` |

## Exemple — `Badge`

React :
```tsx
export interface BadgeProps extends ComponentProps<'span'> {
  variant?: 'default' | 'success' | 'error'
}
const Badge: FC<BadgeProps> = ({ variant = 'default', className, children, ...rest }) => (
  <span className={clsx('ui:badge', `ui:badge-${variant}`, className)} {...rest}>{children}</span>
)
```
Stencil :
```tsx
import { Component, Prop, Host, h } from '@stencil/core'

@Component({ tag: 'ui-badge', styleUrl: 'ui-badge.css', shadow: true })
export class UiBadge {
  /** Visual variant of the badge. */
  @Prop() variant: 'default' | 'success' | 'error' = 'default'
  render() {
    return (
      <Host class={{ badge: true, [`badge-${this.variant}`]: true }}><slot></slot></Host>
    )
  }
}
```

## Exemple — `Button` (union discriminée + event)

```tsx
@Component({ tag: 'ui-button', styleUrl: 'ui-button.css', shadow: true })
export class UiButton {
  /** Render as a native button or an anchor. */
  @Prop() as: 'button' | 'link' = 'button'
  /** Visual variant. */
  @Prop() variant: 'primary' | 'secondary' = 'primary'
  /** Link href (only when as="link"). */
  @Prop() href?: string
  /** Emitted on activation. */
  @Event() uiClick: EventEmitter<void>

  private onClick = () => this.uiClick.emit()

  render() {
    const cls = { btn: true, [`btn-${this.variant}`]: true }
    return (
      <Host>
        {this.as === 'link'
          ? <a class={cls} href={this.href}><slot></slot></a>
          : <button class={cls} onClick={this.onClick}><slot></slot></button>}
      </Host>
    )
  }
}
```

## Le problème Tailwind (critique)

`packages/ui` style avec des utilitaires Tailwind (`ui:`) **sur la feuille de la page**. Avec
`shadow: true`, ces utilitaires de page **n'atteignent pas l'intérieur du shadow root**. Options :

1. **Écrire du CSS plain** dans le `.css` du composant (le plus idiomatique pour un DS en WC).
2. **Injecter la sortie Tailwind en global style** (`globalStyle` dans la config) — ajouté à chaque shadow root via constructable stylesheets. Plus lourd, mais réutilise les utilitaires.
3. **Utiliser `scoped: true`** au lieu de shadow — les styles de page fuient → Tailwind s'applique, mais on perd la vraie encapsulation.
4. **Exposer le theming via variables CSS / `::part()`** — la voie WC-native pour rester thématisable.

Pour découverte/comparaison, **option 1 (CSS plain)** garde l'expérience propre et montre le vrai coût d'abandonner Tailwind.

## Quoi comparer après `npm run build`

Ouvrir le wrapper React généré (`outDir`) à côté du `packages/ui/src/<C>/<C>.tsx` écrit à la main :
- **Surface de props** — l'union discriminée survit-elle, ou s'aplatit-elle en props lâches ?
- **Events** — `onUiClick` + `e.detail` vs le callback `onClick` React.
- **Types** — qualité des `.d.ts` générés vs les types `ComponentProps` à la main.
- **Bundle/lignes** — taille du wrapper généré vs original.
- **Ce qui est perdu** — fidélité JSDoc, spread `ComponentProps`, ergonomie des refs, typage des children.

## Checklist par composant porté

- [ ] `tag` hyphené et préfixé (`ui-...`)
- [ ] chaque `@Prop`/`@Event`/`@Method` public a une JSDoc
- [ ] callbacks → `@Event` emitters (noms camelCase)
- [ ] `children` → `<slot>`
- [ ] décider shadow vs scoped (documenter le choix de styling)
- [ ] spec test ajouté ([[Stencil — Testing]])
- [ ] `npm run build` → wrapper généré → comparé à l'original

## Relations

- Styling (tension Tailwind) : [[Stencil — Styling (Shadow DOM, CSS vars, parts)]]
- API composants : [[Stencil — API des composants (décorateurs & lifecycle)]]
- Testing : [[Stencil — Testing]]
