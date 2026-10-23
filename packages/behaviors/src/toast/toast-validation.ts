import { TOAST_POSITIONS, TOAST_VARIANTS } from './types.js'

import type { ToasterOptionsPatch } from './types.js'

// Run-time checks of what reaches a toaster. The shared toaster is called by bundles of other
// frameworks and by plain JavaScript, where the types do not hold: an input out of contract fails
// here, in the caller, with a message naming the field — never later, in a snapshot every bundle
// reads. Pure functions, no state.

/**
 * Checks a lifetime: a positive number of ms, or `Infinity`.
 *
 * @param value - The lifetime to check.
 * @param name - Where it comes from, for the message.
 * @returns The value, when valid.
 * @throws RangeError when it is not positive (`NaN`, `0`, a negative number).
 */
export function checkDuration(value: number, name: string): number {
  if (!(value > 0))
    throw new RangeError(
      `Toast: ${name} must be a positive number of milliseconds or Infinity, got ${String(value)}.`
    )
  return value
}

/** The string options: each must be a non-empty string when given. */
const STRING_OPTIONS = ['hotkey', 'label', 'closeLabel', 'renderer'] as const

/** The options fixed at creation, refused by `setOptions`. */
const FIXED_OPTIONS = ['uid', 'scheduler'] as const

/**
 * Whether a value is an object one can read fields from.
 *
 * @param value - Anything.
 * @returns `true` for a non-null object.
 */
function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

/**
 * Names a value's type for an error message.
 *
 * @param value - Anything.
 * @returns `'null'` or its `typeof`.
 */
export const typeName = (value: unknown): string =>
  value === null ? 'null' : typeof value

/**
 * Checks, at run time, the options present in an options object or a patch. The shared toaster is
 * configured by bundles of other frameworks and by plain JavaScript, where the types do not hold:
 * an option out of contract must fail in the caller, not in a later snapshot every bundle reads.
 *
 * @param options - Options or a patch.
 * @throws RangeError when `max`, `duration`, `leaveDuration` or `position` is out of range.
 * @throws TypeError when a string option is not a non-empty string.
 */
export function checkOptions(options: ToasterOptionsPatch): void {
  const { max, duration, leaveDuration } = options
  if (max !== undefined && (!Number.isInteger(max) || max < 1))
    throw new RangeError(
      `Toast: max must be a positive integer, got ${String(max)}.`
    )
  if (duration !== undefined) checkDuration(duration, 'the toaster duration')
  if (
    leaveDuration !== undefined &&
    (!Number.isFinite(leaveDuration) || leaveDuration < 0)
  )
    throw new RangeError(
      `Toast: leaveDuration must be zero or a positive number of milliseconds, got ${String(leaveDuration)}.`
    )
  const position: unknown = options.position
  if (position !== undefined && !TOAST_POSITIONS.some((p) => p === position))
    throw new RangeError(
      `Toast: position must be one of ${TOAST_POSITIONS.join(', ')}, got ${JSON.stringify(position)}.`
    )
  for (const name of STRING_OPTIONS) {
    const value: unknown = options[name]
    if (value !== undefined && (typeof value !== 'string' || value === ''))
      throw new TypeError(
        `Toast: ${name} must be a non-empty string, got ${typeName(value)}.`
      )
  }
}

/**
 * Checks a framework-neutral message: an object of string fields and a known variant.
 *
 * @param message - The `message` a caller passed.
 * @throws TypeError when it is not an object, a field is not a string, or the variant is unknown.
 */
function checkMessage(message: unknown): void {
  if (!isRecord(message))
    throw new TypeError(
      `Toast: message must be an object ({ title, description, icon, variant }), got ${typeName(message)}.`
    )
  for (const field of ['title', 'description', 'icon'] as const) {
    const value = message[field]
    if (value !== undefined && typeof value !== 'string')
      throw new TypeError(
        `Toast: message.${field} must be a string, got ${typeName(value)}.`
      )
  }
  const { variant } = message
  if (variant !== undefined && !TOAST_VARIANTS.some((v) => v === variant))
    throw new TypeError(
      `Toast: message.variant must be one of ${TOAST_VARIANTS.join(', ')}, got ${JSON.stringify(variant)}.`
    )
}

/**
 * Checks free content: an object naming its framework, one the stack can render.
 *
 * @param custom - The `custom` content a caller passed.
 * @param renderer - The framework the stack's adapter renders, when one is declared.
 * @throws TypeError when it is not an object or has no `kind`.
 * @throws Error when it belongs to a framework the stack cannot render.
 */
function checkCustom(custom: unknown, renderer: string | undefined): void {
  if (!isRecord(custom))
    throw new TypeError(
      `Toast: custom must be an object ({ kind, value }), got ${typeName(custom)}.`
    )
  const { kind } = custom
  if (typeof kind !== 'string' || kind === '')
    throw new TypeError(
      'Toast: a `custom` content needs its `kind` — the framework that renders it.'
    )
  if (renderer !== undefined && kind !== renderer)
    throw new Error(
      `Toast: this page's stack is rendered by ${renderer}, it cannot render ${kind} content. ` +
        `Send a \`message\` to share a toast across frameworks.`
    )
}

/**
 * Checks, at run time, what a caller asks to show — reached by plain JavaScript too, so a field out
 * of contract fails here, in the caller, not later in a class name or an icon lookup.
 *
 * @param input - The toast to show.
 * @param renderer - The framework the stack's adapter renders, when one is declared.
 * @throws TypeError when the input is out of contract (nothing to render, a malformed message or
 *   custom content).
 * @throws Error when the custom content belongs to a framework the stack cannot render.
 */
export function checkContent(
  input: unknown,
  renderer: string | undefined
): void {
  if (!isRecord(input))
    throw new TypeError(
      `Toast: show() takes an object ({ message, custom, … }), got ${typeName(input)}.`
    )
  const { message, custom } = input
  if (message === undefined && custom === undefined)
    throw new TypeError(
      'Toast: show() needs a `message` or a `custom` content — there is nothing to render.'
    )
  if (message !== undefined) checkMessage(message)
  if (custom !== undefined) checkCustom(custom, renderer)
}

/**
 * Refuses a patch that carries an option fixed at creation — even as `undefined`, which plain
 * JavaScript can pass where the types forbid it.
 *
 * @param patch - What `setOptions` received.
 * @throws TypeError when it holds `uid` or `scheduler`.
 */
export function checkFixedOptions(patch: object): void {
  for (const name of FIXED_OPTIONS)
    if (Object.prototype.hasOwnProperty.call(patch, name))
      throw new TypeError(
        `Toast: ${name} is fixed when the toaster is created; setOptions cannot change it.`
      )
}

/**
 * Refuses a second framework as the stack's renderer: one stack per page, one adapter renders it.
 *
 * @param current - The renderer already declared, if any.
 * @param next - The renderer a patch declares, if any.
 * @throws Error when both are set and differ.
 */
export function checkRendererConflict(
  current: string | undefined,
  next: string | undefined
): void {
  if (current === undefined || next === undefined || current === next) return
  throw new Error(
    `Toast: this page's stack is already rendered by ${current}; the ${next} ` +
      `adapter cannot render it too. Mount one Toaster per page.`
  )
}
