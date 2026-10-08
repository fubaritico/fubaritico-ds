import { useCallback } from 'react'

import type { Ref, RefObject } from 'react'

/**
 * Merges a component's own `ref` with one a consumer passed in.
 *
 * A component that drives a DOM node imperatively keeps an internal `RefObject`. Because
 * `ComponentProps<'el'>` includes `ref` in React 19, a consumer-supplied `ref` otherwise lands in
 * the rest spread and — being applied last — silently REPLACES the internal one, leaving the
 * component unable to reach its own node. This returns a callback that feeds both.
 *
 * @template T - The element type held by the refs.
 * @param internalRef - The component's own ref object, always populated.
 * @param forwardedRef - The consumer's ref, if any; accepts the callback and object forms.
 * @returns A ref callback to put on the element, in place of either ref.
 */
export function useMergedRef<T>(
  internalRef: RefObject<T | null>,
  forwardedRef: Ref<T> | undefined
) {
  return useCallback(
    (node: T | null) => {
      internalRef.current = node

      if (typeof forwardedRef === 'function') {
        forwardedRef(node)
      } else if (forwardedRef) {
        forwardedRef.current = node
      }
    },
    [internalRef, forwardedRef]
  )
}
