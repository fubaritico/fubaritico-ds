import { hsvaToHsla, normalizeHue } from './color/convert.js'

import type { HsvaColor } from './color/types.js'

/** Upper bounds (exclusive, in degrees) of each named hue band, red wrapping round at 345°. */
const HUE_NAMES: readonly [number, string][] = [
  [15, 'red'],
  [45, 'orange'],
  [70, 'yellow'],
  [160, 'green'],
  [200, 'cyan'],
  [260, 'blue'],
  [290, 'purple'],
  [345, 'pink'],
  [360, 'red'],
]

/**
 * Names the hue of an angle.
 *
 * @param hue - Hue in degrees, any range.
 * @returns The English hue name.
 * @throws RangeError when `hue` is `NaN` or infinite.
 */
export function hueName(hue: number): string {
  const h = normalizeHue(hue)
  const band = HUE_NAMES.find(([limit]) => h < limit)
  // Only a non-finite hue escapes every band: a corrupted colour must surface, not read as "red".
  if (band === undefined)
    throw new RangeError(`Cannot name a non-finite hue: ${String(hue)}`)
  return band[1]
}

/** HSL lightness at or below which a colour reads as black. */
const BLACK_MAX_L = 4
/** HSL lightness at or above which a colour reads as white. */
const WHITE_MIN_L = 97
/** HSL saturation below which a colour reads as a gray. */
const ACHROMATIC_MAX_S = 8
/** Gray lightness below which it is "dark", above which "light". */
const GRAY_DARK_MAX_L = 30
const GRAY_LIGHT_MIN_L = 75
/** Lightness bands of a chromatic colour: very dark < 20 ≤ dark < 40 … 65 < light ≤ 85 < very light. */
const VERY_DARK_MAX_L = 20
const DARK_MAX_L = 40
const LIGHT_MIN_L = 65
const VERY_LIGHT_MIN_L = 85
/** HSL saturation below which a colour is "grayish", above which (mid lightness) "vivid". */
const GRAYISH_MAX_S = 30
const VIVID_MIN_S = 90

/**
 * Lightness qualifier of a chromatic colour.
 *
 * @param l - HSL lightness, `[0, 100]`.
 * @returns A prefix such as `'dark '`, or `''`.
 */
function lightnessWord(l: number): string {
  if (l < VERY_DARK_MAX_L) return 'very dark '
  if (l < DARK_MAX_L) return 'dark '
  if (l > VERY_LIGHT_MIN_L) return 'very light '
  if (l > LIGHT_MIN_L) return 'light '
  return ''
}

/**
 * Saturation qualifier of a chromatic colour.
 *
 * @param s - HSL saturation, `[0, 100]`.
 * @param l - HSL lightness, `[0, 100]` — "vivid" only applies away from the light / dark ends.
 * @returns A prefix such as `'grayish '`, or `''`.
 */
function saturationWord(s: number, l: number): string {
  if (s < GRAYISH_MAX_S) return 'grayish '
  if (s > VIVID_MIN_S && l >= DARK_MAX_L && l <= LIGHT_MIN_L) return 'vivid '
  return ''
}

/**
 * Names an achromatic colour, or returns `null` when the colour has a perceivable hue.
 *
 * @param s - HSL saturation, `[0, 100]`.
 * @param l - HSL lightness, `[0, 100]`.
 * @returns `'black'`, `'white'`, a gray, or `null`.
 */
function achromaticName(s: number, l: number): string | null {
  if (l <= BLACK_MAX_L) return 'black'
  if (l >= WHITE_MIN_L) return 'white'
  if (s >= ACHROMATIC_MAX_S) return null
  if (l < GRAY_DARK_MAX_L) return 'dark gray'
  if (l > GRAY_LIGHT_MIN_L) return 'light gray'
  return 'gray'
}

/**
 * English colour description for assistive technology — "dark red", "light grayish blue",
 * "white" — after the approach WAI-ARIA authors recommend over raw coordinates (react-aria's
 * "accessible colour descriptions"). Translucency is appended ("…, 50% opacity").
 *
 * @param color - The colour to describe.
 * @returns A short phrase.
 * @throws RangeError when the hue is `NaN` or infinite (from `hueName`).
 */
export function describeColor(color: HsvaColor): string {
  const { h, s, l } = hsvaToHsla(color)
  const words =
    achromaticName(s, l) ??
    `${lightnessWord(l)}${saturationWord(s, l)}${hueName(h)}`
  return color.a < 1
    ? `${words}, ${String(Math.round(color.a * 100))}% opacity`
    : words
}
