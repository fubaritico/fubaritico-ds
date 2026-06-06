import { Link } from 'react-router-dom'

import { getMovieCardLinkClasses } from '../../MovieCard/MovieCard.utils'
import MovieCardContent from '../../MovieCard/MovieCardContent'

import type { MovieCardProps } from './MovieCard.types'

function MovieCard({
  id,
  title,
  posterUrl,
  voteAverage,
  year,
  className,
  imageLoading = 'lazy',
  as = 'card',
  ...rest
}: Readonly<MovieCardProps>) {
  const to = 'to' in rest ? rest.to : undefined
  const onClick = 'onClick' in rest ? rest.onClick : undefined

  const isInteractive = as === 'link' || as === 'button'

  const cardContent = (
    <MovieCardContent
      id={id}
      title={title}
      posterUrl={posterUrl}
      voteAverage={voteAverage}
      year={year}
      className={className}
      imageLoading={imageLoading}
      isInteractive={isInteractive}
      onClick={as === 'button' ? onClick : undefined}
    />
  )

  if (as === 'link' && to) {
    return (
      <Link to={to} className={getMovieCardLinkClasses()}>
        {cardContent}
      </Link>
    )
  }

  return cardContent
}

export default MovieCard
