import { toReactAttributes } from '../../utils'
import { Button } from '../Button'

import {
  useColorPickerContext,
  useColorPickerSnapshot,
} from './ColorPickerContext'

/** Props of {@link ColorPickerAutoToggle}. */
export interface ColorPickerAutoToggleProps {
  /** Extra class on the button. */
  className?: string
}

/**
 * The "automatic / no colour" toggle — a pressed / unpressed button. Pressing it while automatic
 * restores the last colour. Renders nothing unless the picker is `nullable`.
 *
 * Must be rendered inside a `<ColorPicker>`.
 *
 * @param props - {@link ColorPickerAutoToggleProps}.
 * @returns The rendered toggle, or `null`.
 */
export function ColorPickerAutoToggle({
  className,
}: Readonly<ColorPickerAutoToggleProps>) {
  const { service } = useColorPickerContext()
  const state = useColorPickerSnapshot(service)
  if (!state.nullable) return null

  /** Toggles between the automatic state and the last colour. */
  const handleClick = () => {
    if (state.isAuto) service.setColor(state.color)
    else service.setAuto()
  }

  return (
    <Button
      variant="outline"
      size="sm"
      className={className}
      {...toReactAttributes(service.autoToggleAttrs())}
      onClick={handleClick}
    >
      {String(service.autoToggleAttrs()['aria-label'])}
    </Button>
  )
}

export default ColorPickerAutoToggle
