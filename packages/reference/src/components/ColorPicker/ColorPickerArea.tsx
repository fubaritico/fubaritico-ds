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

/** Props of {@link ColorPickerArea}. The service owns the group's role and name. */
export type ColorPickerAreaProps = Omit<
  ComponentProps<'div'>,
  'role' | 'aria-label' | 'aria-disabled' | 'children'
>

/** The area's two axes, in render order. */
const AXES: readonly ColorAreaAxis[] = ['saturation', 'brightness']

/**
 * Reads which axis an area input stands for (set on it as `data-axis`).
 *
 * @param input - The input element.
 * @returns The axis.
 */
const axisOf = (input: HTMLInputElement): ColorAreaAxis =>
  input.dataset.axis === 'brightness' ? 'brightness' : 'saturation'

/**
 * The 2D saturation × brightness surface.
 *
 * The pointer is measured and captured here, then handed to the service as a point; keyboard and
 * assistive technology go through two visually hidden native range inputs (the service's "2D
 * slider"). Every decision — the colour under the pointer, the axis a key moves, Escape during a
 * drag — is the service's. A consumer's pointer handlers run first and may `preventDefault()`.
 *
 * Must be rendered inside a `<ColorPicker>`.
 *
 * @param props - {@link ColorPickerAreaProps}.
 * @returns The rendered area.
 */
export function ColorPickerArea({
  className,
  style,
  onPointerDown,
  onPointerMove,
  onPointerUp,
  onPointerCancel,
  ...rest
}: Readonly<ColorPickerAreaProps>) {
  const { service } = useColorPickerContext()
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
      service.getState().dir
    )

  /**
   * Starts a drag: captures the pointer so the drag keeps tracking outside the area, and moves the
   * focus to the area's input so the keyboard continues from here.
   *
   * @param event - The pointer press.
   */
  const handlePointerDown = (event: PointerEvent<HTMLDivElement>) => {
    onPointerDown?.(event)
    if (event.defaultPrevented || event.button !== 0) return
    if (!service.startDrag('area', pointOf(event))) return
    event.preventDefault()
    event.currentTarget.setPointerCapture(event.pointerId)
    inputRef.current?.focus({ preventScroll: true })
  }

  /**
   * Follows the captured pointer — the service ignores moves outside a drag.
   *
   * @param event - The pointer move.
   */
  const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
    onPointerMove?.(event)
    if (service.getState().dragging === 'area') service.moveDrag(pointOf(event))
  }

  /**
   * Keyboard on the saturation input: the service's area model, Escape included.
   *
   * @param event - The key press.
   */
  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    service.handleKeydown('area', event)
  }

  /**
   * An assistive technology adjusted one axis directly (no keydown).
   *
   * @param event - The input's change.
   */
  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    service.setAreaAxis(
      axisOf(event.currentTarget),
      Number(event.currentTarget.value)
    )
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
      onPointerUp={(event) => {
        onPointerUp?.(event)
        service.endDrag()
      }}
      onPointerCancel={(event) => {
        onPointerCancel?.(event)
        service.cancelDrag()
      }}
    >
      <div className={COLOR_PICKER_AREA_THUMB_CLASS} />
      {AXES.map((axis) => (
        <input
          key={axis}
          {...toReactAttributes(service.areaInputAttrs(axis))}
          data-axis={axis}
          ref={axis === 'saturation' ? inputRef : undefined}
          className={COLOR_PICKER_AREA_INPUT_CLASS}
          onKeyDown={handleKeyDown}
          onChange={handleInputChange}
        />
      ))}
    </div>
  )
}

export default ColorPickerArea
