import { AVATAR_INITIALS_CLASS } from '@fubaritico-ds/variants'

import { useCascadeCandidate } from './AvatarContext'

export interface AvatarInitialsProps {
  /** The initials text. Truncated to the first 2 characters; uppercased by the skin. */
  children?: string
}

/**
 * Initials candidate. Viable when non-empty text is provided; truncates to the first 2 characters
 * (the skin owns the uppercase + font-size, which scales via CSS — no context needed here).
 *
 * @param props - {@link AvatarInitialsProps}
 * @returns The initials span when this candidate wins; otherwise nothing.
 */
export function AvatarInitials({ children }: Readonly<AvatarInitialsProps>) {
  const text = children?.trim() ?? ''
  // Viable only when there is non-empty text; otherwise the cascade skips to the next candidate.
  const mode = useCascadeCandidate(text ? 'ready' : 'failed')

  if (mode !== 'show') return null

  // Decorative: the root (role="img" + aria-label) is the single accessible name; the visible
  // initials must not be announced separately.
  return (
    <span aria-hidden className={AVATAR_INITIALS_CLASS}>
      {text.slice(0, 2)}
    </span>
  )
}

export default AvatarInitials
