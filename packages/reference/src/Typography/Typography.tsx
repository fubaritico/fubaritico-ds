import clsx from 'clsx'
import { createElement } from 'react'

import type { ElementType, HTMLAttributes, ReactNode } from 'react'

export type TypographyVariant =
  | 'h1'
  | 'h2'
  | 'h3'
  | 'h4'
  | 'h5'
  | 'h6'
  | 'body'
  | 'body-sm'
  | 'body-lg'
  | 'lead'
  | 'caption'
  | 'caption-xs'
  | 'label'
  | 'muted'
  | 'overline'
  | 'blockquote'

export interface TypographyProps extends HTMLAttributes<HTMLElement> {
  /** Visual style variant */
  variant: TypographyVariant
  /** Override semantic HTML tag */
  as?: ElementType
  /** Additional CSS classes */
  className?: string
  /** Content */
  children: ReactNode
}

const variantStyles: Record<TypographyVariant, string> = {
  h1: 'ui:font-roboto ui:text-xl ui:sm:text-2xl ui:md:text-3xl ui:lg:text-4xl ui:font-bold ui:leading-tight ui:text-foreground',
  h2: 'ui:font-roboto ui:text-lg ui:sm:text-xl ui:md:text-2xl ui:lg:text-3xl ui:font-bold ui:leading-tight ui:text-foreground',
  h3: 'ui:font-roboto ui:text-base ui:sm:text-lg ui:md:text-xl ui:lg:text-2xl ui:font-semibold ui:leading-snug ui:text-foreground',
  h4: 'ui:font-roboto ui:text-sm ui:sm:text-base ui:md:text-lg ui:lg:text-xl ui:font-semibold ui:leading-snug ui:text-foreground',
  h5: 'ui:font-roboto ui:text-sm ui:sm:text-base ui:md:text-lg ui:font-medium ui:leading-normal ui:text-foreground',
  h6: 'ui:font-roboto ui:text-xs ui:sm:text-sm ui:md:text-base ui:font-medium ui:leading-normal ui:text-foreground',
  body: 'ui:font-inter ui:text-xs ui:sm:text-sm ui:md:text-base ui:leading-relaxed ui:text-foreground',
  'body-sm':
    'ui:font-inter ui:text-xs ui:sm:text-sm ui:leading-relaxed ui:text-foreground',
  'body-lg':
    'ui:font-inter ui:text-sm ui:sm:text-base ui:md:text-lg ui:leading-relaxed ui:text-foreground',
  lead: 'ui:font-inter ui:text-sm ui:sm:text-base ui:md:text-lg ui:lg:text-xl ui:leading-relaxed ui:text-muted-foreground',
  caption: 'ui:font-inter ui:text-xs ui:sm:text-sm ui:text-muted-foreground',
  'caption-xs': 'ui:font-inter ui:text-xs ui:text-muted-foreground',
  label:
    'ui:font-inter ui:text-xs ui:sm:text-sm ui:font-medium ui:text-foreground',
  muted: 'ui:font-inter ui:text-xs ui:sm:text-sm ui:text-muted-foreground',
  overline:
    'ui:font-inter ui:text-xs ui:font-semibold ui:uppercase ui:tracking-wider ui:text-muted-foreground',
  blockquote:
    'ui:font-inter ui:text-xs ui:sm:text-sm ui:md:text-base ui:border-l-4 ui:border-border ui:pl-4 ui:italic ui:text-muted-foreground',
}

const variantToTag: Record<TypographyVariant, ElementType> = {
  h1: 'h1',
  h2: 'h2',
  h3: 'h3',
  h4: 'h4',
  h5: 'h5',
  h6: 'h6',
  body: 'p',
  'body-sm': 'p',
  'body-lg': 'p',
  lead: 'p',
  caption: 'span',
  'caption-xs': 'span',
  label: 'label',
  muted: 'p',
  overline: 'span',
  blockquote: 'blockquote',
}

function Typography({
  variant,
  as,
  className,
  children,
  ...rest
}: Readonly<TypographyProps>) {
  const Component = as ?? variantToTag[variant]

  return createElement(
    Component,
    { className: clsx(variantStyles[variant], className), ...rest },
    children
  )
}

export default Typography
