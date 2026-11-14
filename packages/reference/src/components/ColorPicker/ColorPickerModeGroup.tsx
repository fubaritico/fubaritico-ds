import clsx from 'clsx'

import {
  COLOR_PICKER_MODES_CLASS,
  COLOR_PICKER_MODE_CLASS,
  COLOR_PICKER_MODE_INPUT_CLASS,
} from '@fubaritico/variants'

import { toReactAttributes } from '../../utils'

import {
  useColorPickerContext,
  useColorPickerSelector,
} from './ColorPickerContext'

import type { ColorPickerMode } from '@fubaritico/behaviors'
import type { ComponentProps } from 'react'

/** Props of {@link ColorPickerModeGroup}: a div's, minus what the service owns (role, name). */
export type ColorPickerModeGroupProps = Omit<
  ComponentProps<'div'>,
  'role' | 'aria-label' | 'aria-disabled' | 'children'
>

/**
 * The mode group — a segmented control choosing what the value is: a colour, "automatic" (`null`,
 * with `nullable`) or "no colour" (`'none'`, with `allowNone`). Each segment is a native radio
 * wrapped in its label, so the arrow keys move and select natively and a screen reader announces
 * "2 of 3". Choosing "Color" returns to the last colour. Renders nothing while the picker offers a
 * single mode.
 *
 * Must be rendered inside a `<ColorPicker>`.
 *
 * @param props - {@link ColorPickerModeGroupProps}.
 * @returns The rendered group, or `null`.
 */
export function ColorPickerModeGroup({
  className,
  ...rest
}: Readonly<ColorPickerModeGroupProps>) {
  const { service } = useColorPickerContext()
  // Slices: the group re-renders when the mode or what is offered changes, not on pointer moves.
  // They cover every service read below: `getModes()` (nullable, allowNone), `modeGroupAttrs()`
  // (disabled) and `modeOptionAttrs()` (mode, disabled). A new read needs its slice here.
  useColorPickerSelector(service, (state) => state.mode)
  useColorPickerSelector(service, (state) => state.disabled)
  useColorPickerSelector(service, (state) => state.nullable)
  useColorPickerSelector(service, (state) => state.allowNone)

  const modes = service.getModes()
  if (modes.length < 2) return null

  return (
    <div
      {...rest}
      {...toReactAttributes(service.modeGroupAttrs())}
      className={clsx(COLOR_PICKER_MODES_CLASS, className)}
    >
      {modes.map((mode: ColorPickerMode) => (
        <label key={mode} className={COLOR_PICKER_MODE_CLASS}>
          <input
            {...toReactAttributes(service.modeOptionAttrs(mode))}
            className={COLOR_PICKER_MODE_INPUT_CLASS}
            onChange={() => {
              service.setMode(mode)
            }}
          />
          {service.modeLabel(mode)}
        </label>
      ))}
    </div>
  )
}

export default ColorPickerModeGroup
