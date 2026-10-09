/**
 * A colour in the HSV model, plus alpha — the colour picker's source of truth.
 *
 * HSV maps one-to-one onto the picker's controls (the 2D area is saturation × value, the slider is
 * hue), and it keeps a hue even where RGB has none (greys, black, white).
 */
export interface HsvaColor {
  /** Hue in degrees, `[0, 360)`. */
  h: number
  /** Saturation in percent, `[0, 100]`. */
  s: number
  /** Value (brightness) in percent, `[0, 100]`. */
  v: number
  /** Alpha (opacity), `[0, 1]`. */
  a: number
}

/** A colour in the RGB model, plus alpha. */
export interface RgbaColor {
  /** Red channel, `[0, 255]`. */
  r: number
  /** Green channel, `[0, 255]`. */
  g: number
  /** Blue channel, `[0, 255]`. */
  b: number
  /** Alpha (opacity), `[0, 1]`. */
  a: number
}

/** A colour in the HSL model, plus alpha. */
export interface HslaColor {
  /** Hue in degrees, `[0, 360)`. */
  h: number
  /** Saturation in percent, `[0, 100]`. */
  s: number
  /** Lightness in percent, `[0, 100]`. */
  l: number
  /** Alpha (opacity), `[0, 1]`. */
  a: number
}
