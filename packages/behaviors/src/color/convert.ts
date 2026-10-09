import { clamp } from '../internal/math.js'

import type { HslaColor, HsvaColor, RgbaColor } from './types.js'

/** Matches a 3, 4, 6 or 8 digit hex colour, with or without a leading `#`. */
const HEX_PATTERN = /^#?([\da-f]{3,4}|[\da-f]{6}|[\da-f]{8})$/i

/** Upper bound of an 8-bit RGB / alpha channel. */
const CHANNEL_MAX = 255

/** Upper bound of a percentage component (saturation, value, lightness). */
const PERCENT = 100

/** Degrees in a full turn of the hue wheel. */
const HUE_TURN = 360

/**
 * Brings any angle into `[0, 360)` — so `-30` becomes `330` and `360` becomes `0`.
 *
 * @param degrees - An angle in degrees.
 * @returns The equivalent hue in `[0, 360)`.
 */
export function normalizeHue(degrees: number): number {
  return ((degrees % HUE_TURN) + HUE_TURN) % HUE_TURN
}

/**
 * Converts HSVA to RGBA. Channels are left unrounded; round at the output edge.
 *
 * @param color - The HSVA colour.
 * @returns The same colour in RGBA.
 */
export function hsvaToRgba({ h, s, v, a }: HsvaColor): RgbaColor {
  const sat = s / PERCENT
  const val = v / PERCENT
  // Standard HSV → RGB: the wheel has six 60° sectors; each channel is the value minus a
  // hue-dependent share of the chroma (`n` offsets the sector per channel: 5 = red, 3 = green, 1 = blue).
  const channel = (n: number): number => {
    const k = (n + normalizeHue(h) / 60) % 6
    return CHANNEL_MAX * (val - val * sat * Math.max(0, Math.min(k, 4 - k, 1)))
  }
  return { r: channel(5), g: channel(3), b: channel(1), a }
}

/**
 * Converts RGBA to HSVA.
 *
 * Lossy by nature: an achromatic colour (any grey, black, white) has no hue, so it comes back with
 * `h = 0` and `s = 0` — whatever hue it was picked from is gone. Never round-trip the picker's
 * state through this; keep HSVA as the source of truth.
 *
 * @param color - The RGBA colour.
 * @returns The same colour in HSVA, unrounded.
 */
export function rgbaToHsva({ r, g, b, a }: RgbaColor): HsvaColor {
  const max = Math.max(r, g, b)
  const delta = max - Math.min(r, g, b)

  let hue = 0
  if (delta !== 0) {
    if (max === r) hue = (g - b) / delta
    else if (max === g) hue = 2 + (b - r) / delta
    else hue = 4 + (r - g) / delta
  }

  return {
    h: normalizeHue(hue * 60),
    s: max === 0 ? 0 : (delta / max) * PERCENT,
    v: (max / CHANNEL_MAX) * PERCENT,
    a,
  }
}

/**
 * Converts HSVA to HSLA. The hue carries over, normalised to `[0, 360)`.
 *
 * @param color - The HSVA colour.
 * @returns The same colour in HSLA, unrounded.
 */
export function hsvaToHsla({ h, s, v, a }: HsvaColor): HslaColor {
  const sat = s / PERCENT
  const val = v / PERCENT
  const light = val * (1 - sat / 2)
  const hslSat =
    light === 0 || light === 1 ? 0 : (val - light) / Math.min(light, 1 - light)
  return { h: normalizeHue(h), s: hslSat * PERCENT, l: light * PERCENT, a }
}

/**
 * Converts HSLA to HSVA. The hue carries over, normalised to `[0, 360)`.
 *
 * @param color - The HSLA colour.
 * @returns The same colour in HSVA, unrounded.
 */
export function hslaToHsva({ h, s, l, a }: HslaColor): HsvaColor {
  const light = l / PERCENT
  const val = light + (s / PERCENT) * Math.min(light, 1 - light)
  return {
    h: normalizeHue(h),
    s: val === 0 ? 0 : 2 * (1 - light / val) * PERCENT,
    v: val * PERCENT,
    a,
  }
}

/**
 * Formats a number in `[0, 255]` as a two-digit hex pair.
 *
 * @param channel - The channel value; rounded and clamped first.
 * @returns A lowercase two-digit hex string.
 * @throws RangeError when `channel` is `NaN` or infinite — a corrupted colour must surface, not
 *   print as `#NaN…`.
 */
function toHexPair(channel: number): string {
  if (!Number.isFinite(channel)) {
    throw new RangeError(
      `Cannot format a non-finite colour channel: ${String(channel)}`
    )
  }
  return Math.round(clamp(channel, 0, CHANNEL_MAX))
    .toString(16)
    .padStart(2, '0')
}

/**
 * Formats RGBA as a lowercase hex string — `#rrggbb` when opaque, `#rrggbbaa` otherwise.
 *
 * Opacity is decided on the rounded alpha byte, so an alpha that rounds to `ff` (e.g. `0.999`)
 * yields the canonical 6-digit form.
 *
 * @param color - The RGBA colour.
 * @returns The hex representation.
 * @throws RangeError when a channel or the alpha is `NaN` or infinite.
 */
export function rgbaToHex({ r, g, b, a }: RgbaColor): string {
  // Guard before clamping: `clamp` would otherwise fold an infinite alpha into a valid 0 or 1.
  if (!Number.isFinite(a)) {
    throw new RangeError(`Cannot format a non-finite alpha: ${String(a)}`)
  }
  const alpha = toHexPair(clamp(a, 0, 1) * CHANNEL_MAX)
  return `#${toHexPair(r)}${toHexPair(g)}${toHexPair(b)}${alpha === 'ff' ? '' : alpha}`
}

/**
 * Parses a hex colour (`#rgb`, `#rgba`, `#rrggbb`, `#rrggbbaa`, `#` optional, case-insensitive).
 *
 * @param hex - The candidate string; surrounding whitespace is ignored.
 * @returns The RGBA colour, or `null` when the string is not a valid hex colour.
 */
export function hexToRgba(hex: string): RgbaColor | null {
  const match = HEX_PATTERN.exec(hex.trim())
  if (!match) return null

  const digits = match[1]
  // Expand the short forms: `abc` → `aabbcc`.
  const full = digits.length <= 4 ? digits.replace(/./g, '$&$&') : digits
  const pair = (index: number): number =>
    Number.parseInt(full.slice(index, index + 2), 16)

  return {
    r: pair(0),
    g: pair(2),
    b: pair(4),
    a: full.length === 8 ? pair(6) / CHANNEL_MAX : 1,
  }
}

/**
 * Formats HSVA as a hex string. Shorthand for `rgbaToHex(hsvaToRgba(color))`.
 *
 * @param color - The HSVA colour.
 * @returns The hex representation.
 * @throws RangeError when a component is `NaN` or infinite.
 */
export function hsvaToHex(color: HsvaColor): string {
  return rgbaToHex(hsvaToRgba(color))
}
