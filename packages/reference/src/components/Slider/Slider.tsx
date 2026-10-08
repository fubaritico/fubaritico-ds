import clsx from 'clsx'
import { useState } from 'react'

import {
  SLIDER_INPUT_CLASS,
  SLIDER_PROGRESS_VAR,
  SLIDER_RANGE_CLASS,
  SLIDER_THUMB_CLASS,
  SLIDER_TRACK_CLASS,
  SLIDER_TRACK_IMAGE_VAR,
  sliderVariants,
} from '@fubaritico-ds/variants'

import type { SliderSize } from '@fubaritico-ds/variants'
import type { CSSProperties, ChangeEvent, ComponentProps } from 'react'

export type { SliderSize } from '@fubaritico-ds/variants'

/** Percentage denominator — the thumb position is handed to the skin as a 0–100% length. */
const PERCENT = 100

/** Props of the {@link Slider}. */
export interface SliderProps
  extends Omit<
    ComponentProps<'input'>,
    'type' | 'value' | 'defaultValue' | 'onChange' | 'size' | 'aria-label'
  > {
  /** Current value, when the slider is controlled. */
  value?: number
  /** Initial value, when it is not. Defaults to `min`. */
  defaultValue?: number
  /** Lowest value; defaults to `0`. */
  min?: number
  /** Highest value; defaults to `100`. */
  max?: number
  /** Granularity; defaults to `1`. */
  step?: number
  /** Called on every change, including continuously while dragging. */
  onChange?: (value: number) => void
  /**
   * Called once the interaction ends — pointer released, or the key lifted.
   *
   * Use this rather than `onChange` for anything expensive: a network write, a store far from the
   * component. `onChange` can fire at pointer-move rate.
   */
  onChangeComplete?: (value: number) => void
  /** Track and thumb scale; defaults to `'md'`. */
  size?: SliderSize
  /**
   * Any CSS `background-image` for the track — a hue ramp, an alpha checkerboard, a channel ramp.
   *
   * Setting it also turns the filled range off, since a track that carries its own meaning must
   * not be painted over. This is what lets a colour slider be this component.
   */
  trackImage?: string
  /**
   * Turns the value into the sentence a screen reader announces (`aria-valuetext`).
   *
   * Pass it whenever the bare number is not what the user perceives — "hue 210°, blue" rather
   * than "210", "60%" rather than "0.6".
   */
  formatValue?: (value: number) => string
  /**
   * Accessible name — **required**: a range input has no content to name itself from, and a
   * visible label is the consumer's markup.
   */
  'aria-label': string
}

/**
 * Slider — a value along a track.
 *
 * The visible parts are painted divs, but the control is a real `<input type="range">` laid
 * transparently over them: the role, the `aria-value*` attributes, arrow / Home / End / PageUp /
 * PageDown and form participation all come from the platform rather than from code we wrote.
 *
 * Everything cosmetic is a `--ui-slider-*` custom property. The component itself passes only the
 * thumb position, so the skin keeps ownership of the direction and the slider is RTL-correct.
 *
 * @param props - {@link SliderProps}.
 * @param props.value - Controlled value.
 * @param props.defaultValue - Initial value when uncontrolled.
 * @param props.min - Lowest value; defaults to `0`.
 * @param props.max - Highest value; defaults to `100`.
 * @param props.step - Granularity; defaults to `1`.
 * @param props.onChange - Called on every change, continuously while dragging.
 * @param props.onChangeComplete - Called once the interaction ends.
 * @param props.size - Track and thumb scale; defaults to `'md'`.
 * @param props.trackImage - A background for the track; also hides the filled range.
 * @param props.formatValue - Builds the `aria-valuetext` sentence.
 * @returns The rendered slider.
 */
export function Slider({
  value,
  defaultValue,
  min = 0,
  max = PERCENT,
  step = 1,
  onChange,
  onChangeComplete,
  size = 'md',
  trackImage,
  formatValue,
  disabled = false,
  className,
  style,
  'aria-label': ariaLabel,
  ...rest
}: Readonly<SliderProps>) {
  // Uncontrolled fallback. The controlled value always wins when provided, so a consumer can
  // switch a slider to controlled without the internal copy fighting it.
  const [internalValue, setInternalValue] = useState(defaultValue ?? min)
  const currentValue = value ?? internalValue

  // A degenerate range would divide by zero; treat it as empty rather than emitting `NaN%`.
  const span = max - min
  const clamped = Math.min(Math.max(currentValue, min), max)
  const percentage = span > 0 ? ((clamped - min) / span) * PERCENT : 0

  /**
   * Mirrors the native input's value out, keeping the uncontrolled copy in step.
   *
   * @param e - The input event, fired continuously while dragging.
   */
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const next = Number(e.target.value)
    setInternalValue(next)
    onChange?.(next)
  }

  /**
   * Reports the settled value, once the pointer or the key is released.
   *
   * Typed on `currentTarget` alone so the one function serves the pointer, touch and keyboard
   * release events, and reads the DOM rather than a render-time copy — a parent that debounces
   * its controlled value would otherwise commit a stale number.
   *
   * @param e - Any release event on the native range.
   */
  const handleChangeComplete = (e: { currentTarget: HTMLInputElement }) => {
    onChangeComplete?.(Number(e.currentTarget.value))
  }

  // The skin reads the thumb position and the optional track background from these two
  // properties; `CSSProperties` models no `--*` names, hence the widened index signature.
  const sliderStyle: CSSProperties & Record<`--${string}`, string> = {
    ...style,
    [SLIDER_PROGRESS_VAR]: `${String(percentage)}%`,
    ...(trackImage ? { [SLIDER_TRACK_IMAGE_VAR]: trackImage } : {}),
  }

  return (
    <div
      className={clsx(
        sliderVariants({ size, imaged: Boolean(trackImage), disabled }),
        className
      )}
      style={sliderStyle}
    >
      <div className={SLIDER_TRACK_CLASS}>
        <div className={SLIDER_RANGE_CLASS} />
      </div>

      <input
        type="range"
        className={SLIDER_INPUT_CLASS}
        min={min}
        max={max}
        step={step}
        value={clamped}
        disabled={disabled}
        aria-label={ariaLabel}
        aria-valuetext={formatValue?.(clamped)}
        onChange={handleChange}
        onMouseUp={handleChangeComplete}
        onTouchEnd={handleChangeComplete}
        onKeyUp={handleChangeComplete}
        {...rest}
      />

      <div className={SLIDER_THUMB_CLASS} />
    </div>
  )
}

export default Slider
