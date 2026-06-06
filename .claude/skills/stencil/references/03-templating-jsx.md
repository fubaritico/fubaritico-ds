# 03 — Templating & JSX

Stencil uses JSX, but it is **not React JSX**. Pragma is Stencil's `h`. Always import it:

```tsx
import { Component, h } from '@stencil/core'
```

## `render()` and `<Host>`

`render()` returns the JSX tree. To set attributes/classes/listeners on the **host element** itself
(and to return multiple roots like a fragment), wrap in `<Host>`:

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
        class={{
          alert: true,
          [`alert-${this.type}`]: true,
          dismissible: this.dismissible,
        }}
      >
        <div class="alert-content">
          <slot></slot>
        </div>
        {this.dismissible && <button aria-label="Dismiss">×</button>}
      </Host>
    )
  }
}
```

## Class & style binding

```tsx
// object syntax — keys with truthy values are applied
<div class={{ active: this.isActive, 'is-open': this.isOpen }} />
// string still works
<div class={`base ${this.isActive ? 'active' : ''}`} />
// inline style is an object
<div style={{ color: this.color, '--gap': `${this.gap}px` }} />
```

## Conditional rendering

```tsx
// ternary
{
  this.name ? <p>Hello {this.name}</p> : <p>Hello World</p>
}
// short-circuit
{
  this.isLoading && <spinner-el />
}
// early return in render()
if (!this.data) return null
```

## Lists — `key` required

```tsx
{
  this.todos.map((todo) => <div key={todo.uid}>{todo.taskName}</div>)
}
```

`key` lets Stencil match elements across renders and avoid recreating DOM nodes (same role as React's key).

## Slots (Shadow DOM composition)

```tsx
// default + named slots
<div class="card">
  <slot name="header"></slot>
  <slot></slot> {/* default */}
  <slot name="footer"></slot>
</div>
```

Consumer:

```html
<my-card>
  <h2 slot="header">Title</h2>
  <p>Body goes in the default slot</p>
  <span slot="footer">Footer</span>
</my-card>
```

## Forms

Controlled-input pattern using `@State` + `onInput`:

```tsx
@State() value: string

private handleChange = (e: Event) => {
  this.value = (e.target as HTMLInputElement).value
}

render() {
  return (
    <form onSubmit={(e) => this.handleSubmit(e)}>
      <input type="text" value={this.value} onInput={this.handleChange} />
      <input type="submit" value="Submit" />
    </form>
  )
}
```

> Use `onInput` (fires on every keystroke) for live binding; `onChange` only fires on blur/commit.

## Functional components

Lightweight, stateless, render-only — no decorators, no shadow, no lifecycle:

```tsx
import { FunctionalComponent, h } from '@stencil/core'

interface BadgeProps {
  color: string
}

export const Badge: FunctionalComponent<BadgeProps> = ({ color }, children) => (
  <span class="badge" style={{ background: color }}>
    {children}
  </span>
)

// usage inside a component's render():
<Badge color="red">New</Badge>
```

The second argument is `children` (an array of vnodes). Functional components are inlined at
compile time — they do **not** produce a custom element.

## Raw HTML

```tsx
<div innerHTML={this.trustedHtml}></div>
```

There is no `dangerouslySetInnerHTML` — use the native `innerHTML` prop (sanitize untrusted input yourself).
