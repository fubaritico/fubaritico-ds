import { Button } from '../Button'
import { toReactAttributes } from '../../utils'
import {
  useColorPickerContext,
  useColorPickerSelector,
} from './ColorPickerContext'

import type { ButtonProps } from '../Button'
import type { MouseEvent } from 'react'

/**
 * Props of {@link ColorPickerAutoToggle}: the Button's, minus what the service owns (the pressed
 * state, the name, the action).
 */
export type ColorPickerAutoToggleProps = Omit<
  ButtonProps,
  'aria-pressed' | 'aria-label' | 'disabled' | 'type' | 'children'
>

/**
 * The "automatic / no colour" toggle — a pressed / unpressed button whose action is the service's
 * `toggleAuto()` (leaving "automatic" restores the last colour). Renders nothing unless the picker
 * is `nullable`. A consumer `onClick` runs first and may `preventDefault()`.
 *
 * Must be rendered inside a `<ColorPicker>`.
 *
 * @param props - {@link ColorPickerAutoToggleProps}.
 * @returns The rendered toggle, or `null`.
 */
export function ColorPickerAutoToggle({
  variant = 'outline',
  size = 'sm',
  onClick,
  ...rest
}: Readonly<ColorPickerAutoToggleProps>) {
  const { service } = useColorPickerContext()
  // Slices: the toggle re-renders when these flip, not on every pointer move.
  const nullable = useColorPickerSelector(service, (state) => state.nullable)
  useColorPickerSelector(service, (state) => state.isAuto)
  useColorPickerSelector(service, (state) => state.disabled)
  if (!nullable) return null

  /**
   * Runs the consumer's handler first; toggles unless prevented.
   *
   * @param event - The click.
   */
  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    onClick?.(event)
    if (!event.defaultPrevented) service.toggleAuto()
  }

  return (
    <Button
      variant={variant}
      size={size}
      {...rest}
      {...toReactAttributes(service.autoToggleAttrs())}
      onClick={handleClick}
    >
      {service.getLabels().automatic}
    </Button>
  )
}

export default ColorPickerAutoToggle
