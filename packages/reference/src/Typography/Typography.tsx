import clsx from 'clsx'
import { createElement } from 'react'

import { typographyVariants } from '@fubaritico-ds/variants'

import type { TypographyProps } from './Typography.types'
import type { TypographyVariant } from '@fubaritico-ds/variants'
import type { ElementType } from 'react'

/** Default variant → semantic element mapping (overridable per-instance via `variantMapping`). */
export const defaultVariantMapping: Record<TypographyVariant, ElementType> = {
  h1: 'h1',
  h2: 'h2',
  h3: 'h3',
  h4: 'h4',
  h5: 'h5',
  h6: 'h6',
  body: 'p',
  caption: 'span',
  overline: 'span',
  label: 'label',
  inherit: 'p',
}

/**
 * Typography — neutral, semantic, headless text primitive (modeled on MUI). It sets type structure
 * only (family/size/weight/line-height/alignment via the native skin) and NEVER `color` — colour is
 * inherited from the parent. Polymorphic: the element comes from `as`, else `variantMapping`, else
 * the default map for the `variant`.
 *
 * @param props - {@link TypographyProps}
 * @returns The rendered typographic element.
 */
export function Typography<C extends ElementType = 'p'>({
  variant = 'body',
  as,
  variantMapping,
  gutterBottom,
  noWrap,
  align,
  className,
  children,
  ...rest
}: TypographyProps<C>) {
  const Component =
    as ?? variantMapping?.[variant] ?? defaultVariantMapping[variant]

  return createElement(
    Component,
    {
      className: clsx(
        typographyVariants({ variant, align, gutterBottom, noWrap }),
        className
      ),
      ...rest,
    },
    children
  )
}

export default Typography
