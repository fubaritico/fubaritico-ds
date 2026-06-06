import type {
  MovieCardAsButton,
  MovieCardAsCard,
  MovieCardBaseProps,
} from '../../MovieCard/MovieCard.utils'

export type { MovieCardBaseProps, MovieCardAsCard, MovieCardAsButton }

export interface MovieCardAsLink extends MovieCardBaseProps {
  /** Render as React Router Link */
  as: 'link'
  /** Navigation path (required when as="link") */
  to: string
  onClick?: never
}

export type MovieCardProps =
  | MovieCardAsCard
  | MovieCardAsLink
  | MovieCardAsButton
