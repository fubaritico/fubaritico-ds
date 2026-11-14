import { describeColor } from './describe.js'
import { KEY_STEP } from './keyboard.js'

import type { DomAttributes } from '../common/types.js'
import type { HsvaColor } from './color/types.js'
import type {
  ColorAreaAxis,
  ColorPickerLabels,
  ColorPickerMode,
  ColorPickerTarget,
} from './types.js'

/** Length of the longest hex the field accepts: `#rrggbbaa`. */
const HEX_MAX_LENGTH = 9

/** Upper bound of the area's channels and of the alpha slider, both shown as percentages. */
const PERCENT_MAX = 100

/** Upper bound of the hue slider, in degrees. */
const HUE_MAX = 360

/** Everything the attribute builders read — a plain view of the service's state. */
export interface AttrsContext {
  /** Id namespace. */
  uid: string
  /** Accessible labels. */
  labels: ColorPickerLabels
  /** The working colour (where the thumbs sit). */
  color: HsvaColor
  /** The kind of value: a colour, automatic, or no colour. */
  mode: ColorPickerMode
  /** Words for the current value (or the automatic / "no colour" description). */
  description: string
  /** Whether every change is blocked. */
  disabled: boolean
  /** Whether the alpha channel is edited. */
  alpha: boolean
  /** Whether the automatic state is allowed. */
  nullable: boolean
  /** Whether the "no colour" state is allowed. */
  allowNone: boolean
  /** The surface being dragged. */
  dragging: ColorPickerTarget | null
  /** The hex field's text. */
  hexDraft: string
  /** Whether the last hex commit was invalid. */
  hexInvalid: boolean
}

/**
 * Rounds to one decimal, for attribute values (the state itself stays unrounded).
 *
 * @param value - Any number.
 * @returns The rounded number.
 */
const round1 = (value: number): number => Math.round(value * 10) / 10

/**
 * `''` (attribute on) or `undefined` (omitted) — presence semantics.
 *
 * @param on - Whether the boolean attribute is set.
 * @returns The attribute value.
 */
const flag = (on: boolean): string | undefined => (on ? '' : undefined)

/**
 * Id of the hex field's error message.
 *
 * @param uid - Id namespace.
 * @returns The DOM id.
 */
export const hexErrorId = (uid: string): string => `${uid}-hex-error`

/**
 * Id of the hex field.
 *
 * @param uid - Id namespace.
 * @returns The DOM id.
 */
export const hexInputId = (uid: string): string => `${uid}-hex`

/**
 * What a state that is not a colour says next to a thumb that still shows the last colour.
 *
 * @param ctx - The service state.
 * @returns `', <description>'` in the automatic or "no colour" mode, else `''`.
 */
function notAColourSuffix(ctx: AttrsContext): string {
  if (ctx.mode === 'auto') return `, ${ctx.labels.automaticDescription}`
  if (ctx.mode === 'none') return `, ${ctx.labels.noneDescription}`
  return ''
}

/**
 * Whether the picker offers a mode.
 *
 * @param ctx - The service state.
 * @param mode - The mode.
 * @returns `true` for `'color'`, for `'auto'` when nullable, for `'none'` with `allowNone`.
 */
export function isModeAvailable(
  ctx: Pick<AttrsContext, 'nullable' | 'allowNone'>,
  mode: ColorPickerMode
): boolean {
  if (mode === 'auto') return ctx.nullable
  if (mode === 'none') return ctx.allowNone
  return true
}

/**
 * Attributes of the 2D area's container.
 *
 * @param ctx - The service state.
 * @returns DOM attributes.
 */
export function areaAttrs(ctx: AttrsContext): DomAttributes {
  return {
    role: 'group',
    'aria-label': ctx.labels.area,
    // ARIA 1.2 deprecates aria-disabled as a global attribute but keeps it on `group`.
    'aria-disabled': ctx.disabled ? 'true' : undefined,
    'data-dragging': flag(ctx.dragging === 'area'),
  }
}

/**
 * Attributes of one of the area's two visually hidden range inputs. There is no WAI-ARIA 2D slider
 * pattern: each axis is a native range (role, value and assistive-technology adjustments for free)
 * with a localisable role description. Only the saturation input is tabbable — its keydown drives
 * both axes — so BOTH inputs announce both coordinates: an ArrowUp changes the brightness while the
 * focus stays on the saturation input.
 *
 * @param ctx - The service state.
 * @param axis - `'saturation'` (inline axis) or `'brightness'` (block axis).
 * @returns DOM attributes.
 */
export function areaInputAttrs(
  ctx: AttrsContext,
  axis: ColorAreaAxis
): DomAttributes {
  const { s, v } = ctx.color
  const { labels } = ctx
  const coordinates = `${labels.saturation} ${String(Math.round(s))}%, ${labels.brightness} ${String(Math.round(v))}%`
  return {
    id: `${ctx.uid}-area-${axis}`,
    type: 'range',
    min: 0,
    max: PERCENT_MAX,
    step: KEY_STEP.area,
    value: String(round1(axis === 'saturation' ? s : v)),
    'aria-label': axis === 'saturation' ? labels.saturation : labels.brightness,
    'aria-roledescription': labels.areaRoleDescription,
    'aria-orientation': axis === 'saturation' ? 'horizontal' : 'vertical',
    'aria-valuetext': `${coordinates}, ${ctx.description}`,
    tabindex: axis === 'saturation' ? 0 : -1,
    disabled: flag(ctx.disabled),
  }
}

/**
 * Attributes of the hue or alpha range input. Alpha is exposed as a percentage, which reads better
 * than a fraction. Without the alpha channel the alpha input is disabled — adapters should not
 * render it at all (`snapshot.alpha === false`).
 *
 * @param ctx - The service state.
 * @param target - `'hue'` or `'alpha'`.
 * @returns DOM attributes.
 */
export function trackInputAttrs(
  ctx: AttrsContext,
  target: 'hue' | 'alpha'
): DomAttributes {
  const { h, a } = ctx.color
  const common = {
    id: `${ctx.uid}-${target}`,
    type: 'range',
    min: 0,
    step: 1,
    disabled: flag(ctx.disabled || (target === 'alpha' && !ctx.alpha)),
  }
  // Out of the colour mode the thumb still shows the last colour: say what the value really is.
  const auto = notAColourSuffix(ctx)
  if (target === 'hue') {
    const hueWords = describeColor({ h, s: 100, v: 100, a: 1 }).replace(
      /^vivid /,
      ''
    )
    return {
      ...common,
      max: HUE_MAX,
      value: String(round1(h)),
      'aria-label': ctx.labels.hue,
      'aria-valuetext': `${String(Math.round(h))}°, ${hueWords}${auto}`,
    }
  }
  return {
    ...common,
    max: PERCENT_MAX,
    value: String(round1(a * PERCENT_MAX)),
    'aria-label': ctx.labels.alpha,
    'aria-valuetext': `${String(Math.round(a * PERCENT_MAX))}%${auto}`,
  }
}

/**
 * Attributes of the hex text field. When the last commit was invalid it points at the error
 * message (`hexErrorAttrs`) — `aria-describedby`, the reference with reliable support.
 *
 * @param ctx - The service state.
 * @returns DOM attributes.
 */
export function hexInputAttrs(ctx: AttrsContext): DomAttributes {
  return {
    id: hexInputId(ctx.uid),
    type: 'text',
    value: ctx.hexDraft,
    'aria-label': ctx.labels.hex,
    // An empty field reads as "missing"; out of the colour mode it says why it is empty.
    placeholder: hexPlaceholder(ctx),
    'aria-invalid': ctx.hexInvalid ? 'true' : undefined,
    'aria-describedby': ctx.hexInvalid ? hexErrorId(ctx.uid) : undefined,
    autocomplete: 'off',
    autocapitalize: 'off',
    spellcheck: 'false',
    maxlength: HEX_MAX_LENGTH,
    disabled: flag(ctx.disabled),
  }
}

/**
 * Attributes of the hex error message, to render (with `labels.hexInvalid` as text) only while
 * `snapshot.hexInvalid` — `role="alert"` announces it as it appears.
 *
 * @param ctx - The service state.
 * @returns DOM attributes.
 */
export function hexErrorAttrs(ctx: AttrsContext): DomAttributes {
  return { id: hexErrorId(ctx.uid), role: 'alert' }
}

/**
 * The hex field's placeholder: the name of the mode that left it empty.
 *
 * @param ctx - The service state.
 * @returns The automatic or "no colour" label, or `undefined` in the colour mode.
 */
function hexPlaceholder(ctx: AttrsContext): string | undefined {
  if (ctx.mode === 'auto') return ctx.labels.automatic
  if (ctx.mode === 'none') return ctx.labels.none
  return undefined
}

/**
 * Attributes of the mode group: a named radio group (colour, automatic, no colour). Its options are
 * native radio inputs (`modeOptionAttrs`), so the arrow keys move AND select, natively.
 *
 * @param ctx - The service state.
 * @returns DOM attributes.
 */
export function modeGroupAttrs(ctx: AttrsContext): DomAttributes {
  return {
    role: 'radiogroup',
    'aria-label': ctx.labels.mode,
    // ARIA 1.2 keeps aria-disabled on `radiogroup`.
    'aria-disabled': ctx.disabled ? 'true' : undefined,
  }
}

/**
 * Attributes of one option of the mode group — a native `<input type="radio">`, named by the label
 * element wrapping it. `checked` is a DOM PROPERTY: bind it as one (React: the `checked` prop).
 *
 * @param ctx - The service state.
 * @param mode - The option's mode.
 * @returns DOM attributes.
 */
export function modeOptionAttrs(
  ctx: AttrsContext,
  mode: ColorPickerMode
): DomAttributes {
  return {
    id: `${ctx.uid}-mode-${mode}`,
    type: 'radio',
    name: `${ctx.uid}-mode`,
    value: mode,
    checked: flag(ctx.mode === mode),
    disabled: flag(ctx.disabled || !isModeAvailable(ctx, mode)),
  }
}

/**
 * Attributes of the picker's root: a named group, so several pickers on one page are told apart.
 *
 * @param ctx - The service state.
 * @returns DOM attributes.
 */
export function pickerAttrs(ctx: AttrsContext): DomAttributes {
  return { role: 'group', 'aria-label': ctx.labels.picker }
}

/**
 * Attributes of a swatch showing the current value.
 *
 * @param ctx - The service state.
 * @returns DOM attributes.
 */
export function swatchAttrs(ctx: AttrsContext): DomAttributes {
  return { role: 'img', 'aria-label': ctx.description }
}

/**
 * Attributes of the polite live region that renders `snapshot.announcement`.
 *
 * @returns DOM attributes.
 */
export function statusAttrs(): DomAttributes {
  return { role: 'status', 'aria-live': 'polite', 'aria-atomic': 'true' }
}
