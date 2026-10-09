import clsx from 'clsx'

import {
  COLOR_PICKER_HEX_CLASS,
  COLOR_PICKER_HEX_ERROR_CLASS,
  COLOR_PICKER_HEX_FIELD_CLASS,
  inputVariants,
} from '@fubaritico/variants'

import { toReactAttributes } from '../../utils'
import {
  useColorPickerContext,
  useColorPickerSnapshot,
} from './ColorPickerContext'

import type {
  ChangeEvent,
  ComponentProps,
  FocusEvent,
  KeyboardEvent,
} from 'react'

/**
 * Props of {@link ColorPickerHexField}: the input's, minus what the service owns (id, value,
 * ARIA state, the text-entry attributes).
 */
export type ColorPickerHexFieldProps = Omit<
  ComponentProps<'input'>,
  | 'id'
  | 'type'
  | 'value'
  | 'defaultValue'
  | 'onChange'
  | 'disabled'
  | 'maxLength'
  | 'aria-label'
  | 'aria-invalid'
  | 'aria-describedby'
>

/**
 * The hex field. Typing never reformats it: the text is a draft, applied on Enter or blur. Enter on
 * an invalid draft keeps it and shows the error under the field (linked with `aria-describedby`);
 * blur discards it; Escape restores the current hex. The key policy is the service's.
 *
 * It wears the Input skin (`.ui-input`) but is a plain `<input>`: the service owns its id and its
 * error reference, which the `Input` component would otherwise generate itself.
 *
 * Must be rendered inside a `<ColorPicker>`.
 *
 * @param props - {@link ColorPickerHexFieldProps}.
 * @returns The rendered field (and its error while invalid).
 */
export function ColorPickerHexField({
  className,
  onKeyDown,
  onBlur,
  ...rest
}: Readonly<ColorPickerHexFieldProps>) {
  const { service } = useColorPickerContext()
  const state = useColorPickerSnapshot(service)

  /**
   * Runs the consumer's handler first; the service handles Enter / Escape unless prevented.
   *
   * @param event - The key press.
   */
  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    onKeyDown?.(event)
    if (!event.defaultPrevented) service.handleHexKeydown(event)
  }

  /**
   * Commits the draft on blur, discarding it when invalid.
   *
   * @param event - The blur.
   */
  const handleBlur = (event: FocusEvent<HTMLInputElement>) => {
    onBlur?.(event)
    service.commitHexDraft({ revertOnInvalid: true })
  }

  return (
    <div className={COLOR_PICKER_HEX_FIELD_CLASS}>
      <input
        {...rest}
        {...toReactAttributes(service.hexInputAttrs())}
        className={clsx(
          inputVariants({ size: 'sm', invalid: state.hexInvalid }),
          COLOR_PICKER_HEX_CLASS,
          className
        )}
        onChange={(event: ChangeEvent<HTMLInputElement>) => {
          service.setHexDraft(event.target.value)
        }}
        onKeyDown={handleKeyDown}
        onBlur={handleBlur}
      />
      {state.hexInvalid ? (
        <p
          {...toReactAttributes(service.hexErrorAttrs())}
          className={COLOR_PICKER_HEX_ERROR_CLASS}
        >
          {service.getLabels().hexInvalid}
        </p>
      ) : null}
    </div>
  )
}

export default ColorPickerHexField
