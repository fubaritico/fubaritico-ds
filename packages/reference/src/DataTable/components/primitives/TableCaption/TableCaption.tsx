import { cn } from '../../../utils'

import type { ComponentProps } from 'react'

/**
 * `<caption>` primitive: a bottom-placed, muted table caption (accessible table name/description).
 *
 * @param props - Standard `<caption>` attributes ({@link ComponentProps}) incl. `ref` (React 19 ref-as-prop).
 * @returns The table caption element.
 */
export function TableCaption({
  className,
  ...props
}: ComponentProps<'caption'>) {
  return (
    <caption
      className={cn('tw-mt-4 tw-text-sm tw-text-muted-foreground', className)}
      {...props}
    />
  )
}

export default TableCaption
