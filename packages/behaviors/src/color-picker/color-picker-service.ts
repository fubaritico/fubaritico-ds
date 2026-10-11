import { clamp } from '../internal/math.js'
import { Store } from '../internal/store.js'

import * as attrs from './attrs.js'
import {
  hexToRgba,
  hsvaToHex,
  hsvaToHsla,
  hsvaToRgba,
  rgbaToHsva,
} from './color/convert.js'
import { describeColor as defaultDescribeColor } from './describe.js'
import { areaKeyChange, trackKeyChange } from './keyboard.js'

import type { AttrsContext } from './attrs.js'
import type { HslaColor, HsvaColor, RgbaColor } from './color/types.js'
import type { ChannelPatch } from './keyboard.js'
import type {
  ColorAreaAxis,
  ColorPickerLabels,
  ColorPickerOptions,
  ColorPickerSnapshot,
  ColorPickerTarget,
  ColorPoint,
  ColorValue,
} from './types.js'
import type { DomAttributes, KeyboardLike } from '../common/types.js'

/**
 * A value's hex, for comparing values the way the field shows them; `null` stays `null`.
 *
 * @param value - A colour, `null` (automatic) or `undefined` (uncontrolled).
 * @returns Its hex, or the `null` / `undefined` itself.
 */
function hexOf(value: ColorValue | undefined): string | null | undefined {
  return value === null || value === undefined ? value : hsvaToHex(value)
}

/** The hex forms previewed while typing: the complete long ones only (6 or 8 digits). */
const LIVE_HEX_PATTERN = /^#?(?:[\da-f]{6}|[\da-f]{8})$/i

/** Default accessible labels. */
const DEFAULT_LABELS: ColorPickerLabels = {
  area: 'Color',
  saturation: 'Saturation',
  brightness: 'Brightness',
  hue: 'Hue',
  alpha: 'Opacity',
  hex: 'Hex color',
  automatic: 'Automatic',
  automaticDescription: 'Automatic, no color selected',
  areaRoleDescription: '2D slider',
  picker: 'Color picker',
  hexInvalid: 'Enter a hex color such as #1976d2',
}

/** Percentage denominator — alpha is a fraction in the state, a percentage on its slider. */
const PERCENT = 100

/** Where the thumbs start when nothing else is known: pure red. */
const DEFAULT_PLACEHOLDER: HsvaColor = { h: 0, s: 100, v: 100, a: 1 }

/** Options with every default resolved. */
type ResolvedOptions = Omit<
  Required<ColorPickerOptions>,
  | 'value'
  | 'defaultValue'
  | 'onChange'
  | 'onChangeComplete'
  | 'onWarn'
  | 'labels'
> &
  Pick<
    ColorPickerOptions,
    'value' | 'onChange' | 'onChangeComplete' | 'onWarn'
  > & {
    labels: ColorPickerLabels
  }

/**
 * Two values are the same colour — exactly, channel by channel (a hue change on a gray IS a change:
 * the hue slider moved).
 *
 * @param a - First value.
 * @param b - Second value.
 * @returns Whether they are equal.
 */
function sameValue(a: ColorValue, b: ColorValue): boolean {
  if (a === null || b === null) return a === b
  return a.h === b.h && a.s === b.s && a.v === b.v && a.a === b.a
}

/**
 * Colour picker behaviour as a framework-agnostic service: the HSVA source of truth, the
 * "automatic" state, pointer drags on the 2D area and the hue / alpha tracks, keyboard steps, the
 * hex field's draft, and the ARIA attributes of every control. Adapters render and measure; they
 * never convert a colour or compute an attribute.
 *
 * **HSVA is the source of truth, never hex**: converting back from RGB loses the hue of every gray
 * (and the saturation of black), so a picker that re-derives its state from hex jumps to red as
 * soon as the saturation reaches 0. The working colour keeps hue and saturation through those
 * states, and through the automatic state.
 */
export class ColorPickerService extends Store<ColorPickerSnapshot> {
  private opts: ResolvedOptions
  /** `true` while the parent drives `value`. */
  private controlled: boolean

  /** Where the thumbs sit. */
  private working: HsvaColor
  /** `true` in the automatic state (uncontrolled; controlled reads `opts.value`). */
  private auto: boolean

  private dragging: ColorPickerTarget | null = null
  /**
   * The value before the current run of unsettled changes (a drag, a slider being dragged) — what
   * `settle` compares against and `cancelDrag` restores. `undefined` when nothing is pending.
   */
  private baseline: ColorValue | undefined = undefined
  /** The working colour when the drag started — restored by `cancelDrag`, even from "automatic". */
  private dragStartWorking: HsvaColor | null = null

  /** The hex field's text while the user edits it; `null` when it simply mirrors the value. */
  private draft: string | null = null
  private hexInvalid = false
  /** Whether the value currently shown is a live preview of the hex draft, not yet settled. */
  private previewing = false
  /** The working colour before the hex preview began — restored on abandon, even from "automatic". */
  private hexStartWorking: HsvaColor | null = null
  /** Hex of the previewed colour, to tell a parent echoing the preview from one overriding it. */
  private previewedHex: string | null = null
  /** The previewed colour itself — what a controlled settle reports before the parent echoed it. */
  private previewedValue: HsvaColor | null = null
  /** The description at the last settled change, for the live region. */
  private announcement = ''

  /**
   * @param options - Initial options; `uid` is required.
   */
  constructor(options: ColorPickerOptions) {
    super()
    this.opts = this.resolve(options)
    this.controlled = options.value !== undefined

    const initial = this.controlled
      ? (options.value ?? null)
      : (options.defaultValue ?? null)
    const accepted =
      initial === null && !this.opts.nullable ? this.opts.placeholder : initial
    this.auto = accepted === null
    this.working = this.normalize(accepted ?? this.opts.placeholder)
    this.warnOnNullWithoutNullable()
  }

  // ---------- reading ----------

  /**
   * Builds the snapshot.
   *
   * @returns The immutable snapshot.
   */
  protected createSnapshot(): ColorPickerSnapshot {
    const value = this.currentValue()
    const hex = value === null ? null : hsvaToHex(value)
    return {
      value,
      color: this.working,
      isAuto: value === null,
      hex,
      hueHex: hsvaToHex({ h: this.working.h, s: 100, v: 100, a: 1 }),
      opaqueHex: hsvaToHex({ ...this.working, a: 1 }),
      dragging: this.dragging,
      hexDraft: this.draft ?? hex ?? '',
      hexInvalid: this.hexInvalid,
      announcement: this.announcement,
      alpha: this.opts.alpha,
      nullable: this.opts.nullable,
      disabled: this.opts.disabled,
      dir: this.opts.dir,
    }
  }

  /**
   * The resolved accessible labels — for visible text an adapter renders (the automatic toggle's
   * caption, a hex error), so it never reads text back out of an ARIA attribute.
   *
   * @returns The labels, defaults filled in.
   */
  getLabels(): ColorPickerLabels {
    return this.opts.labels
  }

  /**
   * The current value in RGBA — for display. `null` in the automatic state.
   *
   * @returns The RGBA colour, unrounded.
   */
  getRgba(): RgbaColor | null {
    const value = this.currentValue()
    return value === null ? null : hsvaToRgba(value)
  }

  /**
   * The current value in HSLA — for display. `null` in the automatic state.
   *
   * @returns The HSLA colour, unrounded.
   */
  getHsla(): HslaColor | null {
    const value = this.currentValue()
    return value === null ? null : hsvaToHsla(value)
  }

  /**
   * Words for the current value ("dark red"), or the automatic label.
   *
   * @returns The description.
   */
  describe(): string {
    const value = this.currentValue()
    return this.describeValue(value)
  }

  /**
   * Where a surface's thumb sits, as fractions — `x` from inline-start, `y` from the top — ready for
   * logical CSS insets. The hue and alpha tracks only use `x`.
   *
   * @param target - The surface.
   * @returns The thumb position.
   */
  thumbPosition(target: ColorPickerTarget): ColorPoint {
    const { h, s, v, a } = this.working
    if (target === 'area') return { x: s / 100, y: 1 - v / 100 }
    if (target === 'hue') return { x: h / 360, y: 0.5 }
    return { x: a, y: 0.5 }
  }

  // ---------- options ----------

  /**
   * Applies changed props. Notifies only when the snapshot actually changes. A controlled value
   * equal (as a colour) to the working one keeps the working hue and saturation — so a parent that
   * stores hex and passes back `h: 0` for a gray does not make the hue thumb jump.
   *
   * @param patch - The options to change. `'value' in patch` distinguishes an absent prop from one
   *   passed as `undefined`.
   */
  setOptions(patch: Partial<ColorPickerOptions>): void {
    const before = this.getState()
    // Compared by VALUE: an adapter passes a fresh `labels` object on every render, and notifying
    // on identity would re-render, re-sync and notify again — forever.
    const forced =
      (patch.uid !== undefined && patch.uid !== this.opts.uid) ||
      (patch.dir !== undefined && patch.dir !== this.opts.dir) ||
      (patch.labels !== undefined &&
        JSON.stringify({ ...DEFAULT_LABELS, ...patch.labels }) !==
          JSON.stringify(this.opts.labels))
    const previousValue = this.opts.value
    const resolved = this.resolve({ ...this.opts, ...patch })
    if (!resolved.alpha && this.opts.alpha)
      this.working = { ...this.working, a: 1 }
    this.opts = resolved

    if ('value' in patch) {
      this.controlled = patch.value !== undefined
      // A parent that CHANGED its value to something else than the preview has overridden it: the
      // preview has nothing left to settle or to undo. A re-render carrying the same value as before
      // is not an override — a parent updating on `onChangeComplete` only does exactly that.
      if (
        this.previewing &&
        patch.value !== undefined &&
        hexOf(patch.value) !== hexOf(previousValue) &&
        hexOf(patch.value) !== this.previewedHex
      )
        this.dropPreview()
      if (patch.value !== undefined && patch.value !== null)
        this.adoptExternal(patch.value)
    }
    // Disabled mid-edit: the preview the consumer already received becomes the settled value.
    if (this.opts.disabled && this.previewing) this.endPreview()
    this.warnOnNullWithoutNullable()

    this.commitIfChanged(
      before,
      (b, a) =>
        forced ||
        !sameValue(b.value, a.value) ||
        b.color !== a.color ||
        b.alpha !== a.alpha ||
        b.nullable !== a.nullable ||
        b.disabled !== a.disabled ||
        b.hexDraft !== a.hexDraft
    )
  }

  // ---------- changes ----------

  /**
   * Sets the value programmatically. A settled change: `onChange` and `onChangeComplete` both fire.
   *
   * @param value - A colour, or `null` for automatic (nullable pickers only).
   * @returns `false` when blocked (disabled, or `null` on a non-nullable picker).
   */
  setColor(value: ColorValue): boolean {
    if (value === null) return this.setAuto()
    return this.applyValue(this.normalize(value), true)
  }

  /**
   * Changes one channel — what a native range input or a numeric field reports. Leaves the
   * automatic state, starting from the working colour.
   *
   * @param channel - `'h'` (degrees), `'s'` / `'v'` (%), or `'a'` (fraction).
   * @param value - The new channel value; clamped to its range.
   * @returns `false` when blocked.
   */
  setChannel(
    channel: keyof HsvaColor,
    value: number,
    { complete = true }: { complete?: boolean } = {}
  ): boolean {
    if (!Number.isFinite(value)) {
      this.opts.onWarn?.(
        `[color-picker:${this.opts.uid}] ignored a non-finite ${channel}`
      )
      return false
    }
    return this.applyValue(this.withChannels({ [channel]: value }), complete)
  }

  /**
   * Settles a run of `complete: false` changes — what a slider reports when the pointer or key is
   * released: `onChangeComplete` fires once, if the run changed the value.
   */
  settle(): void {
    this.settlePending({ alwaysCommit: false })
  }

  /**
   * Switches to the automatic state (`null`). The working colour is kept, so leaving "automatic"
   * returns to the colour the user had.
   *
   * @returns `false` when the picker is not nullable, or disabled.
   */
  setAuto(): boolean {
    if (!this.opts.nullable) {
      this.opts.onWarn?.(
        `[color-picker:${this.opts.uid}] setAuto on a picker that is not nullable`
      )
      return false
    }
    return this.applyValue(null, true)
  }

  /**
   * The automatic toggle's action: enters the automatic state, or leaves it back to the last colour
   * (whose hue was kept).
   *
   * @returns `false` when blocked.
   */
  toggleAuto(): boolean {
    return this.currentValue() === null
      ? this.setColor(this.working)
      : this.setAuto()
  }

  /**
   * A track's native input reported a value, in the TRACK's scale (hue in degrees, alpha in
   * percent — what `trackInputAttrs` exposes). The service converts; adapters never do.
   *
   * @param target - `'hue'` or `'alpha'`.
   * @param raw - The input's value.
   * @param options - Change options.
   * @param options.complete - Settled change; `false` while a slider is being dragged.
   * @returns `false` when blocked or unchanged.
   */
  setTrackValue(
    target: 'hue' | 'alpha',
    raw: number,
    { complete = true }: { complete?: boolean } = {}
  ): boolean {
    if (this.isTargetBlocked(target)) return false
    return target === 'hue'
      ? this.setChannel('h', raw, { complete })
      : this.setChannel('a', raw / PERCENT, { complete })
  }

  /**
   * One of the area's range inputs reported a value (an assistive technology adjusted it directly,
   * without a keydown): a settled change of that axis, in percent.
   *
   * @param axis - `'saturation'` or `'brightness'`.
   * @param raw - The input's value, `[0, 100]`.
   * @returns `false` when blocked or unchanged.
   */
  setAreaAxis(axis: ColorAreaAxis, raw: number): boolean {
    if (this.opts.disabled) return false
    return this.setChannel(axis === 'saturation' ? 's' : 'v', raw)
  }

  // ---------- pointer ----------

  /**
   * Starts a drag on a surface and applies the pointer's position at once.
   *
   * @param target - The surface pressed.
   * @param point - The pointer position (see `pointFromRect`).
   * @returns `false` when disabled, or the target is the alpha track of a picker without alpha.
   */
  startDrag(target: ColorPickerTarget, point: ColorPoint): boolean {
    if (this.isTargetBlocked(target) || !this.isFinitePoint(point)) return false
    this.batch(() => {
      // A pending hex preview is settled first: the drag starts from it, and cancels back to it.
      if (this.previewing) {
        this.draft = null
        this.hexInvalid = false
        this.endPreview()
      }
      this.dragging = target
      this.baseline = this.currentValue()
      this.dragStartWorking = this.working
      this.applyValue(this.colorAt(target, point), false)
      this.commit()
    })
    return true
  }

  /**
   * Follows the pointer during a drag: `onChange` fires on each move that changes the colour.
   *
   * @param point - The pointer position.
   */
  moveDrag(point: ColorPoint): void {
    if (this.dragging === null || !this.isFinitePoint(point)) return
    this.applyValue(this.colorAt(this.dragging, point), false)
  }

  /** Ends the drag: `onChangeComplete` fires once, if the drag changed the value. */
  endDrag(): void {
    if (this.dragging === null) return
    this.dragging = null
    this.dragStartWorking = null
    this.settlePending({ alwaysCommit: true })
  }

  /** Cancels the drag (Escape, pointer cancel): the value returns to where the drag started. */
  cancelDrag(): void {
    if (this.dragging === null) return
    const start = this.baseline ?? null
    const startWorking = this.dragStartWorking
    this.batch(() => {
      this.dragging = null
      this.dragStartWorking = null
      this.applyValue(start, false)
      this.baseline = undefined
      // From "automatic" the value returns to null — the thumbs must return too.
      if (!this.controlled && startWorking !== null) this.working = startWorking
      this.commit()
    })
  }

  // ---------- keyboard ----------

  /**
   * Keyboard model of a surface. Area: arrows move saturation (inline axis, mirrored in rtl) and
   * brightness (block axis); Home / End jump saturation to its ends; PageUp / PageDown move
   * brightness by 10. Hue / alpha tracks: arrows step, PageUp / PageDown step by 10, Home / End jump
   * to the ends. Shift multiplies a step by 10. Each key is a settled change.
   *
   * @param target - The surface focused.
   * @param event - The keyboard event (or anything with `key`).
   * @returns `true` when the key was consumed (`preventDefault` already called).
   */
  handleKeydown(target: ColorPickerTarget, event: KeyboardLike): boolean {
    // Alt / Ctrl / Cmd + key belong to the browser and assistive technology.
    if (event.altKey || event.ctrlKey || event.metaKey) return false
    if (this.isTargetBlocked(target)) return false

    // Escape during a drag on this surface puts the colour back.
    if (event.key === 'Escape') {
      if (this.dragging !== target) return false
      event.preventDefault?.()
      this.cancelDrag()
      return true
    }

    const { dir } = this.opts
    const patch =
      target === 'area'
        ? areaKeyChange(event, this.working, dir)
        : trackKeyChange(target, event, this.working, dir)
    if (patch === null) return false

    event.preventDefault?.()
    this.applyValue(this.withChannels(patch), true)
    return true
  }

  // ---------- hex field ----------

  /**
   * Records what the user types in the hex field. The text is never reformatted under the cursor.
   *
   * A COMPLETE long form (6 or 8 digits) is previewed live, as an unsettled change — `onChange`
   * fires, `onChangeComplete` waits for the commit, exactly as during a drag. The short forms (3 or
   * 4 digits) are not previewed: `#abc` is usually on its way to `#abcdef`, a different colour.
   *
   * @param text - The field's content.
   */
  setHexDraft(text: string): void {
    this.batch(() => {
      this.hexInvalid = false
      const parsed =
        !this.opts.disabled && LIVE_HEX_PATTERN.test(text.trim())
          ? this.hexToValue(text)
          : null
      // Typing back the colour the edit started from restores it EXACTLY, not its hex-rounded twin
      // (a gray would lose its hue): the edit then nets out to no change at all.
      const start = this.previewing ? this.baseline : undefined
      const next =
        parsed !== null &&
        start !== undefined &&
        start !== null &&
        hsvaToHex(start) === hsvaToHex(parsed)
          ? start
          : parsed
      if (next !== null && !this.matchesCurrentHex(next)) {
        // The first preview of the edit remembers where the edit started.
        const startWorking = this.previewing
          ? this.hexStartWorking
          : this.working
        // `applyValue` clears the draft and the preview flag: both are set back below.
        if (this.applyValue(next, false)) {
          this.previewing = true
          this.hexStartWorking = startWorking
          this.previewedHex = hsvaToHex(next)
          this.previewedValue = next
        }
      }
      this.draft = text
      this.commit()
    })
  }

  /**
   * Applies the draft (Enter, blur). A gray or black typed in keeps the current hue (and the
   * saturation, for black): the hue slider does not jump. Without alpha, a typed alpha is dropped.
   * A colour already previewed is settled (`onChangeComplete`), not applied a second time.
   *
   * @param options - Commit options.
   * @param options.revertOnInvalid - Discard an invalid draft (blur) — and its preview — instead of
   *   flagging it (Enter).
   * @returns `true` when the draft was a valid colour and was applied.
   */
  commitHexDraft({
    revertOnInvalid = false,
  }: { revertOnInvalid?: boolean } = {}): boolean {
    if (this.draft === null) return true
    const next = this.opts.disabled ? null : this.hexToValue(this.draft)

    if (next === null) {
      if (revertOnInvalid || this.opts.disabled) this.abandonHexEdit()
      else {
        this.hexInvalid = true
        this.commit()
      }
      return false
    }

    this.draft = null
    this.hexInvalid = false
    // Hex rounds every channel: re-typing the current colour must not nudge the thumbs.
    if (this.matchesCurrentHex(next)) {
      if (this.previewing) this.endPreview()
      else this.commit()
    } else if (!this.applyValue(next, true)) this.commit()
    return true
  }

  /**
   * Keyboard model of the hex field: Enter commits the draft (keeping an invalid one, flagged, for
   * correction), Escape abandons it.
   *
   * @param event - The key event.
   * @returns `true` when the key was consumed.
   */
  handleHexKeydown(event: KeyboardLike): boolean {
    if (event.key === 'Enter') {
      event.preventDefault?.()
      this.commitHexDraft()
      return true
    }
    if (
      event.key === 'Escape' &&
      (this.draft !== null || this.hexInvalid || this.previewing)
    ) {
      // Consumed: a surrounding popover or dialog must not close on the same key.
      event.preventDefault?.()
      this.cancelHexDraft()
      return true
    }
    return false
  }

  /**
   * Abandons the draft (Escape): the field shows the current hex again, and a previewed colour
   * returns to the one from before the typing.
   */
  cancelHexDraft(): void {
    if (this.draft === null && !this.hexInvalid && !this.previewing) return
    this.abandonHexEdit()
  }

  // ---------- a11y attributes ----------
  // Pure builders in `attrs.ts`; the service only hands them a view of its state.

  /**
   * Attributes of the 2D area's container.
   *
   * @returns DOM attributes.
   */
  areaAttrs(): DomAttributes {
    return attrs.areaAttrs(this.attrsContext())
  }

  /**
   * Attributes of one of the area's two visually hidden range inputs (see `attrs.areaInputAttrs`).
   *
   * @param axis - `'saturation'` (inline axis) or `'brightness'` (block axis).
   * @returns DOM attributes.
   */
  areaInputAttrs(axis: ColorAreaAxis): DomAttributes {
    return attrs.areaInputAttrs(this.attrsContext(), axis)
  }

  /**
   * Attributes of the hue or alpha range input (see `attrs.trackInputAttrs`).
   *
   * @param target - `'hue'` or `'alpha'`.
   * @returns DOM attributes.
   */
  trackInputAttrs(target: 'hue' | 'alpha'): DomAttributes {
    return attrs.trackInputAttrs(this.attrsContext(), target)
  }

  /**
   * Attributes of the hex text field.
   *
   * @returns DOM attributes.
   */
  hexInputAttrs(): DomAttributes {
    return attrs.hexInputAttrs(this.attrsContext())
  }

  /**
   * Attributes of the hex error message — render it, with `hexErrorText()`, while
   * `snapshot.hexInvalid`.
   *
   * @returns DOM attributes.
   */
  hexErrorAttrs(): DomAttributes {
    return attrs.hexErrorAttrs(this.attrsContext())
  }

  /**
   * Text of the hex error message.
   *
   * @returns The localisable message.
   */
  hexErrorText(): string {
    return this.opts.labels.hexInvalid
  }

  /**
   * Attributes of the "automatic" toggle button.
   *
   * @returns DOM attributes.
   */
  autoToggleAttrs(): DomAttributes {
    return attrs.autoToggleAttrs(this.attrsContext())
  }

  /**
   * Attributes of the picker's root: a named group, so several pickers on a page are told apart.
   *
   * @returns DOM attributes.
   */
  pickerAttrs(): DomAttributes {
    return attrs.pickerAttrs(this.attrsContext())
  }

  /**
   * Attributes of a swatch showing the current value.
   *
   * @returns DOM attributes.
   */
  swatchAttrs(): DomAttributes {
    return attrs.swatchAttrs(this.attrsContext())
  }

  /**
   * Attributes of the polite live region rendering `snapshot.announcement`.
   *
   * @returns DOM attributes.
   */
  statusAttrs(): DomAttributes {
    return attrs.statusAttrs()
  }

  /** Drops every subscriber. The instance stays usable (a development double-mount reuses it). */
  destroy(): void {
    this.clearStore()
  }

  // ---------- internals ----------

  /**
   * Parses hex text into the value it would set. RGB carries no hue for grays and no saturation for
   * black, so those keep the working ones.
   *
   * @param text - Hex text, with or without `#`, short or long form.
   * @returns The value, or `null` when the text is not a hex colour.
   */
  private hexToValue(text: string): HsvaColor | null {
    const rgba = hexToRgba(text)
    if (rgba === null) return null
    const parsed = rgbaToHsva(rgba)
    const keepHue = parsed.s === 0 || parsed.v === 0
    // During a preview, `working` is the previous preview: the hue to keep is the edit's start.
    const reference =
      this.previewing && this.hexStartWorking !== null
        ? this.hexStartWorking
        : this.working
    return this.normalize({
      ...parsed,
      h: keepHue ? reference.h : parsed.h,
      s: parsed.v === 0 ? reference.s : parsed.s,
    })
  }

  /**
   * Whether a colour reads as the current value once written in hex (hex rounds every channel).
   *
   * @param next - The candidate colour.
   * @returns `true` when both format to the same hex.
   */
  private matchesCurrentHex(next: HsvaColor): boolean {
    const current = this.currentValue()
    return current !== null && hsvaToHex(next) === hsvaToHex(current)
  }

  /** Forgets a preview without touching the value (the parent decided otherwise). */
  private dropPreview(): void {
    this.previewing = false
    this.hexStartWorking = null
    this.previewedHex = null
    this.previewedValue = null
    this.baseline = undefined
    this.draft = null
    this.hexInvalid = false
  }

  /**
   * Settles a previewed colour: announced and reported once, through `onChangeComplete`. In
   * controlled mode the parent may not have echoed the preview yet, so the preview itself — not
   * the prop — is what gets compared and reported.
   */
  private endPreview(): void {
    const previewed = this.previewedValue
    this.previewedHex = null
    this.previewedValue = null
    if (!this.controlled || previewed === null) {
      this.settlePending({ alwaysCommit: true })
      return
    }
    const baseline = this.baseline
    this.baseline = undefined
    this.previewing = false
    this.hexStartWorking = null
    const changed = baseline === undefined || !sameValue(baseline, previewed)
    if (changed) this.announcement = this.describeValue(previewed)
    this.commit()
    if (changed) this.opts.onChangeComplete?.(previewed)
  }

  /**
   * Drops the draft and, when a colour was previewed, returns to the value and the thumbs from
   * before the typing (`onChange` fires; nothing was settled, so `onChangeComplete` does not).
   */
  private abandonHexEdit(): void {
    const wasPreviewing = this.previewing && this.baseline !== undefined
    const start = this.baseline ?? null
    const startWorking = this.hexStartWorking
    this.batch(() => {
      if (wasPreviewing) {
        this.applyValue(start, false)
        this.baseline = undefined
        // The preview was never announced; going back is, so a screen reader hears the colour
        // return as clearly as a sighted user sees it.
        this.announcement = this.describeValue(start)
        if (!this.controlled && startWorking !== null)
          this.working = startWorking
      }
      this.previewing = false
      this.hexStartWorking = null
      this.draft = null
      this.hexInvalid = false
      this.commit()
    })
  }

  /**
   * Closes a run of unsettled changes: announces and reports the value once, if it moved.
   *
   * @param options - Settle options.
   * @param options.alwaysCommit - Notify even when the value did not change (another field, such
   *   as `dragging`, did).
   */
  private settlePending({ alwaysCommit }: { alwaysCommit: boolean }): void {
    const baseline = this.baseline
    this.baseline = undefined
    // Whatever was pending — a preview included — is settled now: there is nothing to go back to.
    this.previewing = false
    this.hexStartWorking = null
    const value = this.currentValue()
    const changed = baseline !== undefined && !sameValue(baseline, value)
    if (changed) this.announcement = this.describeValue(value)
    if (changed || alwaysCommit) this.commit()
    if (changed) this.opts.onChangeComplete?.(value)
  }

  /**
   * Whether a surface refuses input: the whole picker is disabled, or it is the alpha track of a
   * picker without alpha.
   *
   * @param target - The surface.
   * @returns `true` when input must be ignored.
   */
  private isTargetBlocked(target: ColorPickerTarget): boolean {
    return this.opts.disabled || (target === 'alpha' && !this.opts.alpha)
  }

  /**
   * Guards the pointer entry points: a `NaN` point would only fail later, in a hex conversion far
   * from its cause.
   *
   * @param point - The pointer position.
   * @returns `false` (with a warning) when a coordinate is not finite.
   */
  private isFinitePoint(point: ColorPoint): boolean {
    if (Number.isFinite(point.x) && Number.isFinite(point.y)) return true
    this.opts.onWarn?.(
      `[color-picker:${this.opts.uid}] ignored a non-finite pointer position`
    )
    return false
  }

  /**
   * Words for a value: the colour's description, or the automatic one.
   *
   * @param value - A value.
   * @returns The description.
   */
  private describeValue(value: ColorValue): string {
    return value === null
      ? this.opts.labels.automaticDescription
      : this.opts.describeColor(value)
  }

  /**
   * The plain view of the state the attribute builders read.
   *
   * @returns The context.
   */
  private attrsContext(): AttrsContext {
    const state = this.getState()
    return {
      uid: this.opts.uid,
      labels: this.opts.labels,
      color: state.color,
      isAuto: state.isAuto,
      description: this.describeValue(state.value),
      disabled: this.opts.disabled,
      alpha: this.opts.alpha,
      nullable: this.opts.nullable,
      dragging: this.dragging,
      hexDraft: state.hexDraft,
      hexInvalid: this.hexInvalid,
    }
  }

  /** Reports a controlled `null` on a picker that is not nullable — it shows "automatic" anyway. */
  private warnOnNullWithoutNullable(): void {
    if (this.controlled && this.opts.value === null && !this.opts.nullable) {
      this.opts.onWarn?.(
        `[color-picker:${this.opts.uid}] value is null but the picker is not nullable`
      )
    }
  }

  /**
   * Resolves defaults.
   *
   * @param options - Raw options.
   * @returns Options with every default filled in.
   */
  private resolve(options: ColorPickerOptions): ResolvedOptions {
    return {
      uid: options.uid,
      value: options.value,
      nullable: options.nullable ?? false,
      alpha: options.alpha ?? false,
      disabled: options.disabled ?? false,
      dir: options.dir ?? 'ltr',
      placeholder: options.placeholder ?? DEFAULT_PLACEHOLDER,
      labels: { ...DEFAULT_LABELS, ...options.labels },
      describeColor: options.describeColor ?? defaultDescribeColor,
      onChange: options.onChange,
      onChangeComplete: options.onChangeComplete,
      onWarn: options.onWarn,
    }
  }

  /**
   * The value the consumer sees.
   *
   * @returns The controlled value, else the working colour (or `null` when automatic).
   */
  private currentValue(): ColorValue {
    if (this.controlled) {
      const value = this.opts.value ?? null
      return value === null ? null : this.normalize(value)
    }
    return this.auto ? null : this.working
  }

  /**
   * Clamps every channel into range; forces alpha to 1 when the alpha channel is off.
   *
   * @param color - Any colour.
   * @returns The colour, in range.
   */
  private normalize(color: HsvaColor): HsvaColor {
    return {
      h: clamp(color.h, 0, 360),
      s: clamp(color.s, 0, 100),
      v: clamp(color.v, 0, 100),
      a: this.opts.alpha ? clamp(color.a, 0, 1) : 1,
    }
  }

  /**
   * The working colour with some channels replaced, normalised.
   *
   * @param patch - The channels to replace.
   * @returns The new colour.
   */
  private withChannels(patch: ChannelPatch): HsvaColor {
    return this.normalize({ ...this.working, ...patch })
  }

  /**
   * The colour under the pointer on a surface: the area sets saturation (x) and brightness (y,
   * top = 100%), the tracks set hue or alpha (x); everything else is kept.
   *
   * @param target - The surface.
   * @param point - The pointer position.
   * @returns The new colour.
   */
  private colorAt(target: ColorPickerTarget, point: ColorPoint): HsvaColor {
    const x = clamp(point.x, 0, 1)
    if (target === 'area') {
      return this.withChannels({
        s: x * 100,
        v: (1 - clamp(point.y, 0, 1)) * 100,
      })
    }
    if (target === 'hue') return this.withChannels({ h: x * 360 })
    return this.withChannels({ a: x })
  }

  /**
   * A controlled value arrived. When it is the same colour as the working one (the parent echoing
   * back, possibly through hex), keep the working hue / saturation; otherwise adopt it.
   *
   * @param value - The incoming colour.
   */
  private adoptExternal(value: HsvaColor): void {
    const incoming = this.normalize(value)
    if (hsvaToHex(incoming) !== hsvaToHex(this.working)) this.working = incoming
  }

  /**
   * Applies a new value. Uncontrolled: the state changes. Controlled: only the intent is emitted —
   * the parent decides. `onChange` fires when the value changes; `onChangeComplete` too when
   * `complete`.
   *
   * @param next - The new value, already normalised.
   * @param complete - Whether this change is settled.
   * @returns `false` when blocked (disabled) or unchanged.
   */
  private applyValue(next: ColorValue, complete: boolean): boolean {
    if (this.opts.disabled) return false
    const previous = this.currentValue()
    if (sameValue(previous, next)) return false

    if (!this.controlled) {
      this.auto = next === null
      if (next !== null) this.working = next
    }
    this.draft = null
    this.hexInvalid = false
    this.previewing = false
    this.hexStartWorking = null
    if (complete) {
      this.announcement = this.describeValue(next)
      this.baseline = undefined
    } else if (this.baseline === undefined) {
      // First change of an unsettled run: remember where it started.
      this.baseline = previous
    }

    this.commit()
    this.opts.onChange?.(next)
    if (complete) this.opts.onChangeComplete?.(next)
    return true
  }
}

/**
 * Creates a ColorPickerService.
 *
 * @param options - Initial options; `uid` is required.
 * @returns A new service instance.
 */
export function createColorPickerService(
  options: ColorPickerOptions
): ColorPickerService {
  return new ColorPickerService(options)
}
