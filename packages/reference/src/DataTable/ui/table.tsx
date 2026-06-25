import * as React from 'react'
import { HTMLAttributes } from 'react'

import { cn } from './utils'

type TableProps = HTMLAttributes<HTMLTableElement> & {
  maxHeight?: number
}

// Omitting no element properties
const elementProps = <Props extends object>(
  pProps: Props,
  propName: string
) => {
  const newProps: Props = {} as Props
  for (const key in pProps) {
    if (Object.prototype.hasOwnProperty.call(pProps, key)) {
      if (key === propName) {
        continue
      }

      const typedKey = key as keyof Props
      newProps[typedKey] = pProps[typedKey]
    }
  }
  return newProps
}

const Table = React.forwardRef<HTMLTableElement, TableProps>(
  ({ className, ...props }, ref) => {
    return (
      <div
        className="tw-relative tw-w-full"
        style={props.maxHeight ? { maxHeight: props.maxHeight } : undefined}
      >
        <table
          ref={ref}
          className={cn(
            'tw-w-full tw-table-fixed tw-caption-bottom tw-text-sm',
            className
          )}
          {...elementProps<TableProps>(props, 'maxHeight')}
        />
      </div>
    )
  }
)
Table.displayName = 'Table'

const TableVirtualized = React.forwardRef<HTMLTableElement, TableProps>(
  ({ className, ...props }, ref) => {
    return (
      <table
        ref={ref}
        className={cn(
          'tw-w-full tw-table-fixed tw-caption-bottom tw-text-sm',
          className
        )}
        {...elementProps<TableProps>(props, 'maxHeight')}
      />
    )
  }
)
TableVirtualized.displayName = 'TableVirtualized'

/**
 * Here we can define default width (percentage or pixels) according to a data type
 */
const TableHeader = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <thead
    ref={ref}
    className={cn(
      '[&_tr]:tw-border-b',
      '[&_th[data-type="link-name"]]:tw-w-[25%]',
      '[&_th[data-type="status-icon"]]:tw-w-[120px]',
      '[&_th[data-type="date"]]:tw-w-[200px]',
      className
    )}
    {...props}
  />
))
TableHeader.displayName = 'TableHeader'

const TableBody = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <tbody
    ref={ref}
    className={cn('[&_tr:last-child]:tw-border-0', className)}
    {...props}
  />
))
TableBody.displayName = 'TableBody'

const TableFooter = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <tfoot
    ref={ref}
    className={cn(
      'tw-border-t tw-bg-muted/50 tw-font-medium [&>tr]:last:tw-border-b-0',
      className
    )}
    {...props}
  />
))
TableFooter.displayName = 'TableFooter'

type TableRowProps = HTMLAttributes<HTMLTableRowElement> & {
  enableHover?: boolean
}

const TableRow = React.forwardRef<HTMLTableRowElement, TableRowProps>(
  ({ className, ...props }, ref) => {
    return (
      <tr
        ref={ref}
        className={cn(
          'tw-border-b tw-bg-white tw-transition-colors data-[state=selected]:tw-bg-muted',
          { 'hover:tw-bg-muted/50': props.enableHover },
          className
        )}
        {...elementProps<TableRowProps>(props, 'enableHover')}
      />
    )
  }
)
TableRow.displayName = 'TableRow'

const TableHead = React.forwardRef<
  HTMLTableCellElement,
  React.ThHTMLAttributes<HTMLTableCellElement>
>(({ className, ...props }, ref) => (
  <th
    ref={ref}
    className={cn(
      'tw-h-12 tw-pl-4 tw-text-left tw-align-middle tw-font-medium tw-text-muted-foreground [&:has([role=checkbox])]:tw-pr-0',
      className
    )}
    {...props}
  />
))
TableHead.displayName = 'TableHead'

const TableCell = React.forwardRef<
  HTMLTableCellElement,
  React.TdHTMLAttributes<HTMLTableCellElement>
>(({ className, ...props }, ref) => (
  <td
    ref={ref}
    className={cn(
      'tw-px-4 tw-h-[54px] [&:has([role=checkbox])]:tw-pr-0',
      className
    )}
    {...props}
  />
))
TableCell.displayName = 'TableCell'

const TableCaption = React.forwardRef<
  HTMLTableCaptionElement,
  React.HTMLAttributes<HTMLTableCaptionElement>
>(({ className, ...props }, ref) => (
  <caption
    ref={ref}
    className={cn('tw-mt-4 tw-text-sm tw-text-muted-foreground', className)}
    {...props}
  />
))
TableCaption.displayName = 'TableCaption'

export {
  Table,
  TableVirtualized,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
}
