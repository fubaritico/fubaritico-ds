import { cn } from '../../../ui/utils'

import type { ComponentProps } from 'react'

/**
 * `<tfoot>` primitive: the semantic table footer section (top border, muted background). Intended to
 * host the {@link TableFooterContent} pagination controls.
 *
 * @param props - Standard `<tfoot>` attributes ({@link ComponentProps}) incl. `ref` (React 19 ref-as-prop).
 * @returns The table footer section.
 */
export function TableFooter({ className, ...props }: ComponentProps<'tfoot'>) {
  return (
    <tfoot
      className={cn(
        'tw-border-t tw-bg-muted/50 tw-font-medium [&>tr]:last:tw-border-b-0',
        className
      )}
      {...props}
    />
  )
}

export default TableFooter
