import clsx from 'clsx'

import {
  UI_TABLE_TOOLBAR_ACTIONS_CLASS,
  UI_TABLE_TOOLBAR_CLASS,
  UI_TABLE_TOOLBAR_SEARCH_CLASS,
  UI_TABLE_TOOLBAR_STICKY_MODIFIER,
} from '@fubaritico-ds/variants'

import { Input } from '../../../../Input'

import type { Table } from '@tanstack/react-table'
import type { ReactElement } from 'react'

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

/**
 * Toolbar above the table: optional left actions + a global-filter search field (the DS {@link Input}
 * replacing the original `InputText`).
 *
 * @param props - {@link ActionBarProps}.
 * @returns The action bar.
 */
export function ActionBar({
  className,
  leftActions,
  onGlobalFilterChange,
  stickyHeader,
  tableConfiguration,
}: Readonly<ActionBarProps>) {
  const globalFilter = tableConfiguration.getState()
    .globalFilter as GlobalFilterState
  const searchValue =
    typeof globalFilter === 'string'
      ? globalFilter
      : (globalFilter?.value ?? '')

  return (
    <div
      className={clsx(
        UI_TABLE_TOOLBAR_CLASS,
        { [UI_TABLE_TOOLBAR_STICKY_MODIFIER]: stickyHeader },
        className
      )}
      data-test="action-bar"
    >
      <div className={UI_TABLE_TOOLBAR_ACTIONS_CLASS}>{leftActions}</div>
      <div className={UI_TABLE_TOOLBAR_SEARCH_CLASS}>
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
