export { Alert } from './components/Alert'
export type { AlertProps, AlertVariant } from './components/Alert'

export { Avatar } from './components/Avatar'
export type {
  AvatarProps,
  AvatarSize,
  AvatarImageProps,
  AvatarFallbackProps,
  AvatarIconProps,
  AvatarInitialsProps,
  AvatarImageStatus,
} from './components/Avatar'

export { Badge } from './components/Badge'
export type { BadgeProps, BadgeSize, BadgeVariant } from './components/Badge'

export { Button } from './components/Button'
export type { ButtonProps } from './components/Button'
// Router-coupled Button adapters are intentionally NOT re-exported here — import them from their
// dedicated subpaths so the plain `Button` stays framework-free (presentational-first):
//   import { LinkButton } from '@fubaritico-ds/reference/LinkButton'         (react-router)
//   import { NextLinkButton } from '@fubaritico-ds/reference/NextLinkButton' (next)

export { Card } from './components/Card'
export type {
  CardProps,
  CardVariant,
  CardSlotProps,
  CardFooterProps,
  CardFooterAlign,
} from './components/Card'

export { Checkbox } from './components/Checkbox'
export type { CheckboxProps, CheckboxSize } from './components/Checkbox'

export {
  default as DataTable,
  DataTableVirtualized,
} from './components/DataTable'
export type {
  DataTableProps,
  DataTableVirtualizedProps,
} from './components/DataTable'

export { Drawer } from './components/Drawer'
export type {
  DrawerProps,
  DrawerHeaderProps,
  DrawerBodyProps,
  DrawerFooterProps,
  DrawerSide,
  DrawerSize,
  DrawerVariant,
} from './components/Drawer'

export { Dropdown } from './components/Dropdown'
export type { DropdownProps, DropdownOption } from './components/Dropdown'

export { BottomSheet } from './components/BottomSheet'
export type {
  BottomSheetProps,
  BottomSheetHeaderProps,
  BottomSheetBodyProps,
  BottomSheetVariant,
} from './components/BottomSheet'

export { Icon } from './components/Icon'
export type { IconProps, IconName, IconSize } from './components/Icon'

export { IconButton } from './components/IconButton'
export type { IconButtonProps } from './components/IconButton'

export { Image } from './components/Image'
export type { AspectRatio, ImageProps, ImageState } from './components/Image'

export { Input } from './components/Input'
export type {
  InputProps,
  InputSize,
  InputMessageType,
} from './components/Input'

export { ListboxItem, ListboxList } from './components/Listbox'
export type {
  ListboxItemProps,
  ListboxItemState,
  ListboxListProps,
  ListboxVariant,
} from './components/Listbox'

export { Menu } from './components/Menu'
export type { MenuProps, MenuItemProps, MenuVariant } from './components/Menu'

export { Modal } from './components/Modal'
export type { ModalProps } from './components/Modal'

export { Pagination } from './components/Pagination'
export type { PaginationProps } from './components/Pagination'

export { ProgressBar } from './components/ProgressBar'
export type {
  ProgressBarProps,
  ProgressBarSize,
  ProgressBarVariant,
} from './components/ProgressBar'

export { Rating } from './components/Rating'
export type {
  RatingProps,
  RatingSize,
  RatingVariant,
} from './components/Rating'


export { Tabs } from './components/Tabs'
export type { TabsProps, TabsVariant } from './components/Tabs'

export { Tooltip } from './components/Tooltip'
export type {
  TooltipProps,
  TooltipPlacement,
  TooltipManualPosition,
  TooltipPosition,
} from './components/Tooltip'

export { Skeleton } from './components/Skeleton'
export type { SkeletonProps, SkeletonShape } from './components/Skeleton'

export { Typography } from './components/Typography'
export type {
  TypographyProps,
  TypographyVariant,
} from './components/Typography'

export { Portal } from './components/Portal'
export type { PortalProps } from './components/Portal'

export { Spinner } from './components/Spinner'
export type { SpinnerProps, SpinnerSize } from './components/Spinner'

export { Typeahead } from './components/Typeahead'
export type {
  TypeaheadProps,
  TypeaheadItemProps,
  TypeaheadEmptyProps,
  TypeaheadInputProps,
  TypeaheadMenuProps,
} from './components/Typeahead'
