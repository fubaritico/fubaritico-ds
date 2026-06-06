import clsx from 'clsx'
import { useState } from 'react'

import { Button } from '../Button'
import { Modal } from '../Modal'

export interface TrailerCardProps {
  /** YouTube video ID */
  videoKey: string
  /** Trailer title/name */
  title: string
  /** Video type (Trailer, Clip, Featurette, etc.) */
  type?: string
  /** Additional className for the card */
  className?: string
}

function TrailerCard({
  videoKey,
  title,
  type = 'Trailer',
  className,
}: Readonly<TrailerCardProps>) {
  const [isPlaying, setIsPlaying] = useState(false)

  const thumbnailUrl = `https://img.youtube.com/vi/${videoKey}/hqdefault.jpg`

  return (
    <>
      {/* Thumbnail card with play button overlay */}
      <button
        className={clsx(
          'ui:group ui:relative ui:flex ui:aspect-video ui:w-full ui:cursor-pointer ui:overflow-hidden ui:rounded-lg ui:bg-gray-200',
          'ui:transition-transform ui:duration-200 hover:ui:scale-[1.02]',
          className
        )}
        onClick={() => {
          setIsPlaying(true)
        }}
        tabIndex={0}
        aria-label={`Play ${title}`}
      >
        {/* Thumbnail image */}
        <img
          src={thumbnailUrl}
          alt={title}
          className="ui:h-full ui:w-full ui:object-cover"
          loading="lazy"
        />

        {/* Play button overlay */}
        <div className="ui:absolute ui:inset-0 ui:flex ui:items-center ui:justify-center ui:bg-black/30 ui:opacity-0 ui:transition-opacity ui:duration-200 group-hover:ui:opacity-100">
          <div className="ui:flex ui:items-center ui:justify-center ui:h-16 ui:w-16 ui:rounded-full ui:bg-white/90">
            <span className="ui:text-2xl ui:ml-1">▶</span>
          </div>
        </div>

        {/* Type badge */}
        {type && (
          <div className="ui:absolute ui:bottom-2 ui:left-2 ui:rounded ui:bg-black/80 ui:px-2 ui:py-1 ui:text-xs ui:font-semibold ui:text-white">
            {type}
          </div>
        )}
      </button>

      {/* Modal with YouTube embed */}
      <Modal
        isOpen={isPlaying}
        onClose={() => {
          setIsPlaying(false)
        }}
        aria-label={`Play ${title}`}
      >
        {/* Inner wrapper: flex centering — must NOT be on <dialog> itself to preserve display:none when closed */}
        <div className="ui:flex ui:h-full ui:w-full ui:items-center ui:justify-center ui:p-4">
          {/* Close button */}
          <Button
            icon="XMark"
            size="sm"
            variant="ghost"
            iconPosition="left"
            onClick={() => {
              setIsPlaying(false)
            }}
            className="ui:absolute ui:top-4 ui:right-4 ui:text-white hover:ui:bg-white/10 ui:z-10 ui:focus:border-none"
            aria-label="Close video"
          >
            Close video
          </Button>

          {/* Responsive 16:9 iframe container */}
          {isPlaying && (
            <iframe
              className="ui:w-full ui:max-w-4xl ui:aspect-video ui:rounded-lg"
              src={`https://www.youtube.com/embed/${videoKey}`}
              title={title}
              allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          )}
        </div>
      </Modal>
    </>
  )
}

export default TrailerCard
