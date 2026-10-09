import { describeColor } from './describe.js'
import { KEY_STEP } from './keyboard.js'

import type { DomAttributes } from '../common/types.js'
import type { HsvaColor } from './color/types.js'
import type {
  ColorAreaAxis,
  ColorPickerLabels,
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
  /** `true` in the automatic state. */
  isAuto: boolean
  /** Words for the current value (or the automatic description). */
  description: string
  /** Whether every change is blocked. */
  disabled: boolean
  /** Whether the alpha channel is edited. */
  alpha: boolean
  /** Whether the automatic state is allowed. */
  nullable: boolean
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
  // In the automatic state the thumb still shows the last colour: say that no colour is selected.
  const auto = ctx.isAuto ? `, ${ctx.labels.automaticDescription}` : ''
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
    id: `${ctx.uid}-hex`,
    type: 'text',
    value: ctx.hexDraft,
    'aria-label': ctx.labels.hex,
    // An empty field reads as "missing"; in the automatic state it says why it is empty.
    placeholder: ctx.isAuto ? ctx.labels.automatic : undefined,
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
 * Attributes of the "automatic" toggle button. Its name stays constant; `aria-pressed` carries the
 * state.
 *
 * @param ctx - The service state.
 * @returns DOM attributes.
 */
export function autoToggleAttrs(ctx: AttrsContext): DomAttributes {
  return {
    type: 'button',
    'aria-label': ctx.labels.automatic,
    'aria-pressed': String(ctx.isAuto),
    disabled: flag(ctx.disabled || !ctx.nullable),
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
