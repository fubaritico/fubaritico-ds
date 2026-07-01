import clsx from 'clsx'

import { Input } from '../../../../Input'

import type { Table } from '@tanstack/react-table'
import type { FC, ReactElement } from 'react'

/** Shape of the global filter state — a bare string, or an object carrying a `value`. */
type GlobalFilterState = string | { value?: string } | undefined

/** Props of {@link ActionBar}. */
export interface ActionBarProps {
  /** Extra classes for the action bar. */
  className?: string
  /** Filter action elements rendered on the left. */
  leftActions?: ReactElement[]
  /** Called when the global filter text changes. */
  onGlobalFilterChange?: (value: string) => void
  /** Keeps the bar pinned to the top while scrolling. */
  stickyHeader?: boolean
  /** The TanStack table instance (read for the current global filter value). */
  tableConfiguration: Table<unknown>
}

/** Fixed width (px) of the search field, matching the original. */
const SEARCH_WIDTH = 325

/**
 * Toolbar above the table: optional left actions + a global-filter search field (the DS {@link Input}
 * replacing the original `InputText`).
 *
 * @param props - {@link ActionBarProps}.
 * @returns The action bar.
 */
const ActionBar: FC<ActionBarProps> = ({
  className,
  leftActions,
  onGlobalFilterChange,
  stickyHeader,
  tableConfiguration,
}) => {
  const globalFilter = tableConfiguration.getState()
    .globalFilter as GlobalFilterState
  const searchValue =
    typeof globalFilter === 'string'
      ? globalFilter
      : (globalFilter?.value ?? '')

  return (
    <div
      className={clsx(
        'tw-flex tw-items-center tw-p-4 tw-gap-4',
        { 'tw-sticky': stickyHeader },
        className
      )}
      data-test="action-bar"
    >
      <div className="tw-flex tw-grow tw-gap-4">{leftActions}</div>
      <div style={{ width: SEARCH_WIDTH }}>
        <Input
          icon="MagnifyingGlass"
          placeholder="Search..."
          aria-label="Search"
          value={searchValue}
          onChange={(event) => onGlobalFilterChange?.(event.target.value)}
        />
      </div>
    </div>
  )
}

export default ActionBar
