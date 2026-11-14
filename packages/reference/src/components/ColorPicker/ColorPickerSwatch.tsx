import clsx from 'clsx'

import {
  COLOR_PICKER_COLOR_VAR,
  COLOR_PICKER_SWATCH_ICON_CLASS,
  colorPickerSwatchVariants,
} from '@fubaritico/variants'

import { toReactAttributes } from '../../utils'

import {
  useColorPickerContext,
  useColorPickerSelector,
} from './ColorPickerContext'
import { ColorPickerWandIcon } from './ColorPickerWandIcon'

import type { CSSProperties, ComponentProps } from 'react'

/** Props of {@link ColorPickerSwatch}. The service owns its role and name. */
export type ColorPickerSwatchProps = Omit<
  ComponentProps<'span'>,
  'role' | 'aria-label' | 'children'
>

/**
 * A swatch of the current value — the colour over a checkerboard, a magic wand in the automatic
 * state, a struck-through square for "no colour". Named for screen readers ("dark blue",
 * "Automatic color", "No color").
 *
 * Must be rendered inside a `<ColorPicker>`.
 *
 * @param props - {@link ColorPickerSwatchProps}.
 * @returns The rendered swatch.
 */
export function ColorPickerSwatch({
  className,
  style,
  ...rest
}: Readonly<ColorPickerSwatchProps>) {
  const { service } = useColorPickerContext()
  // Slices: the swatch only changes with the value (hex) and the mode.
  const hex = useColorPickerSelector(service, (state) => state.hex)
  const mode = useColorPickerSelector(service, (state) => state.mode)

  const swatchStyle: CSSProperties & Record<`--${string}`, string> = {
    ...style,
    ...(hex === null ? {} : { [COLOR_PICKER_COLOR_VAR]: hex }),
  }

  return (
    <span
      {...rest}
      {...toReactAttributes(service.swatchAttrs())}
      className={clsx(colorPickerSwatchVariants({ mode }), className)}
      style={swatchStyle}
    >
      {mode === 'auto' ? (
        <ColorPickerWandIcon className={COLOR_PICKER_SWATCH_ICON_CLASS} />
      ) : null}
    </span>
  )
}

export default ColorPickerSwatch
