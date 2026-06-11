# Code source des hooks de comportement à reprendre

> Annexe code du catalogue (Partie C de `state-externalization.md`). Source réelle Headless UI v2.2.10,
> copiable. **Ordre = par dépendances** : les « fondations » d'abord (les autres les importent). Chaque
> hook indique ses **dépendances internes**. Les hooks trop entremêlés (outside-click complet, focus-trap)
> sont donnés en version condensée fidèle ou pointés.

---

## 0. Fondations (importées par presque tous les autres)

### `env` (minimal) — « suis-je sur le serveur ? »

```ts
// L'original (utils/env) gère aussi le "handoff" SSR ; un minimal suffit pour démarrer :
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

Dépend de : `env`.

### `useLatestValue` — la dernière valeur dans un ref

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

Dépend de : `useIsoMorphicEffect`.

### `useEvent` — callback à identité stable

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

Dépend de : `useLatestValue`.

### `disposables` + `useDisposables` — registre de nettoyage

```ts
// micro-task minimal (l'original a un repli pour vieux navigateurs) :
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

/** Un registre `disposables` lié au cycle de vie : vidé au démontage. */
export function useDisposables() {
  let [d] = useState(disposables) // useState(initializer) → créé une fois
  useEffect(() => () => d.dispose(), [d])
  return d
}
```

Dépend de : `queueMicrotask` (natif).

---

## 1. Valeur & refs

### `useControllable` — contrôlé ou non-contrôlé

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

  // (Avertissements console en cas de bascule contrôlé↔non-contrôlé — omis ici pour la concision)

  return [
    (isControlled ? controlledValue : internalValue)!,
    useEvent((value: T) => {
      if (isControlled) return onChange?.(value)
      // met à jour l'état interne AVANT onChange (utile pour soumettre un form dans onChange)
      flushSync(() => setInternalValue(value))
      return onChange?.(value)
    }),
  ] as const
}
```

Dépend de : `useEvent`, `flushSync` (react-dom).

### `useSyncRefs` — fusionner plusieurs refs

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

  // @ts-expect-error — si toutes les refs sont "optionnelles", on ne renvoie rien
  return refs.every((ref) => ref == null || ref?.[Optional])
    ? undefined
    : syncRefs
}
```

Dépend de : `useEvent`.

### `useResolveButtonType` — le bon `type` de bouton (autonome)

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

Dépend de : rien.

### `useId`

```ts
// Chez Headless UI, simple ré-export du hook natif (React 18+) :
export { useId } from 'react'
```

---

## 2. Cycle de vie

### `useWatch` — réagir à un changement de valeurs

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

Dépend de : `useEvent`.

---

## 3. Clavier & interaction

### `useEscape` — fermer sur Échap

```ts
import { useEventListener } from './use-event-listener'
import { Keys } from '../components/keyboard'

export function useEscape(
  enabled: boolean,
  view = typeof document !== 'undefined' ? document.defaultView : null,
  cb: (event: KeyboardEvent) => void
) {
  // Original : `let isTopLayer = useIsTopLayer(enabled, 'escape')` (notion de "couche au sommet"
  // via une machine d'empilement). Pour un DS simple, remplacer par `enabled` directement.
  useEventListener(view, 'keydown', (event) => {
    if (!enabled) return
    if (event.defaultPrevented) return
    if (event.key !== Keys.Escape) return
    cb(event)
  })
}
```

Dépend de : `useEventListener`, `Keys`. (Original : aussi `useIsTopLayer`.)

### `useOutsideClick` — version **condensée fidèle**

```ts
// ⚠️ L'original fait 198 lignes : il gère aussi le tactile (seuil de 30px = scroll, pas clic),
// le blur d'iframe, le perçage du Shadow DOM, et un test "élément focusable". Version essentielle :
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
        if (container?.contains(target)) return // clic à l'intérieur → on ignore
        // perçage Shadow DOM :
        if (
          event.composed &&
          event.composedPath().includes(container as EventTarget)
        )
          return
      }
      cb(event, target) // clic dehors
    }
    // phase "capture" → les stopPropagation intermédiaires ne l'annulent pas
    document.addEventListener('pointerdown', onPointerDown, true)
    return () =>
      document.removeEventListener('pointerdown', onPointerDown, true)
  }, [enabled, containers, cb])
}
```

Original — dépend de : `useDocumentEvent`, `useWindowEvent`, `useLatestValue`, `isMobile`, utils
`focus-management` (`isFocusableElement`) et `dom`.

### `useTextValue` — extraire le texte d'une option (recherche clavier)

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

Dépend de : `useEvent`, `getTextValue` (util qui lit `aria-label`/`textContent`).

### `useTreeWalker` — parcourir les nœuds (filtrage clavier)

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

Dépend de : `useIsoMorphicEffect`, `getOwnerDocument`.

---

## 4. À porter (composants entiers, pas des hooks à inliner)

### Verrou de défilement (scroll-lock)

Le code minimal est déjà fourni dans `state-externalization.md` (**Niveau 1**, `createStore` + `useScrollLock`).
La version Headless UI (`hooks/document-overflow`) ajoute : compensation de la barre de défilement
(éviter le saut de mise en page), cas iOS, et restauration fine. Reprendre au besoin.

### `focus-trap` + `use-inert-others`

Ce sont des **composants/hooks volumineux** (plusieurs centaines de lignes, très entremêlés). À **porter**
depuis Headless UI ou à remplacer par une petite lib dédiée. Responsabilités à couvrir :

1. **Focus initial** à l'ouverture (premier élément focusable, ou un élément ciblé).
2. **Cycle du Tab** : `Tab`/`Shift+Tab` bouclent **dans** le piège, ne sortent jamais.
3. **Restauration** du focus à l'élément déclencheur à la fermeture.
4. **Inertie de l'arrière-plan** : `inert`/`aria-hidden` sur le reste, ignoré par les lecteurs d'écran.

Obligatoire pour l'accessibilité d'un overlay **modal** (Modal, Drawer, Dialog).

---

## Carte des dépendances (ordre de portage)

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
useResolveButtonType (autonome) ·  useId (natif)
```

Porter `env → useIsoMorphicEffect → useLatestValue → useEvent` **en premier** : tout le reste en dépend.
