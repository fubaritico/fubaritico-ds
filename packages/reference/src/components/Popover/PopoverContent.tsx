import clsx from 'clsx'
import { useLayoutEffect, useRef } from 'react'

import { POPOVER_ANCHOR_VAR, POPOVER_CLASS } from '@fubaritico/variants'

import { useMergedRef } from '../../hooks'
import { toReactAttributes } from '../../utils'
import { usePopoverContext, usePopoverOpen } from './PopoverContext'

import type { CSSProperties, ComponentProps, ToggleEvent } from 'react'

/** Props of {@link PopoverContent}. The service owns the surface's id, role and popover mode. */
export type PopoverContentProps = Omit<
  ComponentProps<'div'>,
  'id' | 'popover' | 'role' | 'tabIndex'
>

/**
 * The popover surface — rendered by the browser in the top layer, anchored to the trigger.
 *
 * On open it moves focus to its first focusable element (or to itself), so the keyboard continues
 * inside it; Escape, a click outside and the trigger close it natively. When the open state is set
 * from props or the service (not by the trigger), it shows / hides the surface to match.
 *
 * Must be rendered inside a `<Popover>`.
 *
 * @param props - {@link PopoverContentProps}.
 * @returns The rendered surface.
 */
export function PopoverContent({
  className,
  style,
  onToggle,
  ref,
  children,
  ...rest
}: Readonly<PopoverContentProps>) {
  const { service } = usePopoverContext()
  const open = usePopoverOpen(service)
  const surfaceRef = useRef<HTMLDivElement>(null)
  const mergedRef = useMergedRef(surfaceRef, ref)

  // The service's state is the truth: bring the native popover in line (controlled or imperative
  // opens). The trigger's own clicks already moved the native state, so this is then a no-op.
  useLayoutEffect(() => {
    const surface = surfaceRef.current
    // An environment without the Popover API (an old browser, jsdom) only renders the markup.
    if (!surface || typeof surface.showPopover !== 'function') return
    const shown = surface.matches(':popover-open')
    if (open && !shown) surface.showPopover()
    if (!open && shown) surface.hidePopover()
  }, [open])

  /**
   * The browser opened or closed the surface (trigger, Escape, click outside): sync the service,
   * and move focus inside on open.
   *
   * @param event - The native toggle event.
   */
  const handleToggle = (event: ToggleEvent<HTMLDivElement>) => {
    onToggle?.(event)
    const surface = event.currentTarget
    service.syncFromToggle(event.newState)
    // A controlled parent may refuse the change: no re-render will follow, so put the native
    // popover back to what the service says, now.
    const revert = service.reconcileToggle(event.newState)
    if (revert === 'open') surface.showPopover()
    if (revert === 'closed') surface.hidePopover()
    // `toggle` is async: the surface may have closed again before this runs.
    if (revert !== null || !surface.matches(':popover-open')) return
    // First focusable that is actually rendered (a hidden part is skipped), else the surface.
    const target =
      Array.from(
        surface.querySelectorAll<HTMLElement>(service.initialFocusSelector())
      ).find((element) => element.getClientRects().length > 0) ?? surface
    target.focus({ preventScroll: true })
  }

  const surfaceStyle: CSSProperties & Record<`--${string}`, string> = {
    ...style,
    [POPOVER_ANCHOR_VAR]: service.anchorName(),
  }

  return (
    <div
      {...rest}
      {...toReactAttributes(service.contentAttrs())}
      ref={mergedRef}
      className={clsx(POPOVER_CLASS, className)}
      style={surfaceStyle}
      onToggle={handleToggle}
    >
      {children}
    </div>
  )
}

export default PopoverContent
