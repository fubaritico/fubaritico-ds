import './styles.css'

export { Avatar } from './Avatar'
export type {
  AvatarProps,
  AvatarSize,
  AvatarImageProps,
  AvatarFallbackProps,
  AvatarIconProps,
  AvatarInitialsProps,
  AvatarImageStatus,
} from './Avatar'

export { Badge } from './Badge'
export type { BadgeProps, BadgeSize, BadgeVariant } from './Badge'

export { Button } from './Button'
export type { ButtonProps } from './Button'
// Router-coupled Button adapters are intentionally NOT re-exported here — import them from their
// dedicated subpaths so the plain `Button` stays framework-free (presentational-first):
//   import { LinkButton } from '@fubaritico-ds/reference/LinkButton'         (react-router)
//   import { NextLinkButton } from '@fubaritico-ds/reference/NextLinkButton' (next)

export { Card } from './Card'
export type { CardProps, CardVariant, CardSlotProps } from './Card'

export { Checkbox } from './Checkbox'
export type { CheckboxProps, CheckboxSize } from './Checkbox'

export { default as DataTable, DataTableVirtualized } from './DataTable'
export type { DataTableProps, DataTableVirtualizedProps } from './DataTable'

export { Dropdown } from './Dropdown'
export type { DropdownProps, DropdownOption } from './Dropdown'

export { Drawer } from './Drawer'
export type {
  DrawerProps,
  DrawerHeaderProps,
  DrawerBodyProps,
  DrawerVariant,
} from './Drawer'

export { Icon } from './Icon'
export type { IconProps, IconName, IconSize } from './Icon'

export { IconButton } from './IconButton'
export type { IconButtonProps } from './IconButton'

export { Image } from './Image'
export type { AspectRatio, ImageProps, ImageState } from './Image'

export { Input } from './Input'
export type { InputProps, InputSize, InputMessageType } from './Input'

export { Menu } from './Menu'
export type { MenuProps, MenuItemProps, MenuVariant } from './Menu'

export { HeroImage } from './HeroImage'
export type { HeroImageProps } from './HeroImage'

export { Modal } from './Modal'
export type { ModalProps } from './Modal'

export { Pagination } from './Pagination'
export type { PaginationProps } from './Pagination'

export { Rating } from './Rating'
export type { RatingProps, RatingSize, RatingVariant } from './Rating'

export { TrailerCard } from './TrailerCard'
export type { TrailerCardProps } from './TrailerCard'

export {
  Carousel,
  CarouselCounter,
  CarouselItem,
  CarouselLoading,
  CarouselNavigation,
  CarouselPagination,
} from './Carousel'
export type {
  CarouselArrowPosition,
  CarouselCounterProps,
  CarouselItemProps,
  CarouselLoadingProps,
  CarouselNavigationPosition,
  CarouselNavigationProps,
  CarouselPaginationProps,
  CarouselProps,
  CarouselVariant,
} from './Carousel'

export { Tabs } from './Tabs'
export type { TabsProps, TabsVariant } from './Tabs'

export { Tooltip } from './Tooltip'
export type {
  TooltipProps,
  TooltipPlacement,
  TooltipManualPosition,
  TooltipPosition,
} from './Tooltip'

export { Skeleton } from './Skeleton'
export type { SkeletonProps, SkeletonShape } from './Skeleton'

export { Typography } from './Typography'
export type { TypographyProps, TypographyVariant } from './Typography'

export { Portal } from './Portal'
export type { PortalProps } from './Portal'

export { Spinner } from './Spinner'
export type { SpinnerProps, SpinnerSize } from './Spinner'

export { Typeahead } from './Typeahead'
export type {
  TypeaheadProps,
  TypeaheadItemProps,
  TypeaheadEmptyProps,
  TypeaheadInputProps,
  TypeaheadMenuProps,
} from './Typeahead'
