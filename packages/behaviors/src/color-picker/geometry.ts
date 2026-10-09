import { clamp } from '../internal/math.js'

import type { ColorPickerDirection, ColorPoint, RectLike } from './types.js'

/**
 * Converts a pointer position into a point inside a surface — fractions in `[0, 1]`, `x` measured
 * from the inline-start edge (the right edge in `'rtl'`). A pointer dragged past an edge is clamped,
 * so a drag that leaves the surface keeps tracking along its border.
 *
 * @param clientX - Pointer x, in viewport pixels.
 * @param clientY - Pointer y, in viewport pixels.
 * @param rect - The surface's box (`getBoundingClientRect()`).
 * @param dir - Text direction; defaults to `'ltr'`.
 * @returns The logical point.
 * @throws RangeError when the surface has no size, or a coordinate is not finite — the point
 *   would be meaningless, and a `NaN` channel would only fail later, far from its cause.
 */
export function pointFromRect(
  clientX: number,
  clientY: number,
  rect: RectLike,
  dir: ColorPickerDirection = 'ltr'
): ColorPoint {
  if (!Number.isFinite(clientX) || !Number.isFinite(clientY)) {
    throw new RangeError('Cannot locate a pointer at a non-finite position')
  }
  if (!(rect.width > 0) || !(rect.height > 0)) {
    throw new RangeError('Cannot locate a pointer on a surface with no size')
  }
  const x = clamp((clientX - rect.left) / rect.width, 0, 1)
  const y = clamp((clientY - rect.top) / rect.height, 0, 1)
  return { x: dir === 'rtl' ? 1 - x : x, y }
}

/**
 * The part of an element `resolveDirection` reads — structural, so the package stays DOM-free.
 */
export interface DirectionSource {
  /** `Element.matches`. */
  matches: (selector: string) => boolean
  /** `Element.closest`. */
  closest: (
    selector: string
  ) => { getAttribute: (name: string) => string | null } | null
}

/**
 * The text direction an element is laid out in: `:dir(rtl)` when the engine supports it (it
 * follows the inherited `dir`), else the closest `dir` attribute. Adapters call it at mount and
 * whenever a `dir` attribute changes, then hand the result to the service.
 *
 * @param element - The picker's root element.
 * @returns `'rtl'` or `'ltr'`.
 */
export function resolveDirection(
  element: DirectionSource
): ColorPickerDirection {
  try {
    return element.matches(':dir(rtl)') ? 'rtl' : 'ltr'
  } catch {
    // An engine without `:dir()` throws a SyntaxError: fall back to the attribute.
    return element.closest('[dir]')?.getAttribute('dir') === 'rtl'
      ? 'rtl'
      : 'ltr'
  }
}
