import clsx from 'clsx'

import { BOTTOM_SHEET_HEADER_CLASS, BOTTOM_SHEET_TITLE_CLASS } from '@fubaritico/variants'

import { IconButton } from '../IconButton'

import { useBottomSheetContext } from './BottomSheetContext'

import type { ComponentProps } from 'react'

/** Props of {@link BottomSheetHeader}. */
export type BottomSheetHeaderProps = ComponentProps<'div'>

/**
 * The BottomSheet's title bar, with the close button built in.
 *
 * Children fill the inline-start side; the close control stays pinned to the inline-end edge and
 * switches to the on-dark button variant when the sheet is dark.
 *
 * Must be rendered inside a `<BottomSheet>`.
 *
 * @param props - {@link BottomSheetHeaderProps}.
 * @returns The rendered header.
 */
export function BottomSheetHeader({
  className,
  children,
  ...rest
}: Readonly<BottomSheetHeaderProps>) {
  const { variant, onClose } = useBottomSheetContext()

  return (
    <div className={clsx(BOTTOM_SHEET_HEADER_CLASS, className)} {...rest}>
      <div className={BOTTOM_SHEET_TITLE_CLASS}>{children}</div>
      <IconButton
        icon="XMark"
        aria-label="Close"
        size="sm"
        variant={variant === 'dark' ? 'ghost-dark' : 'ghost'}
        onClick={onClose}
      />
    </div>
  )
}

export default BottomSheetHeader
