import clsx from 'clsx'
import { useId } from 'react'

import {
  INPUT_ICON_CLASS,
  INPUT_LABEL_CLASS,
  INPUT_MESSAGE_CLASS,
  INPUT_MESSAGE_ERROR_CLASS,
  inputAffixVariants,
  inputFieldVariants,
  inputVariants,
} from '@fubaritico-ds/variants'

import { Icon } from '../Icon'

import type { IconName, IconSize } from '../Icon'
import type { InputSize } from '@fubaritico-ds/variants'
import type { ComponentProps } from 'react'

export type { InputSize }

/** Semantic of the helper message — drives the colour, `aria-invalid` and `role="alert"`. */
export type InputMessageType = 'error' | 'info'

/**
 * Props of the {@link Input} component.
 *
 * The native `size` attribute (character width) is intentionally omitted: `size` is repurposed as the
 * design-system size axis (sm/md/lg), matching every other DS component. Control the width via CSS.
 */
export interface InputProps extends Omit<ComponentProps<'input'>, 'size'> {
  /** Control size; defaults to `'md'`. */
  size?: InputSize
  /** Optional decorative trailing icon (heroicons subset). */
  icon?: IconName
  /** Optional label rendered above the control and linked to it via `htmlFor`. */
  label?: string
  /** Optional helper/error message rendered below the control. */
  message?: string
  /** Semantic of {@link InputProps.message}; defaults to `'info'`. */
  messageType?: InputMessageType
}

/** Pixel size of the trailing icon per control size (the SVG dimension, not a class). */
const iconSizeMap: Record<InputSize, IconSize> = { sm: 16, md: 20, lg: 24 }

/** Fixed pixel size of the inline error-message icon (proportional to the 12–14px message text). */
const ERROR_ICON_SIZE: IconSize = 16

/**
 * Text input control with optional label, trailing icon and helper/error message.
 *
 * A presentational, accessible form primitive: it wires the label/message to the control
 * (`htmlFor` + `aria-describedby`), surfaces errors (`aria-invalid` + `role="alert"` + a leading
 * error icon so the state is not conveyed by colour alone), and renders the native skin classes.
 * The trailing icon is purely decorative (`aria-hidden`, non-interactive).
 *
 * @param props - {@link InputProps}.
 * @returns The rendered input — bare, icon-wrapped, or wrapped in a field layer with label/message.
 */
export function Input({
  size = 'md',
  icon,
  label,
  message,
  messageType = 'info',
  className,
  id: externalId,
  ...rest
}: Readonly<InputProps>) {
  const autoId = useId()
  const inputId = externalId ?? autoId
  const messageId = message ? `${inputId}-message` : undefined
  const hasError = messageType === 'error' && !!message

  const input = (
    <input
      id={inputId}
      aria-invalid={hasError || undefined}
      aria-describedby={messageId}
      className={clsx(
        inputVariants({ size, invalid: hasError, hasIcon: !!icon }),
        className
      )}
      {...rest}
    />
  )

  const control = icon ? (
    <div className={inputAffixVariants({ size })}>
      {input}
      <span className={INPUT_ICON_CLASS}>
        <Icon name={icon} size={iconSizeMap[size]} />
      </span>
    </div>
  ) : (
    input
  )

  if (!label && !message) return control

  return (
    <div className={inputFieldVariants({ size })}>
      {label ? (
        <label htmlFor={inputId} className={INPUT_LABEL_CLASS}>
          {label}
        </label>
      ) : null}
      {control}
      {message ? (
        <p
          id={messageId}
          role={hasError ? 'alert' : undefined}
          className={clsx(
            INPUT_MESSAGE_CLASS,
            hasError && INPUT_MESSAGE_ERROR_CLASS
          )}
        >
          {hasError ? (
            <Icon name="ExclamationCircle" size={ERROR_ICON_SIZE} />
          ) : null}
          {message}
        </p>
      ) : null}
    </div>
  )
}

export default Input
