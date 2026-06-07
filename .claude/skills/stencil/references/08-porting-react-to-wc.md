# 08 — Porting a React Component to a Stencil Web Component

Guide for converting components from `packages/reference` (React 19 + Tailwind `ui:` prefix) into Stencil
Web Components, then regenerating a React wrapper to compare against the original.

## Pattern mapping

| React (`packages/reference`)                     | Stencil                                                    |
| ----------------------------------------- | ---------------------------------------------------------- |
| `const C: FC<CProps> = ({ ... }) => {}`   | `@Component({ tag: 'c-el' }) export class C {}`            |
| props via destructured params             | `@Prop() name: type` (one per public prop)                 |
| `useState`                                | `@State()`                                                 |
| `useEffect(cb, [])` mount                 | `componentDidLoad()` / `connectedCallback()`               |
| `useEffect` cleanup                       | `disconnectedCallback()`                                   |
| `useEffect(cb, [dep])`                    | `@Watch('dep')`                                            |
| `useRef` to a DOM node                    | `@Element()` + `el.shadowRoot?.querySelector`              |
| `onClick={fn}` callback prop              | `@Event()` emitter → consumer listens to a DOM event       |
| imperative handle / `useImperativeHandle` | `@Method() async`                                          |
| `children`                                | `<slot></slot>`                                            |
| named render-prop slots                   | named `<slot name="...">`                                  |
| `clsx(...)` conditional classes           | `class={{ ... }}` object syntax                            |
| discriminated-union props (`as`)          | `@Prop() as: 'button' \| 'link'` + branch in `render()`    |
| `import type { ComponentProps }`          | plain `@Prop` declarations; no `ComponentProps` equivalent |

## Worked example — `Badge`

React (simplified):

```tsx
export interface BadgeProps extends ComponentProps<'span'> {
  variant?: 'default' | 'success' | 'error'
}
const Badge: FC<BadgeProps> = ({
  variant = 'default',
  className,
  children,
  ...rest
}) => (
  <span
    className={clsx('ui:badge', `ui:badge-${variant}`, className)}
    {...rest}
  >
    {children}
  </span>
)
```

Stencil:

```tsx
import { Component, Prop, Host, h } from '@stencil/core'

@Component({ tag: 'ui-badge', styleUrl: 'ui-badge.css', shadow: true })
export class UiBadge {
  /** Visual variant of the badge. */
  @Prop() variant: 'default' | 'success' | 'error' = 'default'

  render() {
    return (
      <Host class={{ badge: true, [`badge-${this.variant}`]: true }}>
        <slot></slot>
      </Host>
    )
  }
}
```

## Worked example — `Button` (discriminated union)

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
        {this.as === 'link' ? (
          <a class={cls} href={this.href}>
            <slot></slot>
          </a>
        ) : (
          <button class={cls} onClick={this.onClick}>
            <slot></slot>
          </button>
        )}
      </Host>
    )
  }
}
```

## The Tailwind problem (critical for this repo)

`packages/reference` styles with Tailwind utilities (`ui:` prefix) **on the page's stylesheet**. With
`shadow: true`, those page utilities **do not reach inside the shadow root**. Options:

1. **Author plain CSS** in the component's `.css` (most idiomatic for a WC design system).
2. **Inject Tailwind output as a global style** (`globalStyle` in config) — it's added to every
   shadow root via constructable stylesheets. Heavier, but lets you reuse utilities.
3. **Use `scoped: true` instead of shadow** — page styles leak in, so existing Tailwind applies, but
   you lose true encapsulation.
4. **Expose theming via CSS variables / `::part()`** — the WC-native way to stay themeable.

For _discovery/comparison_, option 1 (plain CSS) keeps the experiment clean and shows the real cost
of leaving Tailwind behind.

## What to compare after `npm run build`

Open the generated React wrapper (`outDir`) next to the hand-written `packages/reference/src/<C>/<C>.tsx`:

- **Prop surface** — does the discriminated union survive, or flatten to loose props?
- **Events** — `onUiClick` + `e.detail` vs the React `onClick` callback.
- **Types** — quality of generated `.d.ts` vs hand-written `ComponentProps`-based types.
- **Bundle/lines** — generated wrapper size vs original.
- **What's lost** — JSDoc fidelity, `ComponentProps` spread, ref ergonomics, children typing.

## Checklist per ported component

- [ ] `tag` is hyphenated and prefixed (`ui-...`)
- [ ] every public `@Prop`/`@Event`/`@Method` has JSDoc
- [ ] callbacks → `@Event` emitters (camelCase names)
- [ ] `children` → `<slot>`
- [ ] decide shadow vs scoped (document the styling choice)
- [ ] spec test added (`references/09-testing.md`)
- [ ] `npm run build` → wrapper generated → compared to original
