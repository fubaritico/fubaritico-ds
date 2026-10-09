import { cva } from 'class-variance-authority'

import type { VariantProps } from 'class-variance-authority'

/** Visual surface variant of the Card — chrome only (background, border, shadow). */
export type CardVariant = 'default' | 'outline' | 'elevated' | 'ghost'

/**
 * Resolves the Card's surface variant into the BEM class names of the native skin
 * (`@fubaritico/styles` → `.ui-card`, `.ui-card--outline`, …).
 *
 * Pure string output (framework-agnostic): consumed by the React reference and the
 * Stencil / Angular / Vue packages alike, none of which it couples to a framework.
 *
 * Only the surface (chrome) is resolved here. Inner spacing (padding/gap) belongs to the slot
 * elements (`Card.Body` / `Card.Header` / `Card.Footer`), whose static classes are exported below —
 * they have no variants, so they need no resolver (mirrors `BADGE_ICON_CLASS`).
 *
 * @param props - Card options (all optional — CVA defaults apply).
 * @param props.variant - Visual surface variant; defaults to `'default'`.
 * @returns The space-separated BEM class string for the resolved variant.
 */
export const cardVariants = cva('ui-card', {
  variants: {
    variant: {
      default: '', // base surface — fully defined by `.ui-card`; no modifier emitted
      outline: 'ui-card--outline',
      elevated: 'ui-card--elevated',
      ghost: 'ui-card--ghost',
    },
  },
  defaultVariants: {
    variant: 'default',
  },
})

/** Variant props inferred from {@link cardVariants}. */
export type CardVariantProps = VariantProps<typeof cardVariants>

/**
 * BEM element class for the Card's padded content region (`.ui-card__body` in the skin) — the
 * place textual content lives, since the root `.ui-card` owns no padding.
 */
export const CARD_BODY_CLASS = 'ui-card__body'

/**
 * BEM element class for the Card's header region (`.ui-card__header` — a padded column with a tight
 * inner gap, for a title / subtitle).
 */
export const CARD_HEADER_CLASS = 'ui-card__header'

/**
 * BEM element class for the Card's footer region (`.ui-card__footer` — a padded row, for actions).
 */
export const CARD_FOOTER_CLASS = 'ui-card__footer'

/** Horizontal placement of a Card footer's actions. */
export type CardFooterAlign = 'start' | 'center' | 'end' | 'between'

/**
 * Resolves a Card footer's action alignment into BEM class names
 * (`.ui-card__footer`, `+ --start` / `--end` / `--between`).
 *
 * Pure string output (framework-agnostic): consumed by the React reference and the
 * Stencil / Angular / Vue packages alike, none of which it couples to a framework.
 *
 * `center` is the base. The row previously had no `justify-content` at all and fell back to
 * `flex-start`, so the actions sat against the inline-start edge by accident rather than by
 * choice — the alignment is now stated.
 *
 * @param props - Footer options (all optional — CVA defaults apply).
 * @param props.align - Where the actions sit; defaults to `'center'` (base — no modifier emitted).
 * @returns The space-separated BEM class string for the resolved props.
 */
export const cardFooterVariants = cva(CARD_FOOTER_CLASS, {
  variants: {
    align: {
      start: 'ui-card__footer--start',
      center: '', // default — fully defined by the base; no modifier emitted
      end: 'ui-card__footer--end',
      between: 'ui-card__footer--between',
    },
  },
  defaultVariants: {
    align: 'center',
  },
})

/** Variant props inferred from {@link cardFooterVariants}. */
export type CardFooterVariantProps = VariantProps<typeof cardFooterVariants>
