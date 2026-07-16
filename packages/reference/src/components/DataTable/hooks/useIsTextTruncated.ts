import { useEffect, useRef, useState } from 'react'

/**
 * Detects whether a text element is visually truncated (its content overflows its box) so the caller
 * can, for example, only show a tooltip when the text is actually cut off.
 *
 * Attach the returned `elementRef` to the element whose overflow should be watched; `isTruncated`
 * recomputes on mount, whenever `text` changes, and on window resize.
 *
 * @template Element - The HTML element type the ref is attached to.
 * @param text - The text content; passed so the check re-runs when the content changes.
 * @returns An object with the `elementRef` to attach and the current `isTruncated` flag.
 */
export function useIsTextTruncated<Element extends HTMLElement>(text?: string) {
  const elementRef = useRef<Element>(null)
  const [isTruncated, setIsTruncated] = useState(false)

  useEffect(() => {
    const element = elementRef.current
    if (!element) return

    const checkTruncation = () => {
      setIsTruncated(element.scrollWidth > element.clientWidth)
    }

    checkTruncation()
    // Observe the element itself rather than adding a per-instance window 'resize' listener — at scale
    // (one hook per visible truncatable cell) that would register dozens of global listeners.
    const observer = new ResizeObserver(checkTruncation)
    observer.observe(element)

    return () => {
      observer.disconnect()
    }
  }, [text])

  return { elementRef, isTruncated }
}

export default useIsTextTruncated
