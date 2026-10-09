import clsx from 'clsx'
import { useId, useLayoutEffect, useMemo, useRef, useState } from 'react'

import { createColorPickerService, resolveDirection } from '@fubaritico/behaviors'
import {
  COLOR_PICKER_ROW_CLASS,
  colorPickerVariants,
} from '@fubaritico/variants'

import { useMergedRef } from '../../hooks'
import { toReactAttributes } from '../../utils'

import { ColorPickerArea } from './ColorPickerArea'
import { ColorPickerAutoToggle } from './ColorPickerAutoToggle'
import {
  ColorPickerContext,
  useColorPickerSelector,
} from './ColorPickerContext'
import { ColorPickerHexField } from './ColorPickerHexField'
import { ColorPickerStatus } from './ColorPickerStatus'
import { ColorPickerSwatch } from './ColorPickerSwatch'
import { ColorPickerAlpha, ColorPickerHue } from './ColorPickerTrack'

import type {
  ColorPickerLabels,
  ColorPickerOptions,
  ColorPickerService,
  ColorValue,
  DescribeColor,
  HsvaColor,
} from '@fubaritico/behaviors'
import type { ComponentProps } from 'react'

export type { ColorValue, HsvaColor } from '@fubaritico/behaviors'

/** Props of the {@link ColorPicker} root. */
export interface ColorPickerProps
  extends Omit<ComponentProps<'div'>, 'defaultValue' | 'onChange'> {
  /** Controlled value: a colour, or `null` for "automatic" (with `nullable`). */
  value?: ColorValue
  /** Initial value when uncontrolled. */
  defaultValue?: ColorValue
  /** Called on every change — continuously while dragging. */
  onChange?: (value: ColorValue) => void
  /** Called once a change is settled (release, key, hex commit) — for anything expensive. */
  onChangeComplete?: (value: ColorValue) => void
  /** Allows the "automatic / no colour" state (`null`). */
  nullable?: boolean
  /** Edits the alpha channel too. */
  alpha?: boolean
  /** Blocks every change. */
  disabled?: boolean
  /** Where the thumbs sit while the value is `null` and nothing was chosen yet. */
  placeholder?: HsvaColor
  /** Accessible labels; English defaults. Compared by content — a fresh object per render is fine. */
  labels?: Partial<ColorPickerLabels>
  /** Colour-to-words function for screen readers; English default. Memoise it. */
  describeColor?: DescribeColor
  /**
   * A service built elsewhere with `createColorPickerService` — to drive the picker from outside
   * the tree, or to inject a stub in a test. Read once, at mount; its own `uid` and
   * `defaultValue` are kept.
   */
  service?: ColorPickerService
}

/**
 * Projects the root props onto service options. `value` is always passed: `undefined` means
 * uncontrolled (the service reads `value !== undefined`), so a prop switching to `undefined`
 * releases control.
 *
 * @param props - The props driving the service.
 * @returns The matching service options.
 */
function toServiceOptions(
  props: Pick<
    ColorPickerProps,
    | 'value'
    | 'onChange'
    | 'onChangeComplete'
    | 'nullable'
    | 'alpha'
    | 'disabled'
    | 'placeholder'
    | 'labels'
    | 'describeColor'
  >
): Partial<ColorPickerOptions> {
  return {
    value: props.value,
    onChange: props.onChange,
    onChangeComplete: props.onChangeComplete,
    nullable: props.nullable,
    alpha: props.alpha,
    disabled: props.disabled,
    labels: props.labels,
    ...(props.placeholder === undefined
      ? {}
      : { placeholder: props.placeholder }),
    ...(props.describeColor === undefined
      ? {}
      : { describeColor: props.describeColor }),
  }
}

/**
 * The default arrangement, used when `<ColorPicker>` has no children: area, hue, alpha (when
 * enabled), then a row with the swatch, the hex field and the automatic toggle (when nullable).
 *
 * @returns The default parts.
 */
function DefaultLayout() {
  return (
    <>
      <ColorPickerArea />
      <ColorPickerHue />
      <ColorPickerAlpha />
      <div className={COLOR_PICKER_ROW_CLASS}>
        <ColorPickerSwatch />
        <ColorPickerHexField />
        <ColorPickerAutoToggle />
      </div>
    </>
  )
}

/**
 * ColorPicker — picks a colour on a 2D saturation / brightness area, a hue track, an optional alpha
 * track and a hex field; optionally an explicit "automatic / no colour" state.
 *
 * A thin React adapter over `ColorPickerService` (`@fubaritico/behaviors`), which owns the HSVA
 * state, the drags, the keyboard, the hex draft and every ARIA attribute. Works controlled
 * (`value` + `onChange`) or uncontrolled (`defaultValue`). Without children it renders the default
 * arrangement; compose `ColorPicker.Area`, `.Hue`, `.Alpha`, `.HexField`, `.Swatch`, `.AutoToggle`
 * to arrange it yourself. The polite live region (`.Status`) is always rendered.
 *
 * @param props - {@link ColorPickerProps}.
 * @param props.value - Controlled value.
 * @param props.defaultValue - Initial value when uncontrolled.
 * @param props.onChange - Called on every change.
 * @param props.onChangeComplete - Called once a change is settled.
 * @param props.nullable - Allows the automatic state.
 * @param props.alpha - Edits the alpha channel.
 * @param props.disabled - Blocks every change.
 * @param props.placeholder - Thumb position while nothing was chosen.
 * @param props.labels - Accessible labels.
 * @param props.describeColor - Colour-to-words function.
 * @param props.service - Injected service; one is created when absent.
 * @returns The rendered picker panel.
 */
export function ColorPicker({
  value,
  defaultValue,
  onChange,
  onChangeComplete,
  nullable = false,
  alpha = false,
  disabled = false,
  placeholder,
  labels,
  describeColor,
  service: injectedService,
  className,
  children,
  ref,
  ...rest
}: Readonly<ColorPickerProps>) {
  const uid = useId()
  const rootRef = useRef<HTMLDivElement>(null)
  const mergedRef = useMergedRef(rootRef, ref)

  const options = toServiceOptions({
    value,
    onChange,
    onChangeComplete,
    nullable,
    alpha,
    disabled,
    placeholder,
    labels,
    describeColor,
  })

  // `useState`, not `useMemo`: the instance must live as long as the component, and a StrictMode
  // remount reuses it (so it is never destroyed in a cleanup).
  const [service] = useState(
    () =>
      injectedService ??
      createColorPickerService({
        ...options,
        uid,
        defaultValue: defaultValue ?? null,
      })
  )

  // Props → service, before paint. Cheap on every render: the service only notifies when the
  // snapshot changes (labels compared by content, callbacks ignored).
  useLayoutEffect(() => {
    service.setOptions(options)
  })

  // The direction lives in the DOM (`dir` on an ancestor), not in a prop: resolved by the service's
  // helper at mount, and again whenever any `dir` attribute in the document changes.
  useLayoutEffect(() => {
    const root = rootRef.current
    if (!root) return undefined
    const sync = () => {
      service.setOptions({ dir: resolveDirection(root) })
    }
    sync()
    const observer = new MutationObserver(sync)
    observer.observe(root.ownerDocument.documentElement, {
      attributes: true,
      attributeFilter: ['dir'],
      subtree: true,
    })
    return () => {
      observer.disconnect()
    }
  }, [service])

  // A slice, not the snapshot: the root must not re-render on every pointer move.
  const isDisabled = useColorPickerSelector(service, (state) => state.disabled)
  const contextValue = useMemo(() => ({ service }), [service])

  return (
    <ColorPickerContext value={contextValue}>
      <div
        className={clsx(
          colorPickerVariants({ disabled: isDisabled }),
          className
        )}
        {...toReactAttributes(service.pickerAttrs())}
        {...rest}
        ref={mergedRef}
      >
        {children ?? <DefaultLayout />}
        <ColorPickerStatus />
      </div>
    </ColorPickerContext>
  )
}

ColorPicker.Area = ColorPickerArea
ColorPicker.Hue = ColorPickerHue
ColorPicker.Alpha = ColorPickerAlpha
ColorPicker.HexField = ColorPickerHexField
ColorPicker.Swatch = ColorPickerSwatch
ColorPicker.AutoToggle = ColorPickerAutoToggle

export default ColorPicker
