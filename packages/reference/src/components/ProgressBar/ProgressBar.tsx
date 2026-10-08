import clsx from 'clsx'

import {
  PROGRESS_BAR_INDICATOR_CLASS,
  PROGRESS_BAR_META_CLASS,
  PROGRESS_BAR_META_END_CLASS,
  PROGRESS_BAR_META_START_CLASS,
  PROGRESS_BAR_TRACK_CLASS,
  PROGRESS_BAR_VALUE_VAR,
  progressBarVariants,
} from '@fubaritico-ds/variants'

import type {
  ProgressBarSize,
  ProgressBarVariant,
} from '@fubaritico-ds/variants'
import type { CSSProperties, ComponentProps, ReactNode } from 'react'

export type {
  ProgressBarSize,
  ProgressBarVariant,
} from '@fubaritico-ds/variants'

/** Props of the {@link ProgressBar}. */
export interface ProgressBarProps
  extends Omit<ComponentProps<'div'>, 'aria-label' | 'aria-valuetext' | 'children'> {
  /** Current value. Clamped to `[0, max]`. */
  value: number
  /** Maximum value; defaults to `100`. A non-positive `max` renders an empty bar. */
  max?: number
  /** Colour intent of the indicator; defaults to `'default'` (neutral). */
  variant?: ProgressBarVariant
  /** Track thickness; defaults to `'md'`. */
  size?: ProgressBarSize
  /**
   * Human-readable rendering of the current value, mapped to `aria-valuetext`.
   *
   * Pass it whenever the raw number is not what the user sees — "step 3 of 7", "1.2 GB of 4 GB".
   * Without it, assistive technology announces the percentage derived from `value`/`max`.
   */
  valueText?: string
  /** Legend content rendered under the bar, at the inline-start edge. */
  metaStart?: ReactNode
  /** Legend content rendered under the bar, at the inline-end edge. */
  metaEnd?: ReactNode
  /**
   * Accessible name of the bar — **required**: `role="progressbar"` has no content to name itself
   * from, so an unnamed bar is announced as a bare "progress bar". When a visible label already
   * exists, also pass `aria-labelledby`; per ARIA it takes precedence over this value.
   */
  'aria-label': string
}

/** Percentage denominator — the fill is expressed as a 0–100% length for the skin. */
const PERCENT = 100

/**
 * ProgressBar — a determinate progress readout (presentational, no state of its own).
 *
 * `role="progressbar"` sits on the track and carries the value; the accessible name is **required**
 * at compile time (`aria-label` or `aria-labelledby`) because the role has no content to name
 * itself from. The optional `metaStart` / `metaEnd` slots render a legend line under the bar.
 *
 * The component computes only the fill fraction and hands it to the skin as the
 * `--ui-progress-bar-value` custom property: the skin owns the fill DIRECTION, so the bar is
 * RTL-correct without the component knowing about writing modes.
 *
 * Indeterminate and buffered (two-segment) modes are deliberately out of scope for now.
 *
 * @param props - {@link ProgressBarProps}.
 * @param props.value - Current value; clamped to `[0, max]`.
 * @param props.max - Maximum value; defaults to `100`.
 * @param props.variant - Colour intent; defaults to `'default'`.
 * @param props.size - Track thickness; defaults to `'md'`.
 * @param props.valueText - Human-readable value for `aria-valuetext`.
 * @param props.metaStart - Legend content at the inline-start edge.
 * @param props.metaEnd - Legend content at the inline-end edge.
 * @returns The rendered progress bar.
 */
export function ProgressBar({
  value,
  max = PERCENT,
  variant = 'default',
  size = 'md',
  valueText,
  metaStart,
  metaEnd,
  className,
  'aria-label': ariaLabel,
  'aria-labelledby': ariaLabelledBy,
  ...rest
}: Readonly<ProgressBarProps>) {
  // A non-positive `max` would divide by zero (or invert the ratio); treat the bar as empty rather
  // than emitting `NaN%`, which the browser drops and which reads as a full-width fill.
  const hasUsableRange = max > 0
  // ARIA requires `valuemin <= valuenow <= valuemax`. A negative `max` would publish
  // `aria-valuemax` BELOW `aria-valuemin` (always 0) and break that invariant, so the exposed
  // maximum collapses to 0 — a degenerate but valid zero-length range.
  const safeMax = hasUsableRange ? max : 0
  // `NaN` survives Math.min/max, so it would reach the DOM as `aria-valuenow="NaN"` and a `NaN%`
  // fill (which the browser drops, rendering as a FULL bar — the opposite of "unknown").
  const safeValue = Number.isNaN(value) ? 0 : value
  const clampedValue = hasUsableRange ? Math.min(Math.max(safeValue, 0), max) : 0
  const percentage = hasUsableRange ? (clampedValue / max) * PERCENT : 0

  const hasMeta = Boolean(metaStart) || Boolean(metaEnd)

  // The fill extent travels to the skin as a custom property, keyed by the shared constant so the
  // component and the skin cannot drift. `CSSProperties` models no `--*` names, so the index
  // signature is widened for THOSE keys only — a plain `Record<string, string>` would swallow a
  // typo'd standard property, and an `as CSSProperties` cast would check nothing at all.
  const indicatorStyle: CSSProperties & Record<`--${string}`, string> = {
    [PROGRESS_BAR_VALUE_VAR]: `${String(percentage)}%`,
  }

  return (
    <div
      className={clsx(progressBarVariants({ variant, size }), className)}
      {...rest}
    >
      <div
        role="progressbar"
        aria-label={ariaLabel}
        aria-labelledby={ariaLabelledBy}
        aria-valuenow={clampedValue}
        aria-valuemin={0}
        aria-valuemax={safeMax}
        aria-valuetext={valueText}
        className={PROGRESS_BAR_TRACK_CLASS}
      >
        <div className={PROGRESS_BAR_INDICATOR_CLASS} style={indicatorStyle} />
      </div>

      {hasMeta ? (
        <div className={PROGRESS_BAR_META_CLASS}>
          <span className={PROGRESS_BAR_META_START_CLASS}>{metaStart}</span>
          <span className={PROGRESS_BAR_META_END_CLASS}>{metaEnd}</span>
        </div>
      ) : null}
    </div>
  )
}

export default ProgressBar
