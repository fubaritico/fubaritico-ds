import { cva } from 'class-variance-authority'

import type { VariantProps } from 'class-variance-authority'

/**
 * Typography visual variants — neutral + semantic (each maps 1:1 to a rendered element via the
 * component's `variantMapping`). `inherit` applies no type styles (inherits from the parent).
 */
export type TypographyVariant =
  | 'h1'
  | 'h2'
  | 'h3'
  | 'h4'
  | 'h5'
  | 'h6'
  | 'body1'
  | 'body2'
  | 'caption'
  | 'overline'
  | 'label'
  | 'inherit'

/** Text alignment. */
export type TypographyAlign =
  | 'inherit'
  | 'left'
  | 'center'
  | 'right'
  | 'justify'

/**
 * Resolves Typography props into the BEM class names of the native skin
 * (`@fubaritico-ds/styles` → `.ui-typography`, `.ui-typography--h1`, …).
 *
 * Pure string output (framework-agnostic). The skin sets size/weight/line-height from the semantic
 * `--typography-*` tokens; it never sets `color` (inherited from the parent).
 *
 * @param props - Typography options (all optional — CVA defaults apply).
 * @param props.variant - Type role; defaults to `'body1'`.
 * @param props.align - Text alignment; defaults to `'inherit'`.
 * @param props.gutterBottom - Adds a bottom margin when `true`.
 * @param props.noWrap - Truncates with an ellipsis when `true`.
 * @returns The space-separated BEM class string for the resolved props.
 */
export const typographyVariants = cva('ui-typography', {
  variants: {
    variant: {
      h1: 'ui-typography--h1',
      h2: 'ui-typography--h2',
      h3: 'ui-typography--h3',
      h4: 'ui-typography--h4',
      h5: 'ui-typography--h5',
      h6: 'ui-typography--h6',
      body1: 'ui-typography--body1',
      body2: 'ui-typography--body2',
      caption: 'ui-typography--caption',
      overline: 'ui-typography--overline',
      label: 'ui-typography--label',
      inherit: '', // applies no type styles — inherits everything from the parent
    },
    align: {
      inherit: '',
      left: 'ui-typography--align-left',
      center: 'ui-typography--align-center',
      right: 'ui-typography--align-right',
      justify: 'ui-typography--align-justify',
    },
    gutterBottom: {
      true: 'ui-typography--gutter-bottom',
      false: '',
    },
    noWrap: {
      true: 'ui-typography--no-wrap',
      false: '',
    },
  },
  defaultVariants: {
    variant: 'body1',
    align: 'inherit',
    gutterBottom: false,
    noWrap: false,
  },
})

/** Variant props inferred from {@link typographyVariants}. */
export type TypographyVariantProps = VariantProps<typeof typographyVariants>
