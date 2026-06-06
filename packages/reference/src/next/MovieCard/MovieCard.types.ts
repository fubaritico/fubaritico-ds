import type {
  MovieCardAsButton,
  MovieCardAsCard,
  MovieCardBaseProps,
} from '../../MovieCard/MovieCard.utils'

export type { MovieCardBaseProps, MovieCardAsCard, MovieCardAsButton }

export interface NextMovieCardAsLink extends MovieCardBaseProps {
  /** Render as Next.js Link */
  as: 'link'
  /** Navigation path (required when as="link") */
  href: string
  onClick?: never
}

export interface NextMovieCardAsZoneLink extends MovieCardBaseProps {
  /** Render as a plain anchor for cross-zone navigation (multi-zones). */
  as: 'zone-link'
  /** Navigation path (required when as="zone-link") */
  href: string
  onClick?: never
}

export type NextMovieCardProps =
  | MovieCardAsCard
  | NextMovieCardAsLink
  | NextMovieCardAsZoneLink
  | MovieCardAsButton
