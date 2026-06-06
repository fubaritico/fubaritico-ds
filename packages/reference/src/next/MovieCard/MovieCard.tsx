'use client'

import Link from 'next/link'

import { getMovieCardLinkClasses } from '../../MovieCard/MovieCard.utils'

import MovieCardContent from './MovieCardContent'

import type { NextMovieCardProps } from './MovieCard.types'

function MovieCard({
  id,
  title,
  posterUrl,
  voteAverage,
  year,
  className,
  imageLoading = 'lazy',
  blurDataURL,
  as = 'card',
  ...rest
}: Readonly<NextMovieCardProps>) {
  const href = 'href' in rest ? rest.href : undefined
  const onClick = 'onClick' in rest ? rest.onClick : undefined

  const isInteractive = as === 'link' || as === 'zone-link' || as === 'button'

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
      blurDataURL={blurDataURL}
    />
  )

  if (as === 'link' && href) {
    return (
      <Link href={href} className={getMovieCardLinkClasses()}>
        {cardContent}
      </Link>
    )
  }

  if (as === 'zone-link' && href) {
    return (
      <a href={href} className={getMovieCardLinkClasses()}>
        {cardContent}
      </a>
    )
  }

  return cardContent
}

export default MovieCard
