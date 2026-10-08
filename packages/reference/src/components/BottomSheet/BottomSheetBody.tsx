import clsx from 'clsx'

import { BOTTOM_SHEET_BODY_CLASS } from '@fubaritico-ds/variants'

import type { ComponentProps } from 'react'

/** Props of {@link BottomSheetBody}. */
export type BottomSheetBodyProps = ComponentProps<'div'>

/**
 * The BottomSheet's scrollable content area.
 *
 * Takes the space the header leaves and scrolls on overflow, so the sheet never grows past its
 * maximum height.
 *
 * @param props - {@link BottomSheetBodyProps}.
 * @returns The rendered body.
 */
export function BottomSheetBody({
  className,
  children,
  ...rest
}: Readonly<BottomSheetBodyProps>) {
  return (
    <div className={clsx(BOTTOM_SHEET_BODY_CLASS, className)} {...rest}>
      {children}
    </div>
  )
}

export default BottomSheetBody
