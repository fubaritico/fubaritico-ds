import type { IconName } from '../Icon'
import type { ButtonSize, ButtonVariant } from '@fubaritico-ds/variants'
import type { ReactNode } from 'react'

/** A single option in the dropdown. */
export interface DropdownOption {
  /** Unique value for this option. */
  value: string
  /** Display label for this option. */
  label: string
  /** Whether this option is non-interactive. */
  disabled?: boolean
  /** Renders a separator before this item. */
  dividerBefore?: boolean
  /** Renders the item in destructive (red) styling. */
  destructive?: boolean
  /** Any CSS colour — renders a leading colour dot before the label (e.g. `'green'`, `'#0a7'`). */
  color?: string
  /** Icon (from the DS icon set) rendered after the colour dot. */
  icon?: IconName
}

/** Props of the {@link Dropdown} component. */
export interface DropdownProps {
  /** Label displayed before the trigger button (e.g. "Sort by"). */
  label?: string
  /** List of selectable options. */
  options: readonly DropdownOption[]
  /** Currently selected value. */
  selectedValue: string
  /** Called when an option is selected. */
  onSelect: (value: string) => void
  /** Accessible label for the trigger button (defaults to `"${label}: ${selectedLabel}"`). */
  'aria-label'?: string
  /** Accessible label for the floating menu. */
  menuAriaLabel?: string
  /** Render the menu inside a Portal — escapes `overflow:hidden` ancestors. */
  withPortal?: boolean
  /** Custom trigger content — replaces the default label + caret inside the button. */
  trigger?: (props: { isOpen: boolean; selectedLabel: string }) => ReactNode
  /** Trigger button variant; defaults to `'outline'`. */
  buttonVariant?: ButtonVariant
  /** Trigger button size; defaults to `'md'`. */
  buttonSize?: ButtonSize
  /** Additional className for the trigger button. */
  buttonClassName?: string
  /** Whether the trigger button takes the full width (defaults to `true` when no custom trigger). */
  buttonFullWidth?: boolean
  /** Horizontal edge the menu aligns to relative to the trigger; defaults to `'left'`. */
  position?: 'left' | 'right'
  /** Custom renderer for each menu item — replaces the default dot/icon/label content. */
  renderItem?: (
    option: DropdownOption,
    context: { isSelected: boolean }
  ) => ReactNode
}
