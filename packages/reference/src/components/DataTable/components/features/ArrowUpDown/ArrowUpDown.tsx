import clsx from 'clsx'

import { SORT_ARROWS_CLASS, sortArrowVariants } from '@fubaritico-ds/variants'

import { Icon } from '../../../../Icon'
import { SORT_DIRECTION_TO_ARIA } from '../../../utils'

import type { SortDirection } from '../../../utils'
import type { ComponentProps } from 'react'

/** Props of the {@link ArrowUpDown} sort toggle. */
export interface ArrowUpDownProps
  extends Omit<ComponentProps<'button'>, 'onClick'> {
  /** Column name, used to build the accessible label. */
  colName?: string
  /** Click handler — toggles the column sort. */
  onClick: () => void
  /** Current sort direction (`'asc'` / `'desc'` / `false` when unsorted). */
  sorting: SortDirection
}

/** Pixel size of the chevron glyphs (matches the original 16px arrows). */
const CHEVRON_SIZE = 16

/**
 * Stacked up/down chevron button that toggles a column's sort direction. The chevron for the
 * non-active direction is dimmed. Icons come from the DS {@link Icon}; styling from the native skin
 * (`.ui-sort-arrows`).
 *
 * @param props - {@link ArrowUpDownProps}.
 * @returns The rendered sort-toggle button.
 */
export function ArrowUpDown({
  className,
  colName,
  onClick,
  sorting,
  ...rest
}: Readonly<ArrowUpDownProps>) {
  const direction = sorting ? ` (${SORT_DIRECTION_TO_ARIA[sorting]})` : ''
  const sortingLabel = colName ? `Sort ${colName}` : 'Sort'
  const label = `${sortingLabel}${direction}`

  return (
    <button
      type="button"
      aria-label={label}
      className={clsx(SORT_ARROWS_CLASS, className)}
      onClick={onClick}
      {...rest}
    >
      <Icon
        name="ChevronUp"
        size={CHEVRON_SIZE}
        className={sortArrowVariants({ dimmed: sorting === 'desc' })}
        aria-hidden="true"
      />
      <Icon
        name="ChevronDown"
        size={CHEVRON_SIZE}
        className={sortArrowVariants({ dimmed: sorting === 'asc' })}
        aria-hidden="true"
      />
    </button>
  )
}

export default ArrowUpDown
