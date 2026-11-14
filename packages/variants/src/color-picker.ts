import { cva } from 'class-variance-authority'

import type { VariantProps } from 'class-variance-authority'

/**
 * Resolves a ColorPicker panel into the BEM class names of the native skin
 * (`.ui-color-picker`, `+ --compact`, `+ --disabled`).
 *
 * Pure string output (framework-agnostic): consumed by the React reference and the Stencil /
 * Angular / Vue packages alike. The behaviour lives in `ColorPickerService`
 * (`@fubaritico/behaviors`); this only names the parts.
 *
 * @param props - ColorPicker options (all optional — CVA defaults apply).
 * @param props.density - `'default'` or `'compact'` (narrower panel, wide 2:1 area, tighter
 *   gaps and smaller thumbs); defaults to `'default'`.
 * @param props.disabled - Non-interactive; defaults to `false`.
 * @returns The space-separated BEM class string for the resolved props.
 */
export const colorPickerVariants = cva('ui-color-picker', {
  variants: {
    density: {
      default: '',
      compact: 'ui-color-picker--compact',
    },
    disabled: {
      false: '',
      true: 'ui-color-picker--disabled',
    },
  },
  defaultVariants: {
    density: 'default',
    disabled: false,
  },
})

/** Density of a ColorPicker panel: the original layout, or a tighter one for small surfaces. */
export type ColorPickerDensity = 'default' | 'compact'

/** Variant props inferred from {@link colorPickerVariants}. */
export type ColorPickerVariantProps = VariantProps<typeof colorPickerVariants>

/**
 * Resolves a colour swatch (`.ui-color-picker__swatch`): `--auto` shows the automatic mark (a magic
 * wand, rendered by the adapter as `__swatch-icon`), `--none` the struck-through square of "no
 * colour" (the Illustrator / Office convention).
 *
 * @param props - Swatch options.
 * @param props.mode - `'color'` (default), `'auto'` or `'none'` — the picker's mode.
 * @returns The BEM class string.
 */
export const colorPickerSwatchVariants = cva('ui-color-picker__swatch', {
  variants: {
    mode: {
      color: '',
      auto: 'ui-color-picker__swatch--auto',
      none: 'ui-color-picker__swatch--none',
    },
  },
  defaultVariants: {
    mode: 'color',
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

/** BEM element: a horizontal row of controls (swatch, hex field). */
export const COLOR_PICKER_ROW_CLASS = 'ui-color-picker__row'

/**
 * BEM element: a copy / paste icon button beside the hex field (mixed onto `.ui-icon-button`): the
 * skin squares it to the swatch size, while its icon keeps the clearer 20px drawing.
 */
export const COLOR_PICKER_ACTION_CLASS = 'ui-color-picker__action'

/** BEM element: the automatic mark (a magic wand) inside an `--auto` swatch. */
export const COLOR_PICKER_SWATCH_ICON_CLASS = 'ui-color-picker__swatch-icon'

/** BEM element: the mode group — a segmented control (colour · automatic · no colour). */
export const COLOR_PICKER_MODES_CLASS = 'ui-color-picker__modes'

/** BEM element: one segment of the mode group — the `<label>` wrapping its radio. */
export const COLOR_PICKER_MODE_CLASS = 'ui-color-picker__mode'

/** BEM element: a segment's native radio, visually hidden (keyboard + assistive technology). */
export const COLOR_PICKER_MODE_INPUT_CLASS = 'ui-color-picker__mode-input'

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
