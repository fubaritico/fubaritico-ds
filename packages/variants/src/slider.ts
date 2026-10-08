import { cva } from 'class-variance-authority'

import type { VariantProps } from 'class-variance-authority'

/** Size of a Slider — drives the track thickness and the thumb diameter together. */
export type SliderSize = 'sm' | 'md' | 'lg'

/**
 * Resolves a Slider into the BEM class names of the native skin
 * (`.ui-slider`, `+ --sm` / `--lg`, `+ --imaged`, `+ --disabled`).
 *
 * Pure string output (framework-agnostic): consumed by the React reference and the
 * Stencil / Angular / Vue packages alike, none of which it couples to a framework.
 *
 * `imaged` exists because a track carrying its own background — a hue ramp, an alpha
 * checkerboard — must not also paint the filled range over it. It is what lets a colour slider be
 * this same component rather than a second one.
 *
 * @param props - Slider options (all optional — CVA defaults apply).
 * @param props.size - Track and thumb scale; defaults to `'md'` (base — no modifier emitted).
 * @param props.imaged - Whether the track carries its own background image; defaults to `false`.
 * @param props.disabled - Non-interactive; defaults to `false`.
 * @returns The space-separated BEM class string for the resolved props.
 */
export const sliderVariants = cva('ui-slider', {
  variants: {
    size: {
      sm: 'ui-slider--sm',
      md: '', // default size — fully defined by the base; no modifier emitted
      lg: 'ui-slider--lg',
    },
    imaged: {
      false: '', // plain track — the filled range shows
      true: 'ui-slider--imaged',
    },
    disabled: {
      false: '',
      true: 'ui-slider--disabled',
    },
  },
  defaultVariants: {
    size: 'md',
    imaged: false,
    disabled: false,
  },
})

/** Variant props inferred from {@link sliderVariants}. */
export type SliderVariantProps = VariantProps<typeof sliderVariants>

/** BEM element class for the groove (`.ui-slider__track`). */
export const SLIDER_TRACK_CLASS = 'ui-slider__track'

/** BEM element class for the filled portion (`.ui-slider__range`). */
export const SLIDER_RANGE_CLASS = 'ui-slider__range'

/** BEM element class for the handle (`.ui-slider__thumb`). */
export const SLIDER_THUMB_CLASS = 'ui-slider__thumb'

/** BEM element class for the transparent native range that owns the interaction. */
export const SLIDER_INPUT_CLASS = 'ui-slider__input'

/**
 * Custom property carrying the thumb position to the skin (a 0–100% length).
 *
 * The component computes the percentage and sets ONLY this; the skin turns it into a logical
 * offset, so the fill direction and its RTL flip stay out of the framework layer.
 */
export const SLIDER_PROGRESS_VAR = '--ui-slider-progress'

/**
 * Custom property carrying an arbitrary track background (any CSS `background-image`).
 *
 * This is the seam a colour slider uses: a hue ramp, an alpha checkerboard or a per-channel
 * gradient is set here, with `imaged: true` so the filled range steps aside.
 */
export const SLIDER_TRACK_IMAGE_VAR = '--ui-slider-track-image'
