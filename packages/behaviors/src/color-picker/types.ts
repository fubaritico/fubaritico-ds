import type { Direction } from '../common/types.js'
import type { HsvaColor } from './color/types.js'

/**
 * The picker's value: a colour, or `null` for "automatic / no colour" — a first-class state with its
 * own UI and accessible text (only reachable when the picker is `nullable`).
 */
export type ColorValue = HsvaColor | null

/** The surfaces a pointer can drag on. */
export type ColorPickerTarget = 'area' | 'hue' | 'alpha'

/** The two axes of the 2D area: saturation along the inline axis, brightness along the block axis. */
export type ColorAreaAxis = 'saturation' | 'brightness'

/** Text direction — mirrors the horizontal axes in `'rtl'` (alias of the shared `Direction`). */
export type ColorPickerDirection = Direction

/**
 * A position inside a surface, as fractions in `[0, 1]`: `x` from the inline-start edge, `y` from
 * the top. Build it with `pointFromRect`, which also handles the text direction.
 */
export interface ColorPoint {
  /** Fraction along the inline axis, from inline-start. */
  x: number
  /** Fraction along the block axis, from the top. */
  y: number
}

/** The geometry `pointFromRect` needs — what `getBoundingClientRect()` returns. */
export interface RectLike {
  /** Left edge, in viewport pixels. */
  left: number
  /** Top edge, in viewport pixels. */
  top: number
  /** Width, in pixels. */
  width: number
  /** Height, in pixels. */
  height: number
}

/** Accessible labels. English defaults; pass your own to localise. */
export interface ColorPickerLabels {
  /** The 2D area as a whole. */
  area: string
  /** The area's inline axis. */
  saturation: string
  /** The area's block axis. */
  brightness: string
  /** The hue slider. */
  hue: string
  /** The alpha slider. */
  alpha: string
  /** The hex field. */
  hex: string
  /** The "automatic / no colour" toggle's name. */
  automatic: string
  /** How the automatic state is announced (swatch, sliders, live region). */
  automaticDescription: string
  /** Role description of the area's inputs — there is no native "2D slider" role. */
  areaRoleDescription: string
  /** Error text shown when the hex draft is not a colour. */
  hexInvalid: string
  /** The picker as a whole (its root group). */
  picker: string
}

/**
 * Turns a colour into words for assistive technology ("dark red"), as WAI-ARIA recommends over raw
 * coordinates. Injected so a consumer can localise it.
 */
export type DescribeColor = (color: HsvaColor) => string

/** Options of a ColorPickerService. Every one may be changed later through `setOptions`. */
export interface ColorPickerOptions {
  /** Namespace of the generated ids. Inject a value unique per instance. */
  uid: string
  /**
   * Controlled value. The **presence** of the key means controlled; `null` = controlled
   * "automatic". Absent or `undefined` = uncontrolled.
   */
  value?: ColorValue
  /** Initial value when uncontrolled. */
  defaultValue?: ColorValue
  /** Whether the "automatic / no colour" state (`null`) is allowed; defaults to `false`. */
  nullable?: boolean
  /** Whether the alpha channel is edited; defaults to `false` (alpha forced to `1`). */
  alpha?: boolean
  /** Blocks every change; defaults to `false`. */
  disabled?: boolean
  /** Text direction; defaults to `'ltr'`. */
  dir?: ColorPickerDirection
  /**
   * Where the thumbs sit while the value is `null` and no colour was ever chosen. Defaults to pure
   * red (`h 0, s 100, v 100`), the conventional starting point of a picker.
   */
  placeholder?: HsvaColor
  /** Accessible labels; missing ones fall back to the English defaults. */
  labels?: Partial<ColorPickerLabels>
  /** Colour-to-words function for `aria-valuetext`; defaults to an English describer. */
  describeColor?: DescribeColor
  /** Called on every change — continuously while dragging. */
  onChange?: (value: ColorValue) => void
  /** Called once a change is settled: pointer released, key pressed, hex committed. */
  onChangeComplete?: (value: ColorValue) => void
  /** Called on a non-fatal misuse (e.g. `setAuto` on a non-nullable picker). Silent when absent. */
  onWarn?: (message: string) => void
}

/** Immutable snapshot of a ColorPickerService. A new reference per change, and only then. */
export interface ColorPickerSnapshot {
  /** The value the consumer sees — `null` in the automatic state. */
  value: ColorValue
  /**
   * The working colour: where the thumbs sit. Equal to `value` except in the automatic state, where
   * it keeps the last colour so the hue survives a round trip through "automatic".
   */
  color: HsvaColor
  /** `true` in the automatic state. */
  isAuto: boolean
  /** Hex of `value` (`#rrggbb`, or `#rrggbbaa` when translucent), `null` when automatic. */
  hex: string | null
  /** The pure hue (`s 100, v 100`) as hex — the 2D area's background colour. */
  hueHex: string
  /** The working colour at full opacity, as hex — the end colour of the alpha track. */
  opaqueHex: string
  /** The surface being dragged, or `null`. */
  dragging: ColorPickerTarget | null
  /** The hex field's text: the current hex, or what the user is typing. */
  hexDraft: string
  /** `true` after a commit of a draft that is not a valid hex colour. */
  hexInvalid: boolean
  /**
   * Text for a polite live region: the description at the last SETTLED change (release, key,
   * hex commit, automatic toggle) — never during a drag, so a screen reader is not flooded.
   * Empty until the first settled change.
   */
  announcement: string
  /** Whether the alpha channel is edited. */
  alpha: boolean
  /** Whether the automatic state is allowed. */
  nullable: boolean
  /** Whether every change is blocked. */
  disabled: boolean
  /** Text direction the pointer and arrow keys follow. */
  dir: ColorPickerDirection
}
