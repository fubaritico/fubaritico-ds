import type { ButtonVisualProps } from '../Button/Button.shared'
import type { LinkProps } from 'next/link'
import type { ComponentProps, ReactNode } from 'react'

/** Next.js `<Link>` styled as a button (in-app navigation). */
export type NextLinkButtonAsLink = ButtonVisualProps &
  Omit<LinkProps, 'as'> & {
    /** Render a next/link (default). */
    as?: 'link'
    /** Extra class names. */
    className?: string
    /** Button content. */
    children?: ReactNode
  }

/** Plain `<a>` styled as a button — for cross-zone navigation (Next multi-zones). */
export type NextLinkButtonAsZoneLink = ButtonVisualProps &
  ComponentProps<'a'> & {
    /** Render a plain anchor instead of next/link. */
    as: 'zone-link'
    /** Navigation URL (required for the zone link). */
    href: string
  }

/** Props for {@link NextLinkButton}. */
export type NextLinkButtonProps =
  | NextLinkButtonAsLink
  | NextLinkButtonAsZoneLink
