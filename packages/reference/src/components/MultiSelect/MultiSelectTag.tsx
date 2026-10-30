import { memo, useCallback } from 'react'

import { Badge } from '../Badge'

import type {
  MultiSelectService,
  MultiSelectTag as Tag,
} from '@fubaritico/behaviors'
import type { MultiSelectSize, MultiSelectVariant } from '@fubaritico/variants'

/** Props of {@link MultiSelectTag}. */
export interface MultiSelectTagProps {
  /** The chosen value and its label. */
  tag: Tag
  /** Accessible name of the remove button (translated by the service). */
  removeLabel: string
  /** The service the removal goes through. */
  service: MultiSelectService
  /** Colour scheme of the field. */
  variant: MultiSelectVariant
  /** Size of the field — the badge takes the same. */
  size: MultiSelectSize
  /** Whether the field is disabled. */
  disabled: boolean
  /** Records (or forgets, with `null`) the remove button of a value, for the focus move. */
  registerRemove: (value: string, node: HTMLButtonElement | null) => void
}

/**
 * One chosen value as a removable badge. Memoised with stable handlers, so typing in the search
 * re-renders no badge.
 *
 * @param props - {@link MultiSelectTagProps}.
 * @returns The badge.
 */
function MultiSelectTagBase({
  tag,
  removeLabel,
  service,
  variant,
  size,
  disabled,
  registerRemove,
}: Readonly<MultiSelectTagProps>) {
  const { value } = tag

  // Stable removal handler: the badge only re-renders when its own props change.
  const handleRemove = useCallback(() => {
    service.remove(value)
  }, [service, value])

  // Stable callback ref: records the button for the next focus move, forgets it on unmount.
  const buttonRef = useCallback(
    (node: HTMLButtonElement | null) => {
      registerRemove(value, node)
    },
    [registerRemove, value]
  )

  return (
    <Badge
      variant={variant === 'dark' ? 'secondary-dark' : 'secondary'}
      size={size}
      canTruncate
      onRemove={handleRemove}
      removeLabel={removeLabel}
      removeButtonProps={{ ref: buttonRef, disabled }}
    >
      {tag.label}
    </Badge>
  )
}

export const MultiSelectTag = memo(MultiSelectTagBase)

export default MultiSelectTag
