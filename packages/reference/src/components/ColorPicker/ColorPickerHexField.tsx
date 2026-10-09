import clsx from 'clsx'

import {
  COLOR_PICKER_HEX_CLASS,
  COLOR_PICKER_HEX_ERROR_CLASS,
  inputVariants,
} from '@fubaritico/variants'

import { toReactAttributes } from '../../utils'

import {
  useColorPickerContext,
  useColorPickerSnapshot,
} from './ColorPickerContext'

import type { ChangeEvent, KeyboardEvent } from 'react'

/** Props of {@link ColorPickerHexField}. */
export interface ColorPickerHexFieldProps {
  /** Extra class on the input. */
  className?: string
}

/**
 * The hex field. Typing never reformats it: the text is a draft, applied on Enter or blur. Enter on
 * an invalid draft keeps it and shows the error message (linked with `aria-describedby`); blur
 * discards it; Escape restores the current hex.
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
}: Readonly<ColorPickerHexFieldProps>) {
  const { service } = useColorPickerContext()
  const state = useColorPickerSnapshot(service)

  /**
   * Enter commits the draft (keeping an invalid one for correction); Escape abandons it.
   *
   * @param event - The key press.
   */
  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      event.preventDefault()
      service.commitHexDraft()
    } else if (event.key === 'Escape') {
      service.cancelHexDraft()
    }
  }

  return (
    <>
      <input
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
        onBlur={() => service.commitHexDraft({ revertOnInvalid: true })}
      />
      {state.hexInvalid ? (
        <p
          {...toReactAttributes(service.hexErrorAttrs())}
          className={COLOR_PICKER_HEX_ERROR_CLASS}
        >
          {service.hexErrorText()}
        </p>
      ) : null}
    </>
  )
}

export default ColorPickerHexField
