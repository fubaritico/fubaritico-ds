import { UI_TABLE_VIRTUALIZED_CLASS } from '@fubaritico-ds/variants'

import { cn } from '../../../utils'

import type { ComponentProps } from 'react'

/**
 * Bare `<table>` primitive for the virtualized DataTable (`.ui-table` + `--virtualized`): no scroll
 * wrapper (the virtualizer owns the scroll container). The `--virtualized` modifier's `::after`
 * consumes the `--pseudo-height` custom property (the sticky-header + virtualization fix — see
 * `useVirtualizedTable`).
 *
 * @param props - Standard `<table>` attributes ({@link ComponentProps}) incl. `ref` (React 19 ref-as-prop).
 * @returns The table element.
 */
export function TableVirtualized({
  className,
  ...props
}: ComponentProps<'table'>) {
  return (
    <table className={cn(UI_TABLE_VIRTUALIZED_CLASS, className)} {...props} />
  )
}

export default TableVirtualized
