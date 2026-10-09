import clsx from 'clsx'

import {
  COLOR_PICKER_CHECKERBOARD_VAR,
  COLOR_PICKER_TRACK_CLASS,
} from '@fubaritico/variants'

import { Slider } from '../Slider'

import {
  useColorPickerContext,
  useColorPickerSnapshot,
} from './ColorPickerContext'

import type { ColorPickerDirection } from '@fubaritico/behaviors'

/** Props of the hue and alpha tracks. */
export interface ColorPickerTrackProps {
  /** Extra class on the track's `Slider`. */
  className?: string
}

/** The hue wheel unrolled: red → yellow → green → cyan → blue → magenta → red. */
const HUE_STOPS =
  '#ff0000, #ffff00, #00ff00, #00ffff, #0000ff, #ff00ff, #ff0000'

/**
 * The gradient direction that runs from the track's inline-start, where the value is 0.
 *
 * @param dir - Text direction.
 * @returns A `linear-gradient` direction keyword.
 */
const inlineDirection = (dir: ColorPickerDirection) =>
  dir === 'rtl' ? 'to left' : 'to right'

/**
 * One colour track, a `Slider` with the service's value, ARIA text and settle semantics: every
 * step is reported (`onChange`), the run completes once on release (`onChangeComplete`).
 *
 * @param props - Track props.
 * @param props.target - `'hue'` or `'alpha'`.
 * @param props.className - Extra class.
 * @returns The rendered track, or `null` for the alpha track of a picker without alpha.
 */
function ColorPickerTrack({
  target,
  className,
}: Readonly<ColorPickerTrackProps & { target: 'hue' | 'alpha' }>) {
  const { service, dir } = useColorPickerContext()
  const state = useColorPickerSnapshot(service)
  if (target === 'alpha' && !state.alpha) return null

  const attrs = service.trackInputAttrs(target)
  const direction = inlineDirection(dir)
  const trackImage =
    target === 'hue'
      ? `linear-gradient(${direction}, ${HUE_STOPS})`
      : `linear-gradient(${direction}, transparent, ${state.opaqueHex}), var(${COLOR_PICKER_CHECKERBOARD_VAR})`
  // Alpha is a fraction in the service, a percentage on the slider (which reads better).
  const toChannel = (value: number) => (target === 'hue' ? value : value / 100)

  return (
    <Slider
      id={String(attrs.id)}
      className={clsx(COLOR_PICKER_TRACK_CLASS, className)}
      min={Number(attrs.min)}
      max={Number(attrs.max)}
      step={Number(attrs.step)}
      value={Number(attrs.value)}
      disabled={attrs.disabled !== undefined}
      trackImage={trackImage}
      aria-label={String(attrs['aria-label'])}
      formatValue={() => String(attrs['aria-valuetext'])}
      onChange={(value) => {
        service.setChannel(target === 'hue' ? 'h' : 'a', toChannel(value), {
          complete: false,
        })
      }}
      onChangeComplete={() => {
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
