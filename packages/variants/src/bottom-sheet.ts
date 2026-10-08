import { cva } from 'class-variance-authority'

import type { VariantProps } from 'class-variance-authority'

/** Colour scheme of the BottomSheet — mirrors the Listbox/Menu convention. */
export type BottomSheetVariant = 'light' | 'dark'

/**
 * Resolves the BottomSheet panel into BEM class names
 * (`.ui-bottom-sheet`, `+ --dark`, `+ --animated`).
 *
 * Pure string output (framework-agnostic): consumed by the React reference and the
 * Stencil / Angular / Vue packages alike, none of which it couples to a framework.
 *
 * `animated` is a separate axis rather than part of the colour scheme because the slide is an
 * ENTRANCE: the composer turns it on for the first open only, so a content update inside an
 * already-open sheet does not replay it.
 *
 * @param props - BottomSheet options (all optional — CVA defaults apply).
 * @param props.variant - Colour scheme; defaults to `'light'` (base — no modifier emitted).
 * @param props.animated - Whether to play the entrance slide; defaults to `false`.
 * @returns The space-separated BEM class string for the resolved props.
 */
export const bottomSheetVariants = cva('ui-bottom-sheet', {
  variants: {
    variant: {
      light: '', // default — fully defined by the base; no modifier emitted
      dark: 'ui-bottom-sheet--dark',
    },
    animated: {
      false: '', // no entrance — the panel simply appears
      true: 'ui-bottom-sheet--animated',
    },
  },
  defaultVariants: {
    variant: 'light',
    animated: false,
  },
})

/** Variant props inferred from {@link bottomSheetVariants}. */
export type BottomSheetVariantProps = VariantProps<typeof bottomSheetVariants>

/** BEM element class for the optional scrim behind the sheet (`.ui-bottom-sheet__overlay`). */
export const BOTTOM_SHEET_OVERLAY_CLASS = 'ui-bottom-sheet__overlay'

/** BEM element class for the header bar (`.ui-bottom-sheet__header`). */
export const BOTTOM_SHEET_HEADER_CLASS = 'ui-bottom-sheet__header'

/** BEM element class for the header's growing title slot (`.ui-bottom-sheet__title`). */
export const BOTTOM_SHEET_TITLE_CLASS = 'ui-bottom-sheet__title'

/** BEM element class for the scrollable content area (`.ui-bottom-sheet__body`). */
export const BOTTOM_SHEET_BODY_CLASS = 'ui-bottom-sheet__body'
