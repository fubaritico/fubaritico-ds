import clsx from 'clsx'

import { SORT_ARROWS_CLASS, sortArrowVariants } from '@fubaritico-ds/variants'

import { Icon } from '../../../Icon'

/** Current sort direction of the column, as returned by the table state manager. */
export type SortDirection = 'asc' | 'desc' | false

/** Props of the {@link ArrowUpDown} sort toggle. */
export interface ArrowUpDownProps {
  /** Extra classes for the button. */
  className?: string
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
}: Readonly<ArrowUpDownProps>) {
  return (
    <button
      type="button"
      aria-label={colName ? `${colName} sorting` : 'sorting'}
      className={clsx(SORT_ARROWS_CLASS, className)}
      onClick={onClick}
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
