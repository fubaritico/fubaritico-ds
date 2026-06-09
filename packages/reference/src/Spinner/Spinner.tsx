import clsx from 'clsx'

import { spinnerVariants } from '@fubaritico-ds/variants'

import type { SpinnerSize } from '@fubaritico-ds/variants'
import type { ComponentProps } from 'react'

export type { SpinnerSize }

export interface SpinnerProps extends ComponentProps<'div'> {
  /** Size. */
  size?: SpinnerSize
}

/**
 * Spinner — native BEM skin (`@fubaritico-ds/styles`). A headless loading indicator: the ring
 * inherits `currentColor`, so it takes the surrounding text colour (override with `color` or the
 * `--ui-spinner-*` component variables). Size resolves to a BEM class via {@link spinnerVariants}.
 *
 * Renders `role="status"` with a default accessible name; pass `aria-label` to localise it.
 *
 * @param props - {@link SpinnerProps}
 * @returns The rendered spinner element.
 */
export function Spinner({
  size = 'md',
  className,
  'aria-label': ariaLabel = 'Loading',
  ...rest
}: Readonly<SpinnerProps>) {
  return (
    <div
      role="status"
      aria-label={ariaLabel}
      className={clsx(spinnerVariants({ size }), className)}
      {...rest}
    />
  )
}

export default Spinner
