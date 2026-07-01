import { cn } from '../../../utils'

import type { ComponentProps } from 'react'

/** Props of {@link Table}: standard `<table>` attributes plus an optional fixed max height. */
export interface TableProps extends ComponentProps<'table'> {
  /** When set, caps the scrollable wrapper height (px) — use together with a sticky header. */
  maxHeight?: number
}

/**
 * `<table>` primitive wrapped in a relative, full-width scroll container. Here default column widths
 * can be tuned per data type via the header rules.
 *
 * @param props - {@link TableProps} (incl. `ref`, a React 19 prop forwarded to the `<table>`).
 * @returns The wrapped table element.
 */
export function Table({ className, maxHeight, ...props }: TableProps) {
  return (
    <div
      className="tw-relative tw-w-full"
      style={maxHeight ? { maxHeight } : undefined}
    >
      <table
        className={cn(
          'tw-w-full tw-table-fixed tw-caption-bottom tw-text-sm',
          className
        )}
        {...props}
      />
    </div>
  )
}

export default Table
