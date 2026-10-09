import clsx from 'clsx'
import { useEffect, useLayoutEffect, useRef } from 'react'

import { tabsTriggerVariants } from '@fubaritico-ds/variants'

import { useMergedRef } from '../../hooks'
import { toReactAttributes } from '../../utils'
import { useTabsContext, useTabsSnapshot } from './TabsContext'

import type { ComponentProps, MouseEvent, ReactNode } from 'react'

/** Props of {@link TabsTrigger}. The ARIA attributes the service owns are not overridable. */
export interface TabsTriggerProps
  extends Omit<
    ComponentProps<'button'>,
    | 'role'
    | 'id'
    | 'tabIndex'
    | 'aria-selected'
    | 'aria-controls'
    | 'aria-disabled'
  > {
  /** Value that identifies this tab and its panel. */
  value: string
  /** Optional leading glyph. */
  icon?: ReactNode
}

/**
 * A single tab button.
 *
 * Registers itself with the service on mount (and leaves on unmount), so adding or removing a
 * trigger is all it takes to change the tab list. Its ARIA attributes and roving `tabIndex` come
 * from the service; it takes DOM focus only when the service explicitly asks for it.
 *
 * Must be rendered inside a `<Tabs>`.
 *
 * @param props - {@link TabsTriggerProps}.
 * @param props.value - Value identifying the tab and its panel.
 * @param props.icon - Optional leading glyph.
 * @returns The rendered `role="tab"` button.
 */
export function TabsTrigger({
  value,
  icon,
  disabled = false,
  className,
  children,
  onClick,
  ref,
  ...rest
}: Readonly<TabsTriggerProps>) {
  const { service, variant } = useTabsContext()
  // The whole snapshot: a trigger reads its selection, its focus AND the focus token.
  const state = useTabsSnapshot(service)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const mergedRef = useMergedRef(buttonRef, ref)
  // The token seen last: a focus move is honoured only when the token CHANGES, so mounting while
  // already focused never steals focus.
  const lastFocusToken = useRef(state.focusToken)

  // Before paint, so the first painted frame already knows every tab. `register` returns the
  // matching unregister, which is exactly the cleanup — symmetric, hence StrictMode-safe.
  useLayoutEffect(() => service.register({ id: value }), [service, value])

  // Separate from registration: re-registering on a `disabled` change would move the tab to the end.
  useLayoutEffect(() => {
    service.update(value, { disabled })
  }, [service, value, disabled])

  const focused = state.focusedId === value
  useEffect(() => {
    const requested = state.focusToken !== lastFocusToken.current
    lastFocusToken.current = state.focusToken
    if (requested && focused) buttonRef.current?.focus()
  }, [focused, state.focusToken])

  /**
   * Runs the consumer's handler first; selects unless it was prevented.
   *
   * @param event - The click.
   */
  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    onClick?.(event)
    if (!event.defaultPrevented && !disabled) service.setActive(value)
  }

  return (
    <button
      type="button"
      disabled={disabled}
      className={clsx(
        tabsTriggerVariants({ variant, active: state.activeId === value }),
        className
      )}
      {...rest}
      {...toReactAttributes(service.triggerAttrs(value))}
      ref={mergedRef}
      onClick={handleClick}
    >
      {icon}
      {children}
    </button>
  )
}

export default TabsTrigger
