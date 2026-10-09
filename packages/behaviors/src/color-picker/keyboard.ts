import type { KeyboardLike } from '../common/types.js'
import type { HsvaColor } from './color/types.js'
import type { ColorPickerDirection, ColorPickerTarget } from './types.js'

/** A change to apply, in the channels it touches. */
export type ChannelPatch = Partial<HsvaColor>

/** One keyboard step per surface (area in %, hue in degrees, alpha as a fraction). */
export const KEY_STEP: Readonly<Record<ColorPickerTarget, number>> = {
  area: 1,
  hue: 1,
  alpha: 0.01,
}

/** How many steps Shift and PageUp / PageDown move. */
export const BIG_STEP_FACTOR = 10

/** Upper bound of each track's channel (the area's channels are percentages). */
const TRACK_MAX = { hue: 360, alpha: 1 } as const

/**
 * `+1` when the inline axis grows to the right, `-1` in rtl.
 *
 * @param dir - Text direction.
 * @returns The sign of "rightwards".
 */
function inlineSign(dir: ColorPickerDirection): 1 | -1 {
  return dir === 'rtl' ? -1 : 1
}

/**
 * The channel change a key makes on the 2D area: arrows move saturation (inline axis, mirrored in
 * rtl) and brightness (block axis); PageUp / PageDown move brightness by 10 steps; Home / End jump
 * saturation to its ends. Shift multiplies an arrow step by 10. Values snap to whole percents.
 *
 * @param event - The key event.
 * @param color - The working colour.
 * @param dir - Text direction.
 * @returns The patch, or `null` when the key is not handled.
 */
export function areaKeyChange(
  event: KeyboardLike,
  color: HsvaColor,
  dir: ColorPickerDirection
): ChannelPatch | null {
  const step = KEY_STEP.area * (event.shiftKey ? BIG_STEP_FACTOR : 1)
  const big = KEY_STEP.area * BIG_STEP_FACTOR
  const s = Math.round(color.s)
  const v = Math.round(color.v)
  const right = step * inlineSign(dir)

  const changes = new Map<string, ChannelPatch>([
    ['ArrowRight', { s: s + right }],
    ['ArrowLeft', { s: s - right }],
    ['ArrowUp', { v: v + step }],
    ['ArrowDown', { v: v - step }],
    ['PageUp', { v: v + big }],
    ['PageDown', { v: v - big }],
    ['Home', { s: 0 }],
    ['End', { s: 100 }],
  ])
  // A Map, not an object literal: `'toString' in {}` is true, a Map has no inherited keys.
  return changes.get(event.key) ?? null
}

/**
 * The channel change a key makes on the hue or alpha track: arrows step (Right / Up forward,
 * mirrored in rtl for the horizontal keys), PageUp / PageDown step by 10, Home / End jump to the
 * ends, Shift multiplies an arrow step by 10. The current value snaps to the step grid first, so a
 * dragged 45.37° steps to 46°, not 46.37°.
 *
 * @param target - `'hue'` or `'alpha'`.
 * @param event - The key event.
 * @param color - The working colour.
 * @param dir - Text direction.
 * @returns The patch, or `null` when the key is not handled.
 */
export function trackKeyChange(
  target: 'hue' | 'alpha',
  event: KeyboardLike,
  color: HsvaColor,
  dir: ColorPickerDirection
): ChannelPatch | null {
  const channel = target === 'hue' ? 'h' : 'a'
  const unit = KEY_STEP[target]
  const step = unit * (event.shiftKey ? BIG_STEP_FACTOR : 1)
  const big = unit * BIG_STEP_FACTOR
  const current = Math.round(color[channel] / unit) * unit
  const right = step * inlineSign(dir)

  const values = new Map<string, number>([
    ['ArrowRight', current + right],
    ['ArrowLeft', current - right],
    ['ArrowUp', current + step],
    ['ArrowDown', current - step],
    ['PageUp', current + big],
    ['PageDown', current - big],
    ['Home', 0],
    ['End', TRACK_MAX[target]],
  ])
  const value = values.get(event.key)
  return value === undefined ? null : { [channel]: value }
}
