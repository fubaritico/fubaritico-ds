import { useId, useLayoutEffect, useMemo, useState } from 'react'

import { createPopoverService } from '@fubaritico/behaviors'

import { PopoverContent } from './PopoverContent'
import { PopoverContext } from './PopoverContext'
import { PopoverTrigger } from './PopoverTrigger'

import type { PopoverService } from '@fubaritico/behaviors'
import type { ReactNode } from 'react'

/** Props of the {@link Popover} root. */
export interface PopoverProps {
  /** The trigger and the content. */
  children: ReactNode
  /** Controlled open state. */
  open?: boolean
  /** Initial open state when uncontrolled. */
  defaultOpen?: boolean
  /** Called when the popover opens or closes — including Escape and a click outside. */
  onOpenChange?: (open: boolean) => void
  /** Accessible name of the surface (it is a non-modal dialog). */
  label?: string
  /**
   * A service built elsewhere with `createPopoverService` — to open it from outside the tree, or
   * to inject a stub. Read once, at mount; it keeps its own options unless props are passed.
   */
  service?: PopoverService
}

/**
 * Popover — a surface anchored to a trigger, above everything on the page.
 *
 * Built on the platform's `popover` attribute: the browser renders the surface in the top layer
 * (no portal, no z-index), closes it on Escape and on a click outside, and returns focus to the
 * trigger. CSS anchor positioning places it below its trigger and flips it when it would overflow.
 * A thin adapter over `PopoverService` (`@fubaritico/behaviors`). The root renders no element.
 *
 * @param props - {@link PopoverProps}.
 * @param props.open - Controlled open state.
 * @param props.defaultOpen - Initial open state when uncontrolled.
 * @param props.onOpenChange - Called on every open / close.
 * @param props.label - Accessible name of the surface.
 * @param props.service - Injected service; one is created when absent.
 * @returns The trigger and the surface, wired together.
 */
export function Popover({
  children,
  open,
  defaultOpen = false,
  onOpenChange,
  label,
  service: injectedService,
}: Readonly<PopoverProps>) {
  const uid = useId()
  // `useState`, not `useMemo`: one instance for the component's life, reused by a StrictMode remount.
  const [service] = useState(
    () =>
      injectedService ??
      createPopoverService({
        uid,
        open,
        defaultOpen,
        label,
        onOpenChange,
      })
  )

  // Props → service, before paint; the service notifies only when the open state or label change.
  // An injected service keeps its own configuration: only the props actually passed reach it.
  useLayoutEffect(() => {
    if (!injectedService) {
      service.setOptions({ open, label, onOpenChange })
      return
    }
    const patch: Parameters<PopoverService['setOptions']>[0] = {}
    if (open !== undefined) patch.open = open
    if (label !== undefined) patch.label = label
    if (onOpenChange) patch.onOpenChange = onOpenChange
    service.setOptions(patch)
  })

  const contextValue = useMemo(() => ({ service }), [service])

  return <PopoverContext value={contextValue}>{children}</PopoverContext>
}

Popover.Trigger = PopoverTrigger
Popover.Content = PopoverContent

export default Popover
