# 02 — Component API: Decorators & Lifecycle

## `@Component()`

```typescript
@Component({
  tag: 'my-component',        // REQUIRED — must contain a hyphen
  styleUrl: 'my-component.css',
  // OR mode-based styles:
  styleUrls: { ios: 'x.ios.css', md: 'x.md.css' },
  shadow: true,               // true | false | { delegatesFocus: true }
  scoped: false,              // mutually exclusive with shadow
  assetsDirs: ['assets'],
})
```

- `shadow: true` → native Shadow DOM encapsulation.
- `scoped: true` → emulated scoping via data-attributes (light DOM; styles can leak in).
- Neither → light DOM, no scoping. See `references/04-styling.md`.

## Decorator reference

### `@Prop()` — public attribute/property

```typescript
@Prop() name: string
@Prop() age: number
@Prop() isActive: boolean = true

@Prop({ mutable: true }) count = 0          // can be reassigned internally
@Prop({ reflect: true }) status = 'online'  // mirrored to an HTML attribute
@Prop({ attribute: 'user-id' }) userId: string  // custom attribute name

// Object/array props: settable ONLY via JS property, NOT HTML attribute
@Prop() userData: { email: string; avatar: string }
```

Rules:

- Props are **immutable by default** — set `mutable: true` to reassign inside the component.
- `reflect: true` syncs the value to a DOM attribute (useful for CSS attribute selectors).
- Primitive props can be set as HTML attributes; complex types only via property.

### `@State()` — internal reactive state

```typescript
@State() isOpen = false   // change triggers re-render; NOT exposed on the host
```

### `@Watch()` — react to prop/state changes (also validation)

```typescript
@Prop() age: number

@Watch('age')
validateAge(newValue: number, oldValue: number) {
  if (newValue < 0 || newValue > 150) throw new Error('Age out of range')
}
```

> `@Watch` does **not** fire on the initial value — only on subsequent changes.

### `@Event()` — emit custom DOM events

```typescript
import { Event, EventEmitter } from '@stencil/core'

@Event({
  eventName: 'todoCompleted',  // default = property name
  bubbles: true,
  cancelable: true,
  composed: true,              // cross the shadow boundary
}) todoCompleted: EventEmitter<Todo>

private complete(todo: Todo) {
  const ev = this.todoCompleted.emit(todo)   // returns the CustomEvent
  if (!ev.defaultPrevented) { /* default handling */ }
}
```

Consumers read the payload via `event.detail`. **Use camelCase names, no special chars** — this
governs how React (`onTodoCompleted`) and Angular (`@Output()`) wrappers are generated.

### `@Listen()` — declarative event listeners

```typescript
@Listen('click')                              // on host
handleClick(ev: MouseEvent) {}

@Listen('selectChange')                       // custom event from a child
handleSelect(ev: CustomEvent<{ value: string }>) {}

@Listen('resize', { target: 'window' })       // target: 'body' | 'document' | 'window'
handleResize() {}

@Listen('keydown', { target: 'document', capture: true, passive: true })
handleKey(ev: KeyboardEvent) {}
```

Listeners are added/removed automatically with the component lifecycle.

### `@Method()` — public imperative API

```typescript
@Method()
async open(): Promise<boolean> { /* ... */ return true }
```

- **Must be `async`** (returns a Promise). Exposed on the host element instance.
- Consumers call `await el.open()`. Use sparingly — prefer props/events.

### `@Element()` — host element reference

```typescript
@Element() el: HTMLElement

private query() {
  // for shadow components, query through shadowRoot:
  this.el.shadowRoot?.querySelector('.thing')
}
```

## Lifecycle hooks (in call order)

| Hook                                              | Fires                                                            | Use for                                        |
| ------------------------------------------------- | ---------------------------------------------------------------- | ---------------------------------------------- |
| `connectedCallback()`                             | every time the element attaches to DOM (can fire multiple times) | subscriptions, intervals                       |
| `componentWillLoad()`                             | **once**, before first render (can be `async`)                   | initial async data fetch (delays first render) |
| `componentWillRender()`                           | before every render (incl. first)                                | derive render data                             |
| `render()`                                        | every render                                                     | return JSX                                     |
| `componentDidRender()`                            | after every render (incl. first)                                 | post-render DOM reads                          |
| `componentDidLoad()`                              | **once**, after first render                                     | DOM is ready; measure/focus                    |
| `componentShouldUpdate(newVal, oldVal, propName)` | before re-render                                                 | return `false` to skip re-render               |
| `componentWillUpdate()`                           | before every render except first                                 | —                                              |
| `componentDidUpdate()`                            | after every render except first                                  | —                                              |
| `disconnectedCallback()`                          | element removed from DOM                                         | cleanup (clear intervals, unsubscribe)         |

```typescript
async componentWillLoad() {
  // returning a promise delays the first render until it resolves
  this.data = await (await fetch(`/api/users/${this.userId}`)).json()
}
```

## Canonical member order (Ionic style guide)

1. Own (undecorated) properties → 2. `@Element()` → 3. `@State()` → 4. `@Prop()` (with their `@Watch` right after) → 5. `@Event()` → 6. lifecycle hooks → 7. `@Listen()` → 8. public `@Method()` → 9. private methods → 10. `render()`.

JSDoc is required on every public `@Prop`/`@Event`/`@Method` — it feeds generated docs and wrapper types.
