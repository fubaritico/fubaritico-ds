import { cva } from 'class-variance-authority'

import type { VariantProps } from 'class-variance-authority'

/**
 * Resolves a ColorPicker panel into the BEM class names of the native skin
 * (`.ui-color-picker`, `+ --disabled`).
 *
 * Pure string output (framework-agnostic): consumed by the React reference and the Stencil /
 * Angular / Vue packages alike. The behaviour lives in `ColorPickerService`
 * (`@fubaritico/behaviors`); this only names the parts.
 *
 * @param props - ColorPicker options (all optional — CVA defaults apply).
 * @param props.disabled - Non-interactive; defaults to `false`.
 * @returns The space-separated BEM class string for the resolved props.
 */
export const colorPickerVariants = cva('ui-color-picker', {
  variants: {
    disabled: {
      false: '',
      true: 'ui-color-picker--disabled',
    },
  },
  defaultVariants: {
    disabled: false,
  },
})

/** Variant props inferred from {@link colorPickerVariants}. */
export type ColorPickerVariantProps = VariantProps<typeof colorPickerVariants>

/**
 * Resolves a colour swatch (`.ui-color-picker__swatch`, `+ --auto` for the "no colour" state).
 *
 * @param props - Swatch options.
 * @param props.auto - Shows the "automatic / no colour" pattern instead of a colour.
 * @returns The BEM class string.
 */
export const colorPickerSwatchVariants = cva('ui-color-picker__swatch', {
  variants: {
    auto: {
      false: '',
      true: 'ui-color-picker__swatch--auto',
    },
  },
  defaultVariants: {
    auto: false,
  },
})

/** Variant props inferred from {@link colorPickerSwatchVariants}. */
export type ColorPickerSwatchVariantProps = VariantProps<
  typeof colorPickerSwatchVariants
>

/** BEM element: the 2D saturation / brightness area. */
export const COLOR_PICKER_AREA_CLASS = 'ui-color-picker__area'

/** BEM element: the area's thumb. */
export const COLOR_PICKER_AREA_THUMB_CLASS = 'ui-color-picker__area-thumb'

/** BEM element: the area's two visually hidden range inputs (keyboard + assistive technology). */
export const COLOR_PICKER_AREA_INPUT_CLASS = 'ui-color-picker__area-input'

/** BEM element: a hue / alpha `Slider` inside the picker. */
export const COLOR_PICKER_TRACK_CLASS = 'ui-color-picker__track'

/**
 * Resolves a hue / alpha track (`.ui-color-picker__track` + `--hue` / `--alpha`): the modifier picks
 * the gradient the skin feeds to the `Slider` (mirrored in rtl by the skin).
 *
 * @param props - Track options.
 * @param props.channel - `'hue'` or `'alpha'`.
 * @returns The BEM class string.
 */
export const colorPickerTrackVariants = cva(COLOR_PICKER_TRACK_CLASS, {
  variants: {
    channel: {
      hue: 'ui-color-picker__track--hue',
      alpha: 'ui-color-picker__track--alpha',
    },
  },
  defaultVariants: {
    channel: 'hue',
  },
})

/** Variant props inferred from {@link colorPickerTrackVariants}. */
export type ColorPickerTrackVariantProps = VariantProps<
  typeof colorPickerTrackVariants
>

/**
 * Custom property the skin sets per track modifier (the hue ramp, the alpha ramp over a
 * checkerboard) — handed to the `Slider` as its `trackImage`.
 */
export const COLOR_PICKER_TRACK_IMAGE_VAR = '--ui-color-picker-track-image'

/** BEM element: a horizontal row of controls (swatch, hex field, automatic toggle). */
export const COLOR_PICKER_ROW_CLASS = 'ui-color-picker__row'

/** BEM element: the hex field's column (input + error message). */
export const COLOR_PICKER_HEX_FIELD_CLASS = 'ui-color-picker__hex-field'

/** BEM element: the hex text field (also wears the Input skin). */
export const COLOR_PICKER_HEX_CLASS = 'ui-color-picker__hex'

/** BEM element: the hex field's error message. */
export const COLOR_PICKER_HEX_ERROR_CLASS = 'ui-color-picker__hex-error'

/** BEM element: the polite live region (visually hidden). */
export const COLOR_PICKER_STATUS_CLASS = 'ui-color-picker__status'

/** Custom property: the pure hue (hex) painted under the area's gradients. */
export const COLOR_PICKER_HUE_VAR = '--ui-color-picker-hue'

/** Custom property: the current colour (hex) — swatch fill, thumb fill. */
export const COLOR_PICKER_COLOR_VAR = '--ui-color-picker-color'

/** Custom property: the area thumb's inline position, a fraction in `[0, 1]`. */
export const COLOR_PICKER_X_VAR = '--ui-color-picker-x'

/** Custom property: the area thumb's block position, a fraction in `[0, 1]`. */
export const COLOR_PICKER_Y_VAR = '--ui-color-picker-y'

/** Custom property: the checkerboard drawn under translucent colours. */
export const COLOR_PICKER_CHECKERBOARD_VAR = '--ui-color-picker-checkerboard'
