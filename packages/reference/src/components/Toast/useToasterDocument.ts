import { useEffect } from 'react'

import type { ReactToaster } from './Toast.types'

/**
 * Hands every key press of the page to the machine, for its hotkey (F8 moves focus into the
 * stack). One document listener per Toaster — one Toaster per page.
 *
 * @param toaster - The toaster.
 */
export function useToasterHotkey(toaster: ReactToaster): void {
  // Listens on the document, wherever focus is; removed when the Toaster unmounts.
  useEffect(() => {
    const onKeydown = (event: KeyboardEvent) => {
      toaster.handleKeydown(event)
    }
    document.addEventListener('keydown', onKeydown)
    return () => {
      document.removeEventListener('keydown', onKeydown)
    }
  }, [toaster])
}

/**
 * Holds the timers while the page is hidden — another tab, a minimised window: nobody reads it
 * (WCAG 2.2.1).
 *
 * @param toaster - The toaster.
 */
export function usePageVisibilityPause(toaster: ReactToaster): void {
  // Follows `visibilitychange` from mount; releases its reason on unmount.
  useEffect(() => {
    const sync = () => {
      if (document.hidden) toaster.pause('document')
      else toaster.resume('document')
    }
    sync()
    document.addEventListener('visibilitychange', sync)
    return () => {
      document.removeEventListener('visibilitychange', sync)
      toaster.resume('document')
    }
  }, [toaster])
}
