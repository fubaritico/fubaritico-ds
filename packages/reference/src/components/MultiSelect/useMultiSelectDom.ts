import { useEffect, useRef } from 'react'

import type {
  MultiSelectService,
  MultiSelectSnapshot,
} from '@fubaritico/behaviors'
import type { RefObject } from 'react'

/** The DOM handles the MultiSelect gives {@link useMultiSelectDom}. */
export interface MultiSelectDomRefs {
  /** The field's root: a press outside it closes the menu. */
  rootRef: RefObject<HTMLDivElement | null>
  /** The search input: the focus target after the last removal. */
  inputRef: RefObject<HTMLInputElement | null>
  /** The remove buttons by value: the focus target after a removal. */
  removeRefs: RefObject<Map<string, HTMLButtonElement>>
}

/**
 * The DOM side effects the service asks for and cannot perform itself: the focus move after a
 * removal, keeping the active option in view, and closing the menu on a press outside the field.
 *
 * @param service - The MultiSelect service.
 * @param state - Its current snapshot.
 * @param refs - The DOM handles ({@link MultiSelectDomRefs}).
 */
export function useMultiSelectDom(
  service: MultiSelectService,
  state: MultiSelectSnapshot,
  { rootRef, inputRef, removeRefs }: MultiSelectDomRefs
): void {
  // The token already honoured: focus moves on a CHANGE, never on mount.
  const focusTokenRef = useRef(state.focusToken)

  // Performs the focus move the service asks for after a removal (the pressed button is gone).
  useEffect(() => {
    if (state.focusToken === focusTokenRef.current) return
    focusTokenRef.current = state.focusToken
    const target = state.focusTarget
    if (target?.kind === 'remove') removeRefs.current.get(target.value)?.focus()
    else inputRef.current?.focus()
  }, [state.focusToken, state.focusTarget, inputRef, removeRefs])

  // Keeps the option under the keyboard cursor visible in a scrolling menu.
  useEffect(() => {
    if (state.activeValue === null) return
    const node = document.getElementById(service.optionId(state.activeValue))
    if (typeof node?.scrollIntoView === 'function')
      node.scrollIntoView({ block: 'nearest' })
  }, [service, state.activeValue])

  // Closes the menu on a press outside the field; the menu is in place, inside the root.
  useEffect(() => {
    if (!state.open) return
    const handlePointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node))
        service.close({ clearQuery: true })
    }
    document.addEventListener('mousedown', handlePointerDown)
    return () => {
      document.removeEventListener('mousedown', handlePointerDown)
    }
  }, [service, state.open, rootRef])
}

export default useMultiSelectDom
