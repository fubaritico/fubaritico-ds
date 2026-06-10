import clsx from 'clsx'

import { skeletonVariants } from '@fubaritico-ds/variants'

import type { SkeletonShape } from '@fubaritico-ds/variants'
import type { CSSProperties, ComponentProps } from 'react'

export type { SkeletonShape }

export interface SkeletonProps extends ComponentProps<'div'> {
  /** Shape variant — controls the corner radius (`rectangle` | `circle` | `line`). */
  variant?: SkeletonShape
  /** Inline size as any CSS length (e.g. `'200px'`, `'100%'`). Applied as an inline style. */
  width?: string
  /** Block size as any CSS length (e.g. `'1rem'`, `'40px'`). Applied as an inline style. */
  height?: string
  /** Aspect ratio (e.g. `'16 / 9'`, `'1 / 1'`). Applied as an inline style. */
  aspectRatio?: string
  /** Round the corners. Default `true` for `rectangle`/`line`; `circle` is always fully round. */
  rounded?: boolean
}

/**
 * Skeleton — native BEM skin (`@fubaritico-ds/styles`). A loading placeholder: a tinted block
 * with a shimmer sweep. The shape resolves to BEM classes via {@link skeletonVariants}; the look
 * (background, radius, shimmer) is driven by the overridable `--ui-skeleton-*` component variables.
 * Dimensions (`width`/`height`/`aspectRatio`) are per-instance inline styles, not skin concerns.
 * Forwards any extra `div` attributes (`id`, `aria-*`, `style`, …).
 *
 * @param props - {@link SkeletonProps}
 * @returns The rendered skeleton placeholder element.
 */
export function Skeleton({
  variant = 'rectangle',
  width,
  height,
  aspectRatio,
  rounded = true,
  className,
  style,
  ...rest
}: Readonly<SkeletonProps>) {
  const dimensionStyle: CSSProperties = {
    inlineSize: width,
    blockSize: height,
    aspectRatio,
    ...style,
  }

  return (
    <div
      className={clsx(skeletonVariants({ variant, rounded }), className)}
      style={dimensionStyle}
      {...rest}
    />
  )
}

export default Skeleton
