import clsx from 'clsx'
import { useEffect, useId, useRef } from 'react'

import {
  CHECKBOX_BOX_CLASS,
  CHECKBOX_FIELD_CLASS,
  CHECKBOX_ICON_CLASS,
  CHECKBOX_INPUT_CLASS,
  CHECKBOX_LABEL_CLASS,
  CHECKBOX_MESSAGE_CLASS,
  CHECKBOX_MESSAGE_ERROR_CLASS,
  checkboxVariants,
} from '@fubaritico-ds/variants'

import { Icon } from '../Icon'

import type { CheckboxSize } from '@fubaritico-ds/variants'
import type { ComponentProps } from 'react'

export type { CheckboxSize }

/**
 * Props of the {@link Checkbox} component.
 *
 * The native `size` attribute is omitted: `size` is the design-system size axis (sm/md), matching
 * every other DS control. The standard `checked` / `onChange` / `disabled` props come from the
 * native `<input>`, so it wires straight onto event-based handlers (e.g. TanStack Table's
 * `getToggleSelectedHandler()`).
 */
export interface CheckboxProps extends Omit<ComponentProps<'input'>, 'size'> {
  /** Box size; defaults to `'md'`. */
  size?: CheckboxSize
  /** Optional label rendered next to the box (also the accessible name unless `aria-label` is set). */
  label?: string
  /** Optional error message rendered below the row; sets `aria-invalid` + the destructive border. */
  error?: string
  /** Whether the box shows the mixed (indeterminate) state; set on the native input via a ref. */
  indeterminate?: boolean
}

/** Pixel size of the rendered glyph SVG (the skin scales it down to fit the box via CSS). */
const GLYPH_ICON_SIZE = 16

/** Fixed pixel size of the inline error-message icon (proportional to the 12–14px message text). */
const ERROR_ICON_SIZE = 16

/**
 * Accessible checkbox control with an optional label and error message.
 *
 * A presentational form primitive built on a visually-hidden native `<input type="checkbox">`: the
 * painted box mirrors the input's checked / indeterminate / disabled / focus state purely via the
 * skin (`:has(.ui-checkbox__input:…)`), so it behaves identically controlled or uncontrolled. Errors
 * surface as `aria-invalid` + a `role="alert"` message prefixed by an icon (state is never conveyed by
 * colour alone — WCAG 1.4.1).
 *
 * @param props - {@link CheckboxProps}.
 * @returns The rendered checkbox row, optionally followed by an error message.
 */
export function Checkbox({
  size = 'md',
  label,
  error,
  indeterminate = false,
  className,
  id: externalId,
  ...rest
}: Readonly<CheckboxProps>) {
  const inputRef = useRef<HTMLInputElement>(null)
  const autoId = useId()
  const inputId = externalId ?? autoId
  const messageId = error ? `${inputId}-error` : undefined
  const hasError = !!error

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.indeterminate = indeterminate
    }
  }, [indeterminate])

  return (
    <div className={CHECKBOX_FIELD_CLASS}>
      <label
        className={clsx(
          checkboxVariants({ size, invalid: hasError }),
          className
        )}
      >
        <input
          ref={inputRef}
          id={inputId}
          type="checkbox"
          className={CHECKBOX_INPUT_CLASS}
          aria-invalid={hasError || undefined}
          aria-describedby={messageId}
          {...rest}
        />
        <span className={CHECKBOX_BOX_CLASS} aria-hidden="true">
          <span className={CHECKBOX_ICON_CLASS}>
            <Icon
              name={indeterminate ? 'Minus' : 'Check'}
              size={GLYPH_ICON_SIZE}
            />
          </span>
        </span>
        {label ? <span className={CHECKBOX_LABEL_CLASS}>{label}</span> : null}
      </label>
      {hasError ? (
        <p
          id={messageId}
          role="alert"
          className={`${CHECKBOX_MESSAGE_CLASS} ${CHECKBOX_MESSAGE_ERROR_CLASS}`}
        >
          <Icon name="ExclamationCircle" size={ERROR_ICON_SIZE} />
          {error}
        </p>
      ) : null}
    </div>
  )
}

export default Checkbox
