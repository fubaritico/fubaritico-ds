import clsx from 'clsx'

import type { LiHTMLAttributes, ReactNode, Ref } from 'react'

/** Props for the visual listbox item */
export interface ListboxItemProps
  extends Omit<LiHTMLAttributes<HTMLLIElement>, 'children'> {
  /** Color scheme */
  variant?: 'light' | 'dark'
  /** Whether this item has keyboard/hover focus */
  isActive?: boolean
  /** Whether this item is the persistently selected value (Menu only) */
  isSelected?: boolean
  /** Whether the item is non-interactive */
  disabled?: boolean
  /** Item content */
  children: ReactNode
  /** Forwarded ref for scrollIntoView */
  ref?: Ref<HTMLLIElement>
}

/**
 * Visual `<li>` for listbox-style items.
 *
 * Provides shared styling (padding, font, variant colors, active/selected/
 * disabled/hover states) used by both Menu.Item and Typeahead.Item.
 * Consumers add their own ARIA attributes, event handlers, and ids via props.
 */
const ListboxItem = ({
  variant = 'light',
  isActive = false,
  isSelected = false,
  disabled = false,
  className,
  children,
  ref,
  ...rest
}: ListboxItemProps) => {
  const isDark = variant === 'dark'

  return (
    <li
      ref={ref}
      role="option"
      aria-disabled={disabled || undefined}
      className={clsx(
        'ui:cursor-pointer ui:select-none ui:rounded ui:px-3 ui:py-2 ui:text-sm ui:font-roboto ui:transition-colors',
        isDark ? 'ui:text-neutral-200' : 'ui:text-foreground',
        disabled && 'ui:pointer-events-none ui:opacity-50',
        !disabled &&
          isActive &&
          (isDark
            ? 'ui:bg-primary/25 ui:text-white'
            : 'ui:bg-primary/20 ui:text-primary-foreground'),
        !disabled &&
          isSelected &&
          !isActive &&
          (isDark
            ? 'ui:bg-primary/15 ui:font-medium ui:text-primary'
            : 'ui:bg-primary/10 ui:font-medium ui:text-primary-hover'),
        !disabled &&
          !isActive &&
          !isSelected &&
          (isDark
            ? 'ui:hover:bg-neutral-800 ui:hover:text-white'
            : 'ui:hover:bg-secondary ui:hover:text-secondary-foreground'),
        className
      )}
      {...rest}
    >
      {children}
    </li>
  )
}

export default ListboxItem
