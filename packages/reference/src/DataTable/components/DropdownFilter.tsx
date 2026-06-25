import { Dropdown } from '../../Dropdown'

import type { DropdownOption } from '../../Dropdown'
import type { ColumnFiltersState } from '@tanstack/react-table'
import type { FC } from 'react'

/** Props of {@link DropdownFilter}. */
export interface DropdownFilterProps {
  /** Default label — also the value that clears the filter when re-selected. */
  buttonLabel: string
  /** Selectable filter options. */
  items?: DropdownOption[]
  /** Currently enabled column filters. */
  filters: ColumnFiltersState
  /** Id of the column this dropdown filters. */
  filterId: string
  /** Called with the next column-filters state when the selection changes. */
  onFiltersChange: (filters: ColumnFiltersState) => void
  /** Optional fixed width (px). */
  width?: number
}

/**
 * Toggles a value into/out of `prev` for `filterName`; selecting `togglingValue` clears the filter.
 *
 * @param prev - Current column-filters state.
 * @param filterName - Column id to update.
 * @param value - Selected value.
 * @param togglingValue - Value that clears the filter (the default label).
 * @returns The next column-filters state.
 */
const combineColumnFilters = (
  prev: ColumnFiltersState,
  filterName: string,
  value: string,
  togglingValue: string
): ColumnFiltersState => {
  if (value === togglingValue) {
    return prev.filter((filter) => filter.id !== filterName)
  }

  const existing = prev.find((filter) => filter.id === filterName)
  if (existing) {
    return prev.map((filter) =>
      filter.id === filterName ? { ...filter, value } : filter
    )
  }
  return [...prev, { id: filterName, value }]
}

/**
 * Column filter built on the DS {@link Dropdown} (replacing the original `DropdownMenu` + `SimpleButton`).
 * Selecting an option sets the column filter; re-selecting the default label clears it.
 *
 * @param props - {@link DropdownFilterProps}.
 * @returns The filter dropdown.
 */
const DropdownFilter: FC<DropdownFilterProps> = ({
  items = [],
  buttonLabel,
  filters,
  filterId,
  onFiltersChange,
  width,
}) => {
  const currentValue =
    (filters.find((filter) => filter.id === filterId)?.value as
      | string
      | undefined) ?? buttonLabel

  return (
    <div style={width ? { width } : undefined}>
      <Dropdown
        aria-label={buttonLabel}
        withPortal
        options={items}
        selectedValue={currentValue}
        onSelect={(value) => {
          onFiltersChange(
            combineColumnFilters(filters, filterId, value, buttonLabel)
          )
        }}
      />
    </div>
  )
}

export default DropdownFilter
