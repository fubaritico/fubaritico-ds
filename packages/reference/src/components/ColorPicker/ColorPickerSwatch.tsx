import clsx from 'clsx'

import {
  COLOR_PICKER_COLOR_VAR,
  colorPickerSwatchVariants,
} from '@fubaritico/variants'

import { toReactAttributes } from '../../utils'

import {
  useColorPickerContext,
  useColorPickerSnapshot,
} from './ColorPickerContext'

import type { CSSProperties, ComponentProps } from 'react'

/** Props of {@link ColorPickerSwatch}. */
export type ColorPickerSwatchProps = Omit<
  ComponentProps<'span'>,
  'role' | 'aria-label'
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
  const state = useColorPickerSnapshot(service)

  const swatchStyle: CSSProperties & Record<`--${string}`, string> = {
    ...style,
    ...(state.hex === null ? {} : { [COLOR_PICKER_COLOR_VAR]: state.hex }),
  }

  return (
    <span
      {...rest}
      {...toReactAttributes(service.swatchAttrs())}
      className={clsx(
        colorPickerSwatchVariants({ auto: state.isAuto }),
        className
      )}
      style={swatchStyle}
    />
  )
}

export default ColorPickerSwatch
