import clsx from 'clsx'

import {
  COLOR_PICKER_COLOR_VAR,
  colorPickerSwatchVariants,
} from '@fubaritico/variants'

import { toReactAttributes } from '../../utils'
import {
  useColorPickerContext,
  useColorPickerSelector,
} from './ColorPickerContext'

import type { CSSProperties, ComponentProps } from 'react'

/** Props of {@link ColorPickerSwatch}. The service owns its role and name. */
export type ColorPickerSwatchProps = Omit<
  ComponentProps<'span'>,
  'role' | 'aria-label' | 'children'
>

/**
 * A swatch of the current value — the colour over a checkerboard, or a struck-through square in the
 * automatic state. Named for screen readers ("dark blue", "Automatic, no color selected").
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
  // Slices: the swatch only changes with the value (hex) and the automatic state.
  const hex = useColorPickerSelector(service, (state) => state.hex)
  const isAuto = useColorPickerSelector(service, (state) => state.isAuto)

  const swatchStyle: CSSProperties & Record<`--${string}`, string> = {
    ...style,
    ...(hex === null ? {} : { [COLOR_PICKER_COLOR_VAR]: hex }),
  }

  return (
    <span
      {...rest}
      {...toReactAttributes(service.swatchAttrs())}
      className={clsx(colorPickerSwatchVariants({ auto: isAuto }), className)}
      style={swatchStyle}
    />
  )
}

export default ColorPickerSwatch
