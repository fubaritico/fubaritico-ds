import type { ImageProps } from 'next/image'
import type { CSSProperties } from 'react'

export interface NextImageProps extends Omit<ImageProps, 'placeholder'> {
  /** Container aspect ratio (e.g. '2/3', '16/9') */
  aspectRatio?: string
  /** Base64 blur data URL — auto-sets placeholder="blur" when provided */
  blurDataURL?: string
  /** Classes applied directly to the `<Image>` element */
  imageClassName?: string
  /** Inline styles applied directly to the `<Image>` element (overrides fill defaults) */
  imageStyle?: CSSProperties
}
