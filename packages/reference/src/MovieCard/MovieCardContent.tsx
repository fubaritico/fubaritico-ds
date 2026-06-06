import { Card } from '../Card'
import { Image } from '../Image'
import { Rating } from '../Rating'
import { Typography } from '../Typography'

import { getMovieCardClasses } from './MovieCard.utils'

import type { ImageLoading } from '../Image'
import type { ReactNode } from 'react'

interface MovieCardContentProps {
  id: number
  title: string
  posterUrl: string
  voteAverage: number
  year?: number | null
  className?: string
  imageLoading?: ImageLoading
  isInteractive: boolean
  onClick?: (() => void) | undefined
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
}: Readonly<MovieCardContentProps>): ReactNode {
  return (
    <Card
      variant="ghost"
      className={getMovieCardClasses(isInteractive, className)}
      onClick={onClick}
      data-testid={`movie-card-${String(id)}`}
    >
      <div className="ui:relative ui:aspect-[2/3] ui:w-full ui:overflow-hidden ui:rounded-md ui:bg-gray-200">
        <Image
          src={posterUrl}
          alt={title}
          loading={imageLoading}
          aspectRatio={undefined}
          className="ui:h-full ui:w-full ui:object-cover"
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
