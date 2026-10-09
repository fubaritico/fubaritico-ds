import clsx from 'clsx'

import {
  COLOR_PICKER_COLOR_VAR,
  COLOR_PICKER_TRACK_IMAGE_VAR,
  colorPickerTrackVariants,
} from '@fubaritico/variants'

import { Slider } from '../Slider'
import {
  useColorPickerContext,
  useColorPickerSnapshot,
} from './ColorPickerContext'

import type { SliderProps } from '../Slider'
import type { CSSProperties } from 'react'

/**
 * Props of the hue and alpha tracks: the Slider's, minus what the service owns (value, range,
 * ARIA, callbacks, track image).
 */
export type ColorPickerTrackProps = Omit<
  SliderProps,
  | 'id'
  | 'value'
  | 'defaultValue'
  | 'min'
  | 'max'
  | 'step'
  | 'disabled'
  | 'onChange'
  | 'onChangeComplete'
  | 'trackImage'
  | 'formatValue'
  | 'aria-label'
>

/** Internal props: the public ones plus which channel the track edits. */
interface ColorPickerTrackInternalProps extends ColorPickerTrackProps {
  /** `'hue'` or `'alpha'`. */
  target: 'hue' | 'alpha'
}

/**
 * One colour track: a `Slider` driven by the service. Every step is reported (`complete: false`);
 * the run settles once — on release (the Slider's `onChangeComplete`), on blur and on pointer
 * cancel, so a change made by an assistive technology (no key or pointer release) settles too.
 * `settle()` is a no-op when nothing is pending, so the overlap costs nothing.
 *
 * The gradient is the skin's (per modifier, mirrored in rtl); the alpha ramp ends on the current
 * opaque colour, passed as a custom property. Values are forwarded in the track's own scale — the
 * service converts.
 *
 * @param props - {@link ColorPickerTrackInternalProps}.
 * @param props.target - `'hue'` or `'alpha'`.
 * @returns The rendered track, or `null` for the alpha track of a picker without alpha.
 */
function ColorPickerTrack({
  target,
  className,
  style,
  onBlur,
  onPointerCancel,
  ...rest
}: Readonly<ColorPickerTrackInternalProps>) {
  const { service } = useColorPickerContext()
  const state = useColorPickerSnapshot(service)
  if (target === 'alpha' && !state.alpha) return null

  const attrs = service.trackInputAttrs(target)
  const trackStyle: CSSProperties & Record<`--${string}`, string> = {
    ...style,
    [COLOR_PICKER_COLOR_VAR]: state.opaqueHex,
  }

  return (
    <Slider
      {...rest}
      id={String(attrs.id)}
      className={clsx(colorPickerTrackVariants({ channel: target }), className)}
      style={trackStyle}
      min={Number(attrs.min)}
      max={Number(attrs.max)}
      step={Number(attrs.step)}
      value={Number(attrs.value)}
      disabled={attrs.disabled !== undefined}
      trackImage={`var(${COLOR_PICKER_TRACK_IMAGE_VAR})`}
      aria-label={String(attrs['aria-label'])}
      formatValue={() => String(attrs['aria-valuetext'])}
      onChange={(value) => {
        service.setTrackValue(target, value, { complete: false })
      }}
      onChangeComplete={() => {
        service.settle()
      }}
      onBlur={(event) => {
        onBlur?.(event)
        service.settle()
      }}
      onPointerCancel={(event) => {
        onPointerCancel?.(event)
        service.settle()
      }}
    />
  )
}

/**
 * The hue track. Must be rendered inside a `<ColorPicker>`.
 *
 * @param props - {@link ColorPickerTrackProps}.
 * @returns The rendered track.
 */
export function ColorPickerHue(props: Readonly<ColorPickerTrackProps>) {
  return <ColorPickerTrack {...props} target="hue" />
}

/**
 * The alpha track, over a checkerboard. Renders nothing unless the picker has `alpha`. Must be
 * rendered inside a `<ColorPicker>`.
 *
 * @param props - {@link ColorPickerTrackProps}.
 * @returns The rendered track, or `null`.
 */
export function ColorPickerAlpha(props: Readonly<ColorPickerTrackProps>) {
  return <ColorPickerTrack {...props} target="alpha" />
}
