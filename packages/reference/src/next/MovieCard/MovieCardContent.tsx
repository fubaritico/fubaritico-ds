import { Card } from '../../Card'
import { getMovieCardClasses } from '../../MovieCard/MovieCard.utils'
import { Rating } from '../../Rating'
import { Typography } from '../../Typography'
import { NextImage } from '../Image'

import type { ImageLoading } from '../../Image/Image'
import type { ReactNode } from 'react'

interface NextMovieCardContentProps {
  id: number
  title: string
  posterUrl: string
  voteAverage: number
  year?: number | null
  className?: string
  imageLoading?: ImageLoading
  isInteractive: boolean
  onClick?: (() => void) | undefined
  blurDataURL?: string
}

export default function MovieCardContent({
  id,
  title,
  posterUrl,
  voteAverage,
  year,
  className,
  imageLoading = 'lazy',
  isInteractive,
  onClick,
  blurDataURL,
}: Readonly<NextMovieCardContentProps>): ReactNode {
  const src = `https://image.tmdb.org/t/p/w342${posterUrl}`

  return (
    <Card
      variant="ghost"
      className={getMovieCardClasses(isInteractive, className)}
      onClick={onClick}
      data-testid={`movie-card-${String(id)}`}
    >
      <div className="ui:relative ui:aspect-[2/3] ui:w-full ui:overflow-hidden ui:rounded-md ui:bg-gray-200">
        <NextImage
          src={src}
          alt={title}
          width={150}
          height={225}
          loading={imageLoading}
          blurDataURL={blurDataURL}
          className="ui:h-full ui:w-full"
        />
        <div className="ui:absolute ui:bottom-2 ui:right-2 ui:flex ui:items-center ui:justify-center ui:rounded-full ui:bg-white/80 ui:p-1">
          <Rating
            value={voteAverage}
            size="sm"
            variant="circle"
            trackClassName="ui:text-gray-200"
            className="ui:drop-shadow"
          />
        </div>
      </div>

      <div className="ui:mt-2 ui:flex ui:flex-col ui:gap-0.5 ui:px-1">
        <Typography
          variant="label"
          as="h3"
          className="ui:line-clamp-2"
          title={title}
        >
          {title}
        </Typography>
        {year && (
          <Typography
            variant="caption-xs"
            className="ui:[.media-section:nth-of-type(odd)_&]:text-badge-foreground"
          >
            {year}
          </Typography>
        )}
      </div>
    </Card>
  )
}
