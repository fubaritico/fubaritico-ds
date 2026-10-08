import { createContext, use } from 'react'

import type { BottomSheetVariant } from '@fubaritico-ds/variants'

export type { BottomSheetVariant } from '@fubaritico-ds/variants'

/** Value shared by {@link BottomSheet} with its regions. */
export interface BottomSheetContextValue {
  /** Colour scheme, so the header can pick the matching close-button variant. */
  variant: BottomSheetVariant
  /** Closes the sheet — wired to the header's close button. */
  onClose: () => void
}

export const BottomSheetContext = createContext<BottomSheetContextValue | null>(null)

/**
 * Reads the BottomSheet context, guarding the composition contract.
 *
 * `BottomSheet.Header` and `BottomSheet.Body` are regions of a sheet, meaningless on their own, so a missing
 * provider is a programming error: the hook THROWS rather than degrading silently.
 *
 * @returns The surrounding BottomSheet's context value.
 * @throws If called outside a `<BottomSheet>`.
 */
export function useBottomSheetContext(): BottomSheetContextValue {
  const context = use(BottomSheetContext)
  if (!context) throw new Error('BottomSheet.* must be used within <BottomSheet>')

  return context
}
