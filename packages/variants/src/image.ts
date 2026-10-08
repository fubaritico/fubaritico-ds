import { cva } from 'class-variance-authority'

import type { VariantProps } from 'class-variance-authority'

/**
 * Resolves the picture layer of an Image into BEM class names
 * (`.ui-image__img`, `+ --loaded`).
 *
 * Pure string output (framework-agnostic): consumed by the React reference and the
 * Stencil / Angular / Vue packages alike, none of which it couples to a framework.
 *
 * @param props - Picture-layer options (all optional — CVA defaults apply).
 * @param props.loaded - Whether the source has decoded; defaults to `false` (transparent, so the
 *   blur placeholder shows through).
 * @returns The space-separated BEM class string for the resolved props.
 */
export const imageVariants = cva('ui-image__img', {
  variants: {
    loaded: {
      false: '', // still decoding — the base keeps it transparent; no modifier emitted
      true: 'ui-image__img--loaded',
    },
  },
  defaultVariants: {
    loaded: false,
  },
})

/** Variant props inferred from {@link imageVariants}. */
export type ImageVariantProps = VariantProps<typeof imageVariants>

/** BEM block class for the ratio-locked clipping frame (`.ui-image`). */
export const IMAGE_CLASS = 'ui-image'

/** BEM element class for the low-resolution placeholder layer (`.ui-image__blur`). */
export const IMAGE_BLUR_CLASS = 'ui-image__blur'

/** BEM element class for the centred fallback shown when the source fails (`.ui-image__fallback`). */
export const IMAGE_FALLBACK_CLASS = 'ui-image__fallback'
