import type {
  TypographyAlign,
  TypographyVariant,
} from '@fubaritico-ds/variants'
import type { ComponentProps, ElementType } from 'react'

/**
 * Typography's own (non-element) props — neutral + semantic, modeled on MUI Typography.
 * Headless: it sets type structure only (never `color`).
 */
export interface TypographyOwnProps {
  /** Visual type role; defaults to `'body1'`. */
  variant?: TypographyVariant
  /** Per-instance override of the default variant → element mapping. */
  variantMapping?: Partial<Record<TypographyVariant, ElementType>>
  /** Adds a bottom margin when `true`. */
  gutterBottom?: boolean
  /** Truncates the text with an ellipsis (single line) when `true`. */
  noWrap?: boolean
  /** Text alignment; defaults to `'inherit'`. */
  align?: TypographyAlign
}

/**
 * Polymorphic Typography props: own props + the rendered element's attributes. `as` selects the
 * element (MUI calls it `component`) and drives the typing; when omitted the element is resolved
 * from `variantMapping`/the default map and props fall back to the `'p'` surface.
 */
export type TypographyProps<C extends ElementType = 'p'> =
  TypographyOwnProps & {
    /** Override the rendered element. Wins over `variantMapping`. */
    as?: C
  } & Omit<ComponentProps<C>, keyof TypographyOwnProps | 'as'> &
    // Rendering a real `<label>` (via `as="label"`) requires `htmlFor` — a `<label>` with no associated
    // control is a WCAG 1.3.1 violation. Enforced at compile time so the orphan case can't ship.
    (C extends 'label' ? { htmlFor: string } : object)
