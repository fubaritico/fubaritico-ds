# Externalising state: levels + a simplified machine + a catalogue of hooks

> Reference documentation of the `state-storage` skill. Three ways to keep a state **outside React**, from the
> lightest to the richest, each illustrated by a **relevant component** and its **lifecycle**. Then a **proposal
> for a simplified machine** (without taking over Headless UI's whole abstraction). Finally a **catalogue of
> reusable behaviour hooks**: role, usage, example, relevance. No unexplained acronym. The Headless UI APIs cited
> are real (v2.2.10); code marked « proposal » is a proposal internal to the project.

**Outline** — A. Three state levels (createStore · Zustand · simplified machine) — B. The simplified machine, in
detail — C. Catalogue of hooks — D. Recap applied to the design system's components.

---

## A. Three levels of state externalisation

"Externalising" = taking the state out of the React component and putting it in an **in-memory object** that
React merely **reads**. Done when local state (`useState`/`useReducer`) is no longer enough: sharing between
distant components, or many subscribers that each want a small slice.

| Level                | What it is                                                                    | Selectors?                 | Effects?       | When to use it                                                         | Relevant component               |
| -------------------- | ----------------------------------------------------------------------------- | -------------------------- | -------------- | ---------------------------------------------------------------------- | -------------------------------- |
| **1. `createStore`** | A "closure" store: `read / subscribe / dispatch`.                             | ❌ (global subscription)   | ❌             | A small **global singleton** read whole by everyone.                   | **Scroll-lock** (Modal + Drawer) |
| **2. Zustand**       | A library (~1 KB) = `createStore` **+ built-in selectors** + a `create` hook. | ✅ (built in)              | via middleware | **Global** shared state, an **imperative API** callable from anywhere. | **Toaster** (notifications)      |
| **3. Machine**       | A class `state + reduce + subscribe + send` (+ optional selectors/effects).   | ✅ (delegated to the hook) | ✅ (optional)  | The **brain** of a **complex** component (many children, keyboard).    | **Listbox / Typeahead**          |

> Reminder: a _closure_ = a function that **captures** local variables and keeps them alive after it returns. A
> closure store = variables (`state`, `listeners`) shut inside a factory function, reachable only through the
> methods it exposes.

---

### Level 1 — `createStore` (the lightest)

**What it is.** A small factory returning three functions: `getSnapshot()` (read the state), `subscribe(cb)` (be
told of **every** change), `dispatch(action)` (trigger a change). **No selector**: every subscriber is woken on
every change. So reserved for a **small singleton** read **whole**.

```ts
// proposal — packages/behaviors/src/create-store.ts  (≈ Headless UI's utils/store.ts)
type Listener = () => void

export function createStore<
  T,
  Actions extends Record<string, (this: T, ...a: any[]) => T | void>,
>(initial: () => T, actions: Actions) {
  let state = initial()
  let listeners = new Set<Listener>()

  return {
    getSnapshot: () => state, // read
    subscribe(cb: Listener) {
      listeners.add(cb)
      return () => listeners.delete(cb) // returns an unsubscribe function
    },
    dispatch(key: keyof Actions, ...args: any[]) {
      let next = actions[key].call(state, ...args)
      if (next) {
        state = next as T
        listeners.forEach((l) => l()) // wakes ALL the subscribers
      }
    },
  }
}
```

**Where does `createStore` come from?** Neither a React standard nor a library: it is a **house utility of
Headless UI** (`utils/store.ts:12`, 39 lines, zero dependency). The proposal above is a **functionally identical**
adaptation. The exact original:

```ts
// utils/store.ts (Headless UI v2.2.10) — the original
type ChangeFn = () => void
type UnsubscribeFn = () => void
type ActionFn<T> = (this: T, ...args: any[]) => T | void
type StoreActions<Key extends string, T> = Record<Key, ActionFn<T>>

export interface Store<T, ActionKey extends string> {
  getSnapshot(): T
  subscribe(onChange: ChangeFn): UnsubscribeFn
  dispatch(action: ActionKey, ...args: any[]): void
}

export function createStore<T, ActionKey extends string>(
  initial: () => T,
  actions: StoreActions<ActionKey, T>
): Store<T, ActionKey> {
  let state: T = initial()
  let listeners = new Set<ChangeFn>()
  return {
    getSnapshot() {
      return state
    },
    subscribe(onChange) {
      listeners.add(onChange)
      return () => listeners.delete(onChange)
    },
    dispatch(key, ...args) {
      let newState = actions[key].call(state, ...args)
      if (newState) {
        state = newState
        listeners.forEach((listener) => listener()) // wakes ALL the subscribers
      }
    },
  }
}
```

A single consumer in the whole of Headless UI: `hooks/document-overflow` (the scroll-lock), wired to React through
`hooks/use-store.ts:4` (`useStore` → `useSyncExternalStore`). Exactly this Level 1.

> ⚠️ **Do not confuse.** The name `createStore` is carried by three **distinct** things: this **internal** Headless
> UI utility (Level 1, house-made); **Zustand**'s `createStore` (Level 2, a library); **Redux**'s (something else
> again). Level 1 imports **nothing** — ~20 lines to write (or copy).

**The relevant component: the scroll lock shared by Modal + Drawer.** When an overlay opens, the page behind must
not scroll. Several overlays can be open; so a **counter** is needed (unlock only when the last one closes).

```ts
// proposal — packages/behaviors/src/scroll-lock.ts
export const scrollLock = createStore(() => ({ count: 0 }), {
  lock() {
    if (this.count === 0) document.body.style.overflow = 'hidden' // 1st overlay → lock
    return { count: this.count + 1 }
  },
  unlock() {
    let count = Math.max(0, this.count - 1)
    if (count === 0) document.body.style.overflow = '' // last one closed → unlock
    return { count }
  },
})

// the React hook that plugs into it
export function useScrollLock(enabled: boolean) {
  useEffect(() => {
    if (!enabled) return
    scrollLock.dispatch('lock')
    return () => scrollLock.dispatch('unlock') // cleanup on close/unmount
  }, [enabled])
}
```

```tsx
// usage in Modal (and, identically, in Drawer)
function Modal({ open, children }: ModalProps) {
  useScrollLock(open) // ← the whole lock fits in this line
  return open ? <div className="ui-modal">{children}</div> : null
}
```

**Lifecycle (step by step).**

1. The Modal opens → `useScrollLock(true)` → `dispatch('lock')` → `count` 0 → 1 → `overflow:hidden` on `<body>`.
2. A Drawer opens on top → `dispatch('lock')` → `count` 1 → 2 (the `<body>` is already locked, nothing more to do).
3. The Drawer closes → its `useEffect` cleanup → `dispatch('unlock')` → `count` 2 → 1 (still locked: the Modal is
   still there).
4. The Modal closes → `dispatch('unlock')` → `count` 1 → 0 → scrolling is **restored**.

**Relevance.** Ideal when the state is **a small global fact** (locked or not, current theme, density) nobody reads
"by slice". No selector = no needless complexity. Exactly how Headless UI uses it (`hooks/document-overflow`).
(Note: the DS's own `useNativeDialog` restores the host's previous overflow rather than blanking it — REACT-69.)

---

### Level 2 — Zustand (store + selectors, without rewriting it)

**What it is.** **Zustand** is an external library (~1 KB): roughly, a `createStore` **with built-in selectors**
and a ready-made hook (`create`). The subscription goes straight to a **slice**. To be accepted as a
**dependency** (a tiny one, with no context and no _provider_).

**The relevant component: the notification system (Toaster).** A toast can be triggered from **anywhere** in the
app — including outside a React component (in a `catch`, a utility function). The textbook case of a **global
imperative API**.

```ts
// proposal — packages/behaviors-react/src/toasts.ts
import { create } from 'zustand'

type Toast = { id: string; message: string }

export const useToasts = create<{
  toasts: Toast[]
  add: (message: string) => void
  remove: (id: string) => void
}>((set) => ({
  toasts: [],
  add: (message) =>
    set((s) => ({
      toasts: [...s.toasts, { id: crypto.randomUUID(), message }],
    })),
  remove: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
}))

// an imperative API callable ANYWHERE, even outside React:
export const toast = (message: string) => useToasts.getState().add(message)
```

```tsx
// the rendering: <Toaster> subscribes to the `toasts` SLICE
function Toaster() {
  let toasts = useToasts((s) => s.toasts) // ← built-in selector: re-renders only when `toasts` changes
  let remove = useToasts((s) => s.remove)
  return (
    <div className="ui-toaster">
      {toasts.map((t) => (
        <ToastItem key={t.id} toast={t} onDone={() => remove(t.id)} />
      ))}
    </div>
  )
}

// elsewhere, in any error handler:
toast('Save failed') // ← no component, no context needed
```

**Lifecycle (step by step).**

1. Somewhere, `toast('Saved')` → `useToasts.getState().add(...)` → the `toasts` list changes.
2. `<Toaster>`, subscribed to `s.toasts`, redraws and shows the new toast.
3. The `ToastItem` schedules its own removal (a timer) → calls `remove(id)` → the list changes → `<Toaster>` redraws
   without it.
4. A component reading only `useToasts((s) => s.toasts.length)` would wake **only** on a change of **count** — the
   benefit of built-in selectors.

**Relevance.** When a **global imperative API** (`toast()`, `openCommandPalette()`) + fine subscriptions are
wanted, **without** writing the mechanics yourself. The price: one more dependency. **With no dependency at all**,
Level 1 + `useSyncExternalStore` does the same, more verbosely — here is the detail.

#### **Dependency-free** variant: `createStore` (Level 1) + native `useSyncExternalStore`

`useSyncExternalStore` ships **inside** React 18 (so zero dependency). The same Toaster with Level 1's
`createStore`, then a hook that reads the list:

```ts
// proposal — a toaster WITH NO dependency (reuses Level 1's createStore)
type Toast = { id: string; message: string }

export const toastStore = createStore(() => ({ toasts: [] as Toast[] }), {
  add(message: string) {
    return { toasts: [...this.toasts, { id: crypto.randomUUID(), message }] }
  },
  remove(id: string) {
    return { toasts: this.toasts.filter((t) => t.id !== id) }
  },
})
export const toast = (message: string) => toastStore.dispatch('add', message)
```

```tsx
import { useSyncExternalStore } from 'react' // native, ZERO dependency

function useToasts() {
  return useSyncExternalStore(
    toastStore.subscribe, // how to subscribe
    () => toastStore.getSnapshot().toasts, // snapshot (browser)
    () => toastStore.getSnapshot().toasts // snapshot (server, for server rendering)
  )
}

function Toaster() {
  let toasts = useToasts()
  return (
    <div className="ui-toaster">
      {toasts.map((t) => (
        <ToastItem key={t.id} toast={t} />
      ))}
    </div>
  )
}
```

> ⚠️ **The native trap (a must-know).** `useSyncExternalStore` requires the snapshot (`getSnapshot`) to **return the
> same reference** as long as nothing changed. Here it works: `state.toasts` is a **new** array only when the list
> changes. **But** for a **derived** slice (computed on the fly — e.g. `toasts.filter((t) => t.urgent)` or
> `{ count, last }`), each call creates a **new** object → React believes "it changes all the time" → a **re-render
> loop** (or the warning « getSnapshot should be cached »). For a derived slice, **memoise explicitly**… or move to
> `useSyncExternalStoreWithSelector`.

#### The **safe** selector: `useSyncExternalStoreWithSelector`

```ts
import { useSyncExternalStoreWithSelector } from 'use-sync-external-store/with-selector'
```

`use-sync-external-store` is a **small official package of the React team** (one file, ~1 KB). React 18 integrated
`useSyncExternalStore` **but not** the "with selector" variant — the `/with-selector` entry provides it. Many do not
really count it as "a dependency": official, tiny, and Headless UI uses it. It takes **in addition** a **selector** +
a **comparator**, and **memoises** the result → no loop, even for a derived slice:

```ts
import { shallowEqual } from '@fubaritico/behaviors' // or Headless UI's version

let urgents = useSyncExternalStoreWithSelector(
  toastStore.subscribe,
  () => toastStore.getSnapshot(), // FULL snapshot
  () => toastStore.getSnapshot(), // (server)
  (s) => s.toasts.filter((t) => t.urgent), // DERIVED slice (a new array on every call) — fine here
  shallowEqual // "did the slice REALLY change?" (shallow comparison)
)
```

**The rule, in one line:**

- Slice = the **whole object** or a **stable reference** → **native** `useSyncExternalStore` (zero dependency).
- **Derived/computed** slice → `useSyncExternalStoreWithSelector` (official package, ~1 KB) — or manual memoisation.

> **Exactly** Headless UI's choice: `useSyncExternalStoreWithSelector` in `react-glue.tsx` (the machines' `useSlice`,
> to select freely); native `useSyncExternalStore` in `hooks/use-store.ts` (where the slice is the whole state, a
> stable reference). The DS's `TabsService` adapter follows the same rule (sliced subscriptions).

---

### Level 3 — The machine (the brain of a complex component)

The subject of **Part B** (a simplified version proposed). In a word: a class `state + reduce + subscribe + send`,
created **once per component instance**, to which each child subscribes **by slice**. To reserve for components
**with many children + keyboard**: Listbox, Typeahead. The relevant component shown below: a **Listbox**
(single-selection dropdown list).

---

## B. Proposal: a **simplified** machine

Headless UI puts **a lot** into its `Machine` class: internal selectors, event subscribers (`on`), `disposables`
(cleanup), `batch` (grouping), `DefaultMap`, a house `shallowEqual`. **Not all of it is needed from the start.** Keep
the **core** and add the rest **on demand**.

### What we keep / what we drop

| Headless UI piece                                             | Keep?         | Why                                                                                       |
| ------------------------------------------------------------- | ------------- | ----------------------------------------------------------------------------------------- |
| `state` + `reduce` + `send` + `subscribe`                     | ✅            | The irreducible core.                                                                     |
| Selectors **inside** the class                                | ❌ (at first) | Delegated to the **React hook** (see the glue). Simpler.                                  |
| `on(type, cb)` (event effects)                                | ❌ (at first) | To add **only** when coordination/effects are needed (e.g. close when another one opens). |
| `disposables` / `batch` / `DefaultMap` / house `shallowEqual` | ❌            | Advanced optimisations. To bring back if performance demands it.                          |

### The core (≈ 25 lines, framework-free)

```ts
// proposal — packages/behaviors/src/machine.ts
type Listener = () => void

export abstract class Machine<State, Event> {
  private state: State
  private listeners = new Set<Listener>()

  constructor(initial: State) {
    this.state = initial
  }

  /** The ONLY transition rule: (state, event) => new state. Pure, immutable. */
  abstract reduce(state: State, event: Event): State

  /** Read the current snapshot (for React). */
  getSnapshot = (): State => this.state

  /** Subscribe to changes; returns an unsubscribe function. */
  subscribe = (listener: Listener): (() => void) => {
    this.listeners.add(listener)
    return () => this.listeners.delete(listener)
  }

  /** The ONLY entry point of changes. */
  send = (event: Event): void => {
    let next = this.reduce(this.state, event)
    if (next === this.state) return // immutability: same object ⇒ nothing changed ⇒ stop
    this.state = next
    this.listeners.forEach((l) => l()) // wake the subscribers
  }
}
```

(The DS's real version is `Store<S>` in `packages/behaviors/src/internal/store.ts`, extracted with the second
service; `TabsService`, `ColorPickerService`, `PopoverService` and `TooltipService` extend it.)

### The React glue (the bridge, ≈ 8 lines)

The **selectors** are delegated here: React (through `useSyncExternalStoreWithSelector`) wakes a component only if
**its slice** changes. (`useSyncExternalStore` = React 18's tool made to read a state outside React, with no display
tearing during a render.)

```ts
// proposal — packages/behaviors-react/src/use-machine.ts
import { useSyncExternalStoreWithSelector } from 'use-sync-external-store/with-selector'
import type { Machine } from '@fubaritico/behaviors'

export function useMachineSlice<S, E, Slice>(
  machine: Machine<S, E>,
  selector: (state: S) => Slice,
  isEqual?: (a: Slice, b: Slice) => boolean
): Slice {
  return useSyncExternalStoreWithSelector(
    machine.subscribe, // how to subscribe
    machine.getSnapshot, // snapshot (browser)
    machine.getSnapshot, // snapshot (server — for server rendering)
    selector, // the slice
    isEqual // comparator (default: ===)
  )
}
```

### A concrete component: Listbox (single selection)

```ts
// proposal — packages/behaviors/src/listbox-machine.ts
export type ListboxState = {
  open: boolean
  options: string[]
  activeIndex: number | null // the option "hovered" by keyboard
  value: string | null // the chosen option
}
export type ListboxEvent =
  | { type: 'open' }
  | { type: 'close' }
  | { type: 'next' }
  | { type: 'prev' }
  | { type: 'selectActive' }
  | { type: 'setOptions'; options: string[] }

export class ListboxMachine extends Machine<ListboxState, ListboxEvent> {
  reduce(state: ListboxState, event: ListboxEvent): ListboxState {
    switch (event.type) {
      case 'open':
        if (state.open) return state // guard
        return { ...state, open: true, activeIndex: state.activeIndex ?? 0 }
      case 'close':
        if (!state.open) return state
        return { ...state, open: false, activeIndex: null }
      case 'next':
        return {
          ...state,
          activeIndex: clamp(
            (state.activeIndex ?? -1) + 1,
            state.options.length
          ),
        }
      case 'prev':
        return {
          ...state,
          activeIndex: clamp(
            (state.activeIndex ?? state.options.length) - 1,
            state.options.length
          ),
        }
      case 'selectActive':
        if (state.activeIndex === null) return state
        return {
          ...state,
          value: state.options[state.activeIndex],
          open: false,
        }
      case 'setOptions':
        return { ...state, options: event.options }
    }
  }

  // "Selectors" as plain functions (used by the hook):
  isActive = (state: ListboxState, index: number) => state.activeIndex === index
}

function clamp(i: number, length: number) {
  return Math.max(0, Math.min(i, length - 1))
}
```

```tsx
// proposal — on the React side: the Context carries the MACHINE, not the state
const ListboxContext = createContext<ListboxMachine | null>(null)

function Listbox({ options, children }: ListboxProps) {
  let machine = useMemo(() => {
    let m = new ListboxMachine({
      open: false,
      options,
      activeIndex: null,
      value: null,
    })
    return m
  }, []) // created ONCE
  return (
    <ListboxContext.Provider value={machine}>
      {children}
    </ListboxContext.Provider>
  )
}

function Option({ index, children }: OptionProps) {
  let machine = useContext(ListboxContext)!
  // subscribes to ITS slice: "am I the active option?"
  let active = useMachineSlice(machine, (s) => machine.isActive(s, index))
  return (
    <li
      className={clsx(
        'ui-listbox__option',
        active && 'ui-listbox__option--active'
      )}
    >
      {children}
    </li>
  )
}
```

(In the DS, React 19 idioms apply instead: `<Context value>` and `use()` behind a guarded hook —
`rules/patterns-compound.md`.)

**Lifecycle (step by step).**

1. `<Listbox>` creates the machine **once** (`useMemo`) and puts it in the Context. The Context carries **the
   machine** (a stable reference), not the state.
2. Each `<Option>` subscribes to its slice `isActive(index)` through `useMachineSlice`.
3. Arrow down → `machine.send({ type: 'next' })` → `reduce` computes `activeIndex` (3 → 4) → `send` wakes the
   subscribers.
4. Only option 3 (active → inactive) and option 4 (inactive → active) change slice ⇒ **2 redraws**, not N. The other
   options do not move.
5. Enter → `send({ type: 'selectActive' })` → `value` updated, `open` back to `false`.

**When to bring back what was dropped?** The day a Listbox must **close when another overlay opens** → bring back
`on(type, cb)` + a small global stacking machine. The day registering 300 options triggers 300 transitions → bring
back `batch`. **Not before.**

---

## C. Catalogue of behaviour hooks (reusable as is)

These hooks are **pure behaviour** (accessibility, focus, keyboard, lifecycle) — reusable **whatever** state
architecture is chosen above. For each: role · usage · example · relevance (component concerned). Real Headless UI
v2.2.10 signatures.

> **Full source code** of each hook (copyable, ordered by dependencies): `behavior-hooks-source.md`.

### `useEvent(cb)` — a callback with a **stable** identity

- **Role.** Returns a function whose **reference never changes**, but which always calls the **latest** version of
  the closure. Solves _stale closures_ (reading an old value) and the unstable identity that breaks
  `memo`/dependencies.
- **Example.**
  ```ts
  let onSelect = useEvent(() => props.onChange(value)) // stable, but always reads the latest props.onChange
  ```
- **Relevance.** **Everywhere** a handler is passed to a memoised child, or to an `addEventListener`. (React 19's
  `useEffectEvent` covers the effect case.)

### `useLatestValue(value)` — the **latest** value in a ref

- **Role.** Keeps `value` in a `{ current }` box updated after each render. Lets long-lived code read a **fresh**
  value without re-subscribing to it.
- **Example.**
  ```ts
  let latest = useLatestValue(props.value)
  useEffect(() => {
    const id = setInterval(() => console.warn(latest.current), 1000)
    return () => clearInterval(id)
  }, [])
  ```
- **Relevance.** The bridge "live prop → durable logic" (the Combobox's `dataRef` in small).

### `useControllable(controlledValue, onChange?, defaultValue?)` — controlled **or** uncontrolled

- **Role.** The value pattern: if the parent passes `value` + `onChange`, the component is **controlled**; otherwise
  it manages an **internal** state (`defaultValue`). Returns a unified `[value, onChange]`. (It even warns in the
  console when switching from one to the other.)
- **Example.**
  ```ts
  let [value, setValue] = useControllable(
    props.value,
    props.onChange,
    props.defaultValue
  )
  ```
- **Relevance.** **Every component with a value**: Checkbox, Switch, Input, Tabs, Typeahead, DatePicker.

### `useSyncRefs(...refs)` — merge several refs into one

- **Role.** A component has its **internal ref** (to handle the element) **and** must forward the consumer's
  **external ref**. This hook writes both.
- **Example.**
  ```ts
  let internalRef = useRef<HTMLButtonElement>(null)
  let ref = useSyncRefs(internalRef, props.ref) // <button ref={ref} />
  ```
- **Relevance.** **Every ref-forwarding component** that also needs the element internally (Button, Input,
  Option…). The DS's version: `useMergedRef` (born of REACT-76, a consumer ref that silently disabled Modal and
  Drawer).

### `useId()` — a **stable, SSR-safe** identifier

- **Role.** A unique identifier, **identical on server and client** (avoids hydration mismatches). In Headless UI, a
  plain re-export of React's `useId`.
- **Example.**
  ```ts
  let id = useId() // <label htmlFor={id} /> + <input id={id} />
  ```
- **Relevance.** Linking label ↔ control, `aria-labelledby`, `aria-describedby`: Input, Tooltip, Field, the whole
  accessibility layer.

### `useIsoMorphicEffect(fn, deps)` — an SSR-safe **layout** effect

- **Role.** `useLayoutEffect` (which runs **before** paint, to measure/position without flicker) that **does not
  break** server rendering (where it becomes `useEffect`).
- **Example.**
  ```ts
  useIsoMorphicEffect(() => {
    setWidth(ref.current!.offsetWidth)
  }, [])
  ```
- **Relevance.** Positioning a Popover/Tooltip, measuring an element, syncing a measure without a flash.

### `useResolveButtonType(props, element)` — the right button `type`

- **Role.** Deduces the right `type` attribute (`'button'` or other) from the `as`/the real element, so a `<button>`
  does not submit a form by accident.
- **Example.**
  ```ts
  let type = useResolveButtonType({ type: props.type, as: props.as }, element)
  ```
- **Relevance.** Button, IconButton, every polymorphic trigger (Menu.Button, Disclosure.Button…).

### `useOutsideClick(enabled, containers, cb)` — close on an **outside click**

- **Role.** Calls `cb` when a click happens **outside** the given containers (and only when `enabled`).
- **Example.**
  ```ts
  useOutsideClick(open, [buttonEl, panelEl], () => close())
  ```
- **Relevance.** Menu, Dropdown, Popover, Typeahead, DatePicker — everything that opens as an overlay. (In the DS,
  native `popover="auto"` gives light dismiss for free.)

### `useEscape(enabled, view, cb)` — close on **Escape**

- **Role.** Calls `cb` when `Escape` is pressed — **only** if the component is the top layer (it relies on the
  notion of "the topmost layer").
- **Example.**
  ```ts
  useEscape(open, undefined, () => close()) // `view` = window, document.defaultView by default
  ```
- **Relevance.** Modal, Drawer, Menu, Tooltip, BottomSheet.

### `useDocumentOverflowLockedEffect(...)` — lock the page's **scrolling**

- **Role.** Locks the `<body>`'s scroll while an overlay is open (with counting, like Level 1 above — precisely its
  implementation in Headless UI).
- **Example.** See **Level 1** (`useScrollLock(open)`).
- **Relevance.** Modal, Drawer, BottomSheet.

### Focus trap: `focus-trap` + `use-inert-others`

- **Role.** **Trap** keyboard focus **inside** a dialog (Tab does not leave), and make the elements **behind**
  **inert** (not focusable, ignored by screen readers).
- **Example.** (component) `<FocusTrap>…</FocusTrap>` around a dialog's content.
- **Relevance.** Modal, Drawer, Dialog — **mandatory** for the accessibility of a modal overlay. (In the DS, the
  native `<dialog>` opened with `showModal()` provides both.)

### `useDisposables()` — a **cleanup** registry tied to the component

- **Role.** A basket of resources (timers, listeners, `requestAnimationFrame`) **emptied automatically** on unmount.
  Avoids forgetting a `clearTimeout`/`removeEventListener`.
- **Example.**
  ```ts
  let d = useDisposables()
  d.setTimeout(() => close(), 3000) // cleaned up by itself on unmount
  ```
- **Relevance.** Every component with timers/listeners: Tooltip (delay), Toast (auto-close), Carousel (autoplay).

### Keyboard search: `useTextValue` + `useTreeWalker`

- **Role.** Let the user **type letters** to jump to the matching option (`useTextValue` extracts an option's text;
  `useTreeWalker` walks the nodes).
- **Example.** In an option: `let text = useTextValue(optionRef)` → the machine compares with the keystrokes.
- **Relevance.** Listbox, Menu, Typeahead (the "type to find" search).

### `useWatch(cb, deps)` — react to a **value change**

- **Role.** Run `cb` when values change (close to a `useEffect`, oriented towards syncing).
- **Example.**
  ```ts
  useWatch(
    ([open]) => {
      if (!open) resetSearch()
    },
    [open]
  )
  ```
- **Relevance.** Syncing a derived state (resetting the search on close, for instance).

---

## D. Recap applied to the design system's components

| Component                        | State level                                    | Key behaviour hooks                                                              |
| -------------------------------- | ---------------------------------------------- | -------------------------------------------------------------------------------- |
| **Switch / Checkbox**            | local (`useState`)                             | `useControllable`, `useId`, `useSyncRefs`                                        |
| **Input**                        | local                                          | `useControllable`, `useId`, `useSyncRefs`                                        |
| **Tooltip**                      | local (+ a global store if needed)             | `useId`, `useDisposables` (delay), `useIsoMorphicEffect` (position)              |
| **Modal / Drawer / BottomSheet** | **createStore** (shared scroll-lock)           | `useScrollLock`, `useEscape`, `focus-trap` + `use-inert-others`, `useId`         |
| **Menu / Dropdown**              | local or a simple machine                      | `useOutsideClick`, `useEscape`, `useResolveButtonType`, keyboard search          |
| **Tabs**                         | local (`useReducer`) or a simple machine       | `useControllable` (active tab), `useId`, keyboard                                |
| **Listbox**                      | **simplified machine**                         | `useMachineSlice`, `useOutsideClick`, keyboard search, `useId`                   |
| **Typeahead** (Combobox)         | **simplified machine** (+ `on`/stacking later) | `useControllable`, `useOutsideClick`, `useId`, keyboard search, `useLatestValue` |
| **Toaster / notifications**      | **Zustand** (a global imperative API)          | `useDisposables` (auto-close)                                                    |

(Written on 2026-06-12, before `@fubaritico/behaviors` existed. Since 2026-10-09 the DS's answer for Tabs, the
ColorPicker, the Popover and the Tooltip is a **behaviour service** per component — `/behavior-service` — which is
this Level 3 machine, framework-agnostic, with a thin React adapter.)

**Takeaway.** The vast majority of components only need **local state + a few behaviour hooks**. The **simplified
machine** is only for **Listbox/Typeahead**. **createStore** only for the **scroll-lock**. **Zustand** only for a
**global imperative API** (toasts). The **hooks (Part C)** are the real reusable treasure — pure behaviour,
independent of the state architecture.
