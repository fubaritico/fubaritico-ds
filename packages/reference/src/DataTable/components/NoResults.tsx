import { Icon } from '../../Icon'

import type { FC } from 'react'

/** Props of {@link NoResults}. */
export interface NoResultsProps {
  /** Number of columns to span (so the empty state fills the row). */
  columnLength?: number
}

/** Pixel size of the empty-state icon. */
const EMPTY_ICON_SIZE = 32

/**
 * Empty-state row shown when the table has no rows. Replaces the original custom illustration with a
 * heroicons glyph + a "No results" label.
 *
 * @param props - {@link NoResultsProps}.
 * @returns A full-width empty-state table row.
 */
const NoResults: FC<NoResultsProps> = ({ columnLength }) => {
  return (
    <tr>
      <td colSpan={columnLength} data-test="no-data-cell">
        <div className="tw-flex tw-w-full tw-flex-col tw-items-center tw-justify-center tw-gap-2 tw-h-[300px]">
          <Icon
            name="MagnifyingGlass"
            size={EMPTY_ICON_SIZE}
            aria-hidden="true"
          />
          <span>No results</span>
        </div>
      </td>
    </tr>
  )
}

export default NoResults
