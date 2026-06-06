import clsx from 'clsx'
import { useId } from 'react'

import { Icon } from '../Icon'

import type { IconName } from '../Icon'
import type { ComponentProps, FC } from 'react'

export type InputSize = 'sm' | 'md' | 'lg'
export type InputMessageType = 'error' | 'info'

export interface InputProps extends ComponentProps<'input'> {
  inputSize?: InputSize
  icon?: IconName
  label?: string
  message?: string
  messageType?: InputMessageType
}

const iconSizeMap = { sm: 16, md: 20, lg: 24 } as const

const Input: FC<InputProps> = ({
  inputSize = 'md',
  icon,
  label,
  message,
  messageType = 'info',
  className,
  id: externalId,
  ...rest
}) => {
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
        'ui:w-full ui:rounded ui:border ui:bg-background ui:font-roboto ui:text-foreground ui:transition-[border-color,background-color]',
        'ui:placeholder:text-muted-foreground',
        'ui:focus:outline-2 ui:focus:outline-offset-2',
        'ui:disabled:pointer-events-none ui:disabled:opacity-50',
        hasError
          ? 'ui:border-destructive ui:focus:outline-destructive'
          : 'ui:border-input ui:focus:outline-primary',
        {
          'ui:h-8 ui:px-3 ui:text-base ui:sm:text-sm': inputSize === 'sm',
          'ui:h-10 ui:px-4 ui:text-base': inputSize === 'md',
          'ui:h-12 ui:px-6 ui:text-lg': inputSize === 'lg',
        },
        icon && {
          'ui:pr-8': inputSize === 'sm',
          'ui:pr-10': inputSize === 'md',
          'ui:pr-12': inputSize === 'lg',
        },
        className
      )}
      {...rest}
    />
  )

  const inputWithIcon = icon ? (
    <div className="ui:relative ui:w-full">
      {input}
      <span
        className={clsx(
          'ui:pointer-events-none ui:absolute ui:top-1/2 ui:-translate-y-1/2 ui:text-muted-foreground',
          {
            'ui:right-2': inputSize === 'sm',
            'ui:right-3': inputSize === 'md',
            'ui:right-4': inputSize === 'lg',
          }
        )}
      >
        <Icon name={icon} size={iconSizeMap[inputSize]} />
      </span>
    </div>
  ) : (
    input
  )

  if (!label && !message) return inputWithIcon

  return (
    <div className="ui:flex ui:w-full ui:flex-col ui:gap-1.5">
      {label && (
        <label
          htmlFor={inputId}
          className={clsx('ui:font-roboto ui:font-medium ui:text-foreground', {
            'ui:text-xs': inputSize === 'sm',
            'ui:text-sm': inputSize === 'md',
            'ui:text-base': inputSize === 'lg',
          })}
        >
          {label}
        </label>
      )}
      {inputWithIcon}
      {message && (
        <p
          id={messageId}
          role={hasError ? 'alert' : undefined}
          className={clsx(
            'ui:font-roboto',
            {
              'ui:text-xs': inputSize === 'sm',
              'ui:text-sm': inputSize === 'md' || inputSize === 'lg',
            },
            hasError ? 'ui:text-destructive' : 'ui:text-muted-foreground'
          )}
        >
          {message}
        </p>
      )}
    </div>
  )
}

export default Input
