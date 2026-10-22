# Source code of the behaviour hooks to take over

> Code appendix of the catalogue (Part C of `state-externalization.md`). Real Headless UI v2.2.10 source,
> copyable. **Order = by dependencies**: the « foundations » first (the others import them). Each hook states its
> **internal dependencies**. The most entangled hooks (the full outside-click, focus-trap) are given as a faithful
> condensed version or pointed to.

---

## 0. Foundations (imported by almost all the others)

### `env` (minimal) — « am I on the server? »

```ts
// The original (utils/env) also handles the SSR "handoff"; a minimal one is enough to start:
export const isServer = typeof document === 'undefined'
```

### `useIsoMorphicEffect` — `useLayoutEffect` SSR-safe

```ts
import {
  useEffect,
  useLayoutEffect,
  type DependencyList,
  type EffectCallback,
} from 'react'
import { isServer } from './env'

export let useIsoMorphicEffect = (
  effect: EffectCallback,
  deps?: DependencyList
) => {
  if (isServer) useEffect(effect, deps)
  else useLayoutEffect(effect, deps)
}
```

Depends on: `env`.

### `useLatestValue` — the latest value in a ref

```ts
import { useRef } from 'react'
import { useIsoMorphicEffect } from './use-iso-morphic-effect'

export function useLatestValue<T>(value: T) {
  let cache = useRef(value)
  useIsoMorphicEffect(() => {
    cache.current = value
  }, [value])
  return cache
}
```

Depends on: `useIsoMorphicEffect`.

### `useEvent` — a callback with a stable identity

```ts
import React from 'react'
import { useLatestValue } from './use-latest-value'

export let useEvent = function useEvent<
  F extends (...args: any[]) => any,
  P extends any[] = Parameters<F>,
  R = ReturnType<F>,
>(cb: (...args: P) => R) {
  let cache = useLatestValue(cb)
  return React.useCallback((...args: P) => cache.current(...args), [cache])
}
```

Depends on: `useLatestValue`.

### `disposables` + `useDisposables` — a cleanup registry

```ts
// a minimal micro-task (the original has a fallback for old browsers):
const microTask = (cb: () => void) => queueMicrotask(cb)

export function disposables() {
  let _disposables: Function[] = []
  let api = {
    addEventListener(
      element: Element | Window | Document,
      name: string,
      listener: any,
      options?: any
    ) {
      element.addEventListener(name, listener, options)
      return api.add(() => element.removeEventListener(name, listener, options))
    },
    requestAnimationFrame(cb: FrameRequestCallback) {
      let raf = requestAnimationFrame(cb)
      return api.add(() => cancelAnimationFrame(raf))
    },
    nextFrame(cb: FrameRequestCallback) {
      return api.requestAnimationFrame(() => api.requestAnimationFrame(cb))
    },
    setTimeout(cb: () => void, ms?: number) {
      let timer = setTimeout(cb, ms)
      return api.add(() => clearTimeout(timer))
    },
    microTask(cb: () => void) {
      let task = { current: true }
      microTask(() => {
        if (task.current) cb()
      })
      return api.add(() => {
        task.current = false
      })
    },
    style(node: HTMLElement, property: string, value: string) {
      let previous = node.style.getPropertyValue(property)
      Object.assign(node.style, { [property]: value })
      return api.add(() => {
        Object.assign(node.style, { [property]: previous })
      })
    },
    group(cb: (d: ReturnType<typeof disposables>) => void) {
      let d = disposables()
      cb(d)
      return api.add(() => d.dispose())
    },
    add(cb: () => void) {
      if (!_disposables.includes(cb)) _disposables.push(cb)
      return () => {
        let idx = _disposables.indexOf(cb)
        if (idx >= 0) for (let dispose of _disposables.splice(idx, 1)) dispose()
      }
    },
    dispose() {
      for (let dispose of _disposables.splice(0)) dispose()
    },
  }
  return api
}
```

```ts
import { useEffect, useState } from 'react'
import { disposables } from './disposables'

/** A `disposables` registry tied to the lifecycle: emptied on unmount. */
export function useDisposables() {
  let [d] = useState(disposables) // useState(initializer) → created once
  useEffect(() => () => d.dispose(), [d])
  return d
}
```

Depends on: `queueMicrotask` (natif).

---

## 1. Value & refs

### `useControllable` — controlled or uncontrolled

```ts
import { useRef, useState } from 'react'
import { flushSync } from 'react-dom'
import { useEvent } from './use-event'

export function useControllable<T>(
  controlledValue: T | undefined,
  onChange?: (value: T) => void,
  defaultValue?: T
) {
  let [internalValue, setInternalValue] = useState(defaultValue)
  let isControlled = controlledValue !== undefined

  // (Console warnings when switching controlled↔uncontrolled — left out here for brevity)

  return [
    (isControlled ? controlledValue : internalValue)!,
    useEvent((value: T) => {
      if (isControlled) return onChange?.(value)
      // updates the internal state BEFORE onChange (useful to submit a form inside onChange)
      flushSync(() => setInternalValue(value))
      return onChange?.(value)
    }),
  ] as const
}
```

Depends on: `useEvent`, `flushSync` (react-dom).

### `useSyncRefs` — merge several refs

```ts
import { useEffect, useRef } from 'react'
import { useEvent } from './use-event'

let Optional = Symbol()
export function optionalRef<T>(cb: (ref: T) => void, isOptional = true) {
  return Object.assign(cb, { [Optional]: isOptional })
}

export function useSyncRefs<TType>(
  ...refs: (
    | React.MutableRefObject<TType | null>
    | ((instance: TType) => void)
    | null
  )[]
) {
  let cache = useRef(refs)
  useEffect(() => {
    cache.current = refs
  }, [refs])

  let syncRefs = useEvent((value: TType) => {
    for (let ref of cache.current) {
      if (ref == null) continue
      if (typeof ref === 'function') ref(value)
      else ref.current = value
    }
  })

  // @ts-expect-error — if every ref is "optional", nothing is returned
  return refs.every((ref) => ref == null || ref?.[Optional])
    ? undefined
    : syncRefs
}
```

Depends on: `useEvent`.

### `useResolveButtonType` — the right button `type` (standalone)

```ts
import { useMemo } from 'react'

export function useResolveButtonType<TTag>(
  props: { type?: string; as?: TTag },
  element: HTMLElement | null
) {
  return useMemo(() => {
    if (props.type) return props.type
    let tag = props.as ?? 'button'
    if (typeof tag === 'string' && tag.toLowerCase() === 'button')
      return 'button'
    if (element?.tagName === 'BUTTON' && !element.hasAttribute('type'))
      return 'button'
    return undefined
  }, [props.type, props.as, element])
}
```

Depends on: nothing.

### `useId`

```ts
// In Headless UI, a plain re-export of the native hook (React 18+):
export { useId } from 'react'
```

---

## 2. Lifecycle

### `useWatch` — react to a change of values

```ts
import { useEffect, useRef } from 'react'
import { useEvent } from './use-event'

export function useWatch<T extends any[]>(
  cb: (newValues: [...T], oldValues: [...T]) => void | (() => void),
  dependencies: [...T]
) {
  let track = useRef([] as unknown as typeof dependencies)
  let action = useEvent(cb)

  useEffect(() => {
    let oldValues = [...track.current] as [...T]
    for (let [idx, value] of dependencies.entries()) {
      if (track.current[idx] !== value) {
        let returnValue = action(dependencies, oldValues)
        track.current = dependencies
        return returnValue
      }
    }
  }, [action, ...dependencies])
}
```

Depends on: `useEvent`.

---

## 3. Keyboard & interaction

### `useEscape` — close on Escape

```ts
import { useEventListener } from './use-event-listener'
import { Keys } from '../components/keyboard'

export function useEscape(
  enabled: boolean,
  view = typeof document !== 'undefined' ? document.defaultView : null,
  cb: (event: KeyboardEvent) => void
) {
  // Original: `let isTopLayer = useIsTopLayer(enabled, 'escape')` (the notion of "topmost layer"
  // through a stacking machine). For a simple DS, replace it with `enabled` directly.
  useEventListener(view, 'keydown', (event) => {
    if (!enabled) return
    if (event.defaultPrevented) return
    if (event.key !== Keys.Escape) return
    cb(event)
  })
}
```

Depends on: `useEventListener`, `Keys`. (Original: also `useIsTopLayer`.)

### `useOutsideClick` — a **faithful condensed** version

```ts
// ⚠️ The original is 198 lines: it also handles touch (a 30px threshold = scroll, not click),
// iframe blur, piercing the Shadow DOM, and a "focusable element" test. The essential version:
import { useEffect } from 'react'

export function useOutsideClick(
  enabled: boolean,
  containers: () => (Element | null)[],
  cb: (event: PointerEvent, target: Element) => void
) {
  useEffect(() => {
    if (!enabled) return
    function onPointerDown(event: PointerEvent) {
      let target = event.target as Element | null
      if (!target || !target.isConnected) return
      for (let container of containers()) {
        if (container?.contains(target)) return // a click inside → ignored
        // piercing the Shadow DOM:
        if (
          event.composed &&
          event.composedPath().includes(container as EventTarget)
        )
          return
      }
      cb(event, target) // clic dehors
    }
    // "capture" phase → an intermediate stopPropagation does not cancel it
    document.addEventListener('pointerdown', onPointerDown, true)
    return () =>
      document.removeEventListener('pointerdown', onPointerDown, true)
  }, [enabled, containers, cb])
}
```

Original — depends on: `useDocumentEvent`, `useWindowEvent`, `useLatestValue`, `isMobile`, utils
`focus-management` (`isFocusableElement`) et `dom`.

### `useTextValue` — extract an option's text (keyboard search)

```ts
import { useRef, type MutableRefObject } from 'react'
import { getTextValue } from '../utils/get-text-value'
import { useEvent } from './use-event'

export function useTextValue(element: MutableRefObject<HTMLElement | null>) {
  let cacheKey = useRef<string>('')
  let cacheValue = useRef<string>('')

  return useEvent(() => {
    let el = element.current
    if (!el) return ''
    let currentKey = el.innerText
    if (cacheKey.current === currentKey) return cacheValue.current // cache
    let value = getTextValue(el).trim().toLowerCase()
    cacheKey.current = currentKey
    cacheValue.current = value
    return value
  })
}
```

Depends on: `useEvent`, `getTextValue` (a util that reads `aria-label`/`textContent`).

### `useTreeWalker` — walk the nodes (keyboard filtering)

```ts
import { useEffect, useRef } from 'react'
import { getOwnerDocument } from '../utils/owner'
import { useIsoMorphicEffect } from './use-iso-morphic-effect'

type AcceptNode = (node: HTMLElement) => number // FILTER_ACCEPT | FILTER_SKIP | FILTER_REJECT

export function useTreeWalker(
  enabled: boolean,
  {
    container,
    accept,
    walk,
  }: {
    container: HTMLElement | null
    accept: AcceptNode
    walk(node: HTMLElement): void
  }
) {
  let acceptRef = useRef(accept)
  let walkRef = useRef(walk)
  useEffect(() => {
    acceptRef.current = accept
    walkRef.current = walk
  }, [accept, walk])

  useIsoMorphicEffect(() => {
    if (!container || !enabled) return
    let ownerDocument = getOwnerDocument(container)
    if (!ownerDocument) return
    let accept = acceptRef.current
    let walk = walkRef.current
    let acceptNode = Object.assign((node: HTMLElement) => accept(node), {
      acceptNode: accept,
    })
    let walker = ownerDocument.createTreeWalker(
      container,
      NodeFilter.SHOW_ELEMENT,
      acceptNode,
      false as any
    )
    while (walker.nextNode()) walk(walker.currentNode as HTMLElement)
  }, [container, enabled])
}
```

Depends on: `useIsoMorphicEffect`, `getOwnerDocument`.

---

## 4. To port (whole components, not hooks to inline)

### Scroll lock

The minimal code is already in `state-externalization.md` (**Level 1**, `createStore` + `useScrollLock`). The
Headless UI version (`hooks/document-overflow`) adds: scrollbar compensation (avoiding the layout jump), iOS cases,
and fine restoration. Take it over if needed.

### `focus-trap` + `use-inert-others`

These are **bulky components/hooks** (several hundred lines, heavily entangled). To **port** from Headless UI or to
replace with a small dedicated library. Responsibilities to cover:

1. **Initial focus** on opening (the first focusable element, or a targeted one).
2. **Tab cycling**: `Tab`/`Shift+Tab` loop **inside** the trap, never leave it.
3. **Restoring** focus to the triggering element on close.
4. **Background inertness**: `inert`/`aria-hidden` on the rest, ignored by screen readers.

Mandatory for the accessibility of a **modal** overlay (Modal, Drawer, Dialog). In the DS, the native `<dialog>`
opened with `showModal()` provides all four (`useNativeDialog`).

---

## Dependency map (porting order)

```
env
 └─ useIsoMorphicEffect
     └─ useLatestValue
         └─ useEvent ───────────────┐
disposables → useDisposables        │
                                    ├─ useControllable (+ flushSync)
                                    ├─ useSyncRefs
                                    ├─ useWatch
                                    └─ useTextValue (+ getTextValue)
useEventListener → useEscape (+ Keys)
useIsoMorphicEffect → useTreeWalker (+ getOwnerDocument)
useResolveButtonType (standalone) ·  useId (native)
```

Port `env → useIsoMorphicEffect → useLatestValue → useEvent` **first**: everything else depends on them.
