import clsx from 'clsx'

import type { ImageLoading } from '../Image'

export interface MovieCardBaseProps {
  /** Media ID */
  id: number
  /** Media title */
  title: string
  /** Poster URL (full URL or TMDB path) */
  posterUrl: string
  /** Vote average (0-10) */
  voteAverage: number
  /** Release year */
  year?: number | null
  /** Additional class name */
  className?: string
  /** Image loading strategy ('lazy' | 'eager'). Default: 'lazy' */
  imageLoading?: ImageLoading
  /** Base64 blur data URL for next/image placeholder="blur" */
  blurDataURL?: string
}

export interface MovieCardAsCard extends MovieCardBaseProps {
  as?: 'card' | undefined
  onClick?: never
}

export interface MovieCardAsButton extends MovieCardBaseProps {
  as: 'button'
  onClick: () => void
}

export function getMovieCardClasses(
  isInteractive: boolean,
  className?: string
) {
  return clsx(
    'ui:group ui:relative ui:flex ui:flex-col ui:overflow-hidden',
    isInteractive && [
      'ui:cursor-pointer',
      'ui:transition-transform ui:duration-200',
      'hover:ui:scale-[1.02]',
    ],
    className
  )
}

export function getMovieCardLinkClasses() {
  return 'ui:block ui:no-underline ui:text-inherit'
}
