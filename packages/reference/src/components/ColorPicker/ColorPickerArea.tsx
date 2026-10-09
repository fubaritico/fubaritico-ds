import clsx from 'clsx'
import { useRef } from 'react'

import { pointFromRect } from '@fubaritico/behaviors'
import {
  COLOR_PICKER_AREA_CLASS,
  COLOR_PICKER_AREA_INPUT_CLASS,
  COLOR_PICKER_AREA_THUMB_CLASS,
  COLOR_PICKER_COLOR_VAR,
  COLOR_PICKER_HUE_VAR,
  COLOR_PICKER_X_VAR,
  COLOR_PICKER_Y_VAR,
} from '@fubaritico/variants'

import { toReactAttributes } from '../../utils'

import {
  useColorPickerContext,
  useColorPickerSnapshot,
} from './ColorPickerContext'

import type { ColorAreaAxis } from '@fubaritico/behaviors'
import type {
  CSSProperties,
  ChangeEvent,
  ComponentProps,
  KeyboardEvent,
  PointerEvent,
} from 'react'

/** Props of {@link ColorPickerArea}. */
export type ColorPickerAreaProps = Omit<
  ComponentProps<'div'>,
  'role' | 'aria-label' | 'children'
>

/** The area's two axes, in render order. */
const AXES: readonly ColorAreaAxis[] = ['saturation', 'brightness']

/** Which HSVA channel each axis drives. */
const CHANNEL = { saturation: 's', brightness: 'v' } as const

/**
 * The 2D saturation × brightness surface.
 *
 * The pointer is handled here — measured, captured, handed to the service as a point. Keyboard and
 * assistive technology go through two visually hidden native range inputs (the service's "2D
 * slider"): only the saturation input is tabbable, and its keydown drives both axes. Escape during
 * a drag puts the colour back.
 *
 * Must be rendered inside a `<ColorPicker>`.
 *
 * @param props - {@link ColorPickerAreaProps}.
 * @returns The rendered area.
 */
export function ColorPickerArea({
  className,
  style,
  ...rest
}: Readonly<ColorPickerAreaProps>) {
  const { service, dir } = useColorPickerContext()
  const state = useColorPickerSnapshot(service)
  const inputRef = useRef<HTMLInputElement>(null)
  const thumb = service.thumbPosition('area')

  /**
   * Locates the pointer on the area, in the service's logical fractions.
   *
   * @param event - The pointer event.
   * @returns The point.
   */
  const pointOf = (event: PointerEvent<HTMLDivElement>) =>
    pointFromRect(
      event.clientX,
      event.clientY,
      event.currentTarget.getBoundingClientRect(),
      dir
    )

  /**
   * Starts a drag: captures the pointer so the drag keeps tracking outside the area, and moves the
   * focus to the area's input so the keyboard continues from here.
   *
   * @param event - The pointer press.
   */
  const handlePointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (event.button !== 0 || state.disabled) return
    event.preventDefault()
    event.currentTarget.setPointerCapture(event.pointerId)
    inputRef.current?.focus({ preventScroll: true })
    service.startDrag('area', pointOf(event))
  }

  /**
   * Follows the captured pointer.
   *
   * @param event - The pointer move.
   */
  const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (state.dragging === 'area') service.moveDrag(pointOf(event))
  }

  /**
   * Keyboard on the focused input: Escape cancels a drag in progress; everything else is the
   * service's area model (arrows, PageUp / PageDown, Home / End).
   *
   * @param event - The key press.
   */
  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Escape' && state.dragging === 'area') {
      service.cancelDrag()
      return
    }
    service.handleKeydown('area', event)
  }

  /**
   * An assistive technology adjusted one axis directly (no keydown): apply it as a settled change.
   *
   * @param axis - The axis whose input changed.
   * @param event - The input's change.
   */
  const handleInputChange = (
    axis: ColorAreaAxis,
    event: ChangeEvent<HTMLInputElement>
  ) => {
    service.setChannel(CHANNEL[axis], Number(event.target.value))
  }

  // The skin reads the hue and the thumb from custom properties; `CSSProperties` models no `--*`.
  const areaStyle: CSSProperties & Record<`--${string}`, string> = {
    ...style,
    [COLOR_PICKER_HUE_VAR]: state.hueHex,
    [COLOR_PICKER_COLOR_VAR]: state.opaqueHex,
    [COLOR_PICKER_X_VAR]: String(thumb.x),
    [COLOR_PICKER_Y_VAR]: String(thumb.y),
  }

  return (
    <div
      {...rest}
      {...toReactAttributes(service.areaAttrs())}
      className={clsx(COLOR_PICKER_AREA_CLASS, className)}
      style={areaStyle}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={() => {
        service.endDrag()
      }}
      onPointerCancel={() => {
        service.cancelDrag()
      }}
    >
      <div className={COLOR_PICKER_AREA_THUMB_CLASS} />
      {AXES.map((axis) => (
        <input
          key={axis}
          {...toReactAttributes(service.areaInputAttrs(axis))}
          ref={axis === 'saturation' ? inputRef : undefined}
          className={COLOR_PICKER_AREA_INPUT_CLASS}
          onKeyDown={handleKeyDown}
          onChange={(event) => {
            handleInputChange(axis, event)
          }}
        />
      ))}
    </div>
  )
}

export default ColorPickerArea
