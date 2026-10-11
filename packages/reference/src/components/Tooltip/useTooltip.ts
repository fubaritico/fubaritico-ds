import {
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useState,
  useSyncExternalStore,
} from 'react'

import { createTooltipService } from '@fubaritico/behaviors'

import { toReactAttributes } from '../../utils'

import type { TooltipOptions, TooltipService } from '@fubaritico/behaviors'
import type {
  FocusEvent,
  HTMLAttributes,
  KeyboardEvent,
  PointerEvent,
} from 'react'

/** Options of {@link useTooltip}: the service's, plus an injected service. */
export interface UseTooltipOptions
  extends Omit<TooltipOptions, 'uid' | 'scheduler'> {
  /** A service created outside (tests, another adapter); one is created otherwise. */
  service?: TooltipService
}

/** What {@link useTooltip} hands back. */
export interface UseTooltipResult {
  /** Whether the bubble should be shown — pass it as the Tooltip's `visible`. */
  open: boolean
  /** The service behind it, to drive the tooltip imperatively. */
  service: TooltipService
  /** Spread on the trigger: the description link and the pointer / focus / Escape handlers. */
  triggerProps: HTMLAttributes<HTMLElement>
  /** Spread on the `<Tooltip>`: its id, role or `aria-hidden`, and the hoverable handlers. */
  bubbleProps: HTMLAttributes<HTMLDivElement>
}

/**
 * Wires a trigger to a `Tooltip` — hover with a delay, focus at once, Escape to dismiss, a bubble
 * the pointer can rest on (WCAG 1.4.13). All of it lives in the framework-agnostic
 * `TooltipService`; this hook only binds it to React.
 *
 * ```tsx
 * const ref = useRef<HTMLButtonElement>(null)
 * const { open, triggerProps, bubbleProps } = useTooltip()
 * <button ref={ref} {...triggerProps}>Save</button>
 * <Tooltip content="Save your changes" visible={open} targetRef={ref} {...bubbleProps} />
 * ```
 *
 * @param options - {@link UseTooltipOptions}.
 * @returns {@link UseTooltipResult}.
 */
export function useTooltip(options: UseTooltipOptions = {}): UseTooltipResult {
  const { service: injected, ...serviceOptions } = options
  // A unique, SSR-stable namespace for the bubble id.
  const uid = useId()
  // One service per trigger for its lifetime — an injected one wins.
  const [service] = useState(
    () => injected ?? createTooltipService({ uid, ...serviceOptions })
  )

  // Props → service, before paint, so a change of `disabled` or `open` shows on the same frame. An
  // injected service keeps its own configuration: only the options actually passed reach it.
  useLayoutEffect(() => {
    if (!injected) {
      service.setOptions(serviceOptions)
      return
    }
    const patch: Partial<TooltipOptions> = {}
    for (const [name, value] of Object.entries(serviceOptions))
      if (value !== undefined) Object.assign(patch, { [name]: value })
    service.setOptions(patch)
  })

  // A trigger that unmounts must not leave a timer behind to open or close a bubble that is gone.
  useEffect(
    () => () => {
      service.cancelPending()
    },
    [service]
  )

  // Re-render on every change of the open state.
  const { open } = useSyncExternalStore(
    service.subscribe,
    service.getState,
    service.getState
  )

  // The handlers only forward to the service, whose methods never change: built once per service,
  // so a memoised trigger or bubble does not re-render for nothing.
  const triggerHandlers = useMemo(
    () => ({
      onPointerEnter: (event: PointerEvent<HTMLElement>) => {
        service.pointerEnter(event.pointerType)
      },
      onPointerLeave: (event: PointerEvent<HTMLElement>) => {
        service.pointerLeave(event.pointerType)
      },
      onFocus: (event: FocusEvent<HTMLElement>) => {
        // Only a VISIBLE focus (keyboard) opens at once; a mouse click leaves it to the hover delay.
        service.focus(event.currentTarget.matches(':focus-visible'))
      },
      onBlur: () => {
        service.blur()
      },
      onKeyDown: (event: KeyboardEvent<HTMLElement>) => {
        service.handleKeydown(event)
      },
    }),
    [service]
  )
  const bubbleHandlers = useMemo(
    () => ({
      onPointerEnter: () => {
        service.bubblePointerEnter()
      },
      onPointerLeave: () => {
        service.bubblePointerLeave()
      },
    }),
    [service]
  )

  const triggerProps: HTMLAttributes<HTMLElement> = {
    ...toReactAttributes(service.triggerAttrs()),
    ...triggerHandlers,
  }
  const bubbleProps: HTMLAttributes<HTMLDivElement> = {
    ...toReactAttributes(service.bubbleAttrs()),
    ...bubbleHandlers,
  }

  return { open, service, triggerProps, bubbleProps }
}

export default useTooltip
