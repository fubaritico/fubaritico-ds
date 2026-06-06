import clsx from 'clsx'

import { Avatar } from '../Avatar'
import { Typography } from '../Typography'

import type { AvatarSize } from '../Avatar'
import type { HTMLAttributes } from 'react'

export interface TalentProps extends HTMLAttributes<HTMLDivElement> {
  /** Full name of the talent (actor, director, writer, etc.) */
  name?: string
  /** Role or job title (e.g., "Director", "Screenplay", "Character Name") */
  role?: string
  /** Optional profile image URL */
  imageSrc?: string
  /** Layout variant - vertical for crew/cast cards, horizontal for lists */
  variant?: 'vertical' | 'horizontal'
  /** Avatar size */
  size?: AvatarSize
}

function Talent({
  name,
  role,
  imageSrc,
  variant = 'vertical',
  size = 'lg',
  className,
  ...rest
}: Readonly<TalentProps>) {
  return (
    <div
      className={clsx(
        'ui:flex ui:items-center',
        {
          'ui:flex-col ui:text-center ui:gap-3': variant === 'vertical',
          'ui:flex-row ui:gap-4': variant === 'horizontal',
        },
        className
      )}
      data-testid="talent"
      {...rest}
    >
      <Avatar
        testId="avatar"
        src={imageSrc}
        alt={name ?? 'Unknown'}
        size={size}
      />
      <div
        className={clsx({ 'ui:flex ui:flex-col': variant === 'horizontal' })}
      >
        <Typography
          variant="body"
          className="ui:font-semibold ui:text-foreground"
        >
          {name ?? 'Unknown'}
        </Typography>
        <Typography
          variant="caption"
          className="ui:text-muted-foreground ui:[.media-section:nth-of-type(odd)_&]:text-badge-foreground"
        >
          {role ?? 'N/A'}
        </Typography>
      </div>
    </div>
  )
}

export default Talent
