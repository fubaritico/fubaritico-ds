import { cn } from '../../ui/utils'

import type { ComponentProps } from 'react'

/**
 * Bare `<table>` primitive for the virtualized DataTable: no scroll wrapper (the virtualizer owns the
 * scroll container). Its `::after` consumes the `--pseudo-height` custom property (the sticky-header +
 * virtualization fix — see `useVirtualizedTable`).
 *
 * @param props - Standard `<table>` attributes ({@link ComponentProps}) incl. `ref` (React 19 ref-as-prop).
 * @returns The table element.
 */
export function TableVirtualized({
  className,
  ...props
}: ComponentProps<'table'>) {
  return (
    <table
      className={cn(
        'tw-w-full tw-table-fixed tw-caption-bottom tw-text-sm',
        className
      )}
      {...props}
    />
  )
}

export default TableVirtualized
