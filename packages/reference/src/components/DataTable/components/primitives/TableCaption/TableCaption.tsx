import { UI_DATA_TABLE_CAPTION_CLASS } from '@fubaritico-ds/variants'

import { cn } from '../../../utils'

import type { ComponentProps } from 'react'

/**
 * `<caption>` primitive (`.ui-data-table__caption`): a bottom-placed, muted table caption (accessible
 * table name/description).
 *
 * @param props - Standard `<caption>` attributes ({@link ComponentProps}) incl. `ref` (React 19 ref-as-prop).
 * @returns The table caption element.
 */
export function TableCaption({
  className,
  ...props
}: Readonly<ComponentProps<'caption'>>) {
  return (
    <caption className={cn(UI_DATA_TABLE_CAPTION_CLASS, className)} {...props} />
  )
}

export default TableCaption
