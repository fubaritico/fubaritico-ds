import clsx from 'clsx'

import { POPOVER_ANCHOR_VAR, POPOVER_TRIGGER_CLASS } from '@fubaritico/variants'

import { toReactAttributes } from '../../utils'
import { usePopoverContext, usePopoverOpen } from './PopoverContext'

import type { CSSProperties, ComponentProps } from 'react'

/** Props of {@link PopoverTrigger}. The service owns the popover wiring attributes. */
export type PopoverTriggerProps = Omit<
  ComponentProps<'button'>,
  | 'type'
  | 'popoverTarget'
  | 'popoverTargetAction'
  | 'aria-expanded'
  | 'aria-controls'
  | 'aria-haspopup'
>

/**
 * The button that opens and closes the popover. It is the surface's invoker (`popovertarget`): the
 * browser toggles the surface on click and returns focus here when it closes. It is also the
 * surface's CSS anchor. Give it an accessible name (text content or `aria-label`).
 *
 * Must be rendered inside a `<Popover>`.
 *
 * @param props - {@link PopoverTriggerProps}.
 * @returns The rendered button.
 */
export function PopoverTrigger({
  className,
  style,
  children,
  ...rest
}: Readonly<PopoverTriggerProps>) {
  const { service } = usePopoverContext()
  // Subscribed so `aria-expanded` follows the state.
  usePopoverOpen(service)

  const triggerStyle: CSSProperties & Record<`--${string}`, string> = {
    ...style,
    [POPOVER_ANCHOR_VAR]: service.anchorName(),
  }

  return (
    <button
      {...rest}
      {...toReactAttributes(service.triggerAttrs())}
      className={clsx(POPOVER_TRIGGER_CLASS, className)}
      style={triggerStyle}
    >
      {children}
    </button>
  )
}

export default PopoverTrigger
