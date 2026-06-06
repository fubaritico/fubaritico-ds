import clsx from 'clsx'

import type { ComponentProps } from 'react'

/** Props for the visual listbox container */
export interface ListboxListProps extends ComponentProps<'ul'> {
  /** Color scheme for the dropdown */
  variant?: 'light' | 'dark'
}

/**
 * Visual `<ul>` wrapper for listbox-style dropdowns.
 *
 * Provides shared styling (border, shadow, scroll, variant colors) used by
 * both Menu and Typeahead.Menu. Consumers add their own ARIA attributes,
 * keyboard handling, and positioning via props/className.
 */
const ListboxList = ({
  variant = 'light',
  className,
  children,
  ref,
  ...rest
}: ListboxListProps) => {
  const isDark = variant === 'dark'

  return (
    <ul
      ref={ref}
      className={clsx(
        'ui:list-none ui:rounded-md ui:border ui:p-1 ui:shadow-md',
        'ui:max-h-60 ui:overflow-y-auto',
        isDark
          ? 'ui:border-neutral-700 ui:bg-neutral-900'
          : 'ui:border-border ui:bg-popover',
        className
      )}
      {...rest}
    >
      {children}
    </ul>
  )
}

export default ListboxList
