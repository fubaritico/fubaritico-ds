import clsx from 'clsx'
import { createContext, use } from 'react'

import {
  CARD_BODY_CLASS,
  CARD_FOOTER_CLASS,
  CARD_HEADER_CLASS,
  cardVariants,
} from '@fubaritico-ds/variants'

import type { CardVariant } from '@fubaritico-ds/variants'
import type { ComponentProps } from 'react'

export type { CardVariant }

export interface CardProps extends ComponentProps<'div'> {
  /** Visual surface variant — chrome only (background, border, shadow). Defaults to `'default'`. */
  variant?: CardVariant
}

/** Props shared by the Card slot elements (`Card.Body` / `Card.Header` / `Card.Footer`). */
export type CardSlotProps = ComponentProps<'div'>

/**
 * Internal marker context: present only while rendering inside `<Card>`. The slot sub-components read
 * it through {@link useCardContext} and throw when used standalone — so a `Card.Header/Body/Footer`
 * (which carries slot chrome: padding, a specific layout) can never appear outside the surface it
 * belongs to. It transports no state; its mere presence is the guard.
 */
interface CardContextValue {
  /** Always `true`; its presence proves the slot is rendered inside a `<Card>`. */
  readonly within: true
}

const CardContext = createContext<CardContextValue | null>(null)

/** Stable marker value — never changes, so no memoisation is needed. */
const CARD_CONTEXT_VALUE: CardContextValue = { within: true }

/**
 * Reads the Card marker context and guards composition: a slot is meaningless outside `<Card>`, so
 * this throws when the context is absent (mirrors the Avatar access-hook discipline). Sub-components
 * call this hook; they never read the context inline. It only guards — the marker carries no data,
 * so there is nothing to return.
 *
 * @param slot - The slot name (`Body` / `Header` / `Footer`), used to build a precise error message.
 */
function useCardContext(slot: string): void {
  if (!use(CardContext)) {
    throw new Error(`Card.${slot} must be used within <Card>`)
  }
}

/**
 * Card — a presentational surface container migrated onto the native skin, and the compound's marker
 * context provider.
 *
 * It owns only the CHROME (background, border, shadow, radius) and lays its children out as a flex
 * column; `overflow: hidden` clips an edge-to-edge media child (e.g. an `<img>`) to the rounded
 * corners. SPACING is delegated to the slots, so wrap textual content in `Card.Body` (and optionally
 * `Card.Header` / `Card.Footer`) to get padding — a bare `<Card>text</Card>` is intentionally unpadded.
 *
 * Open/Closed: richer cards (media + title + actions) and an interactive/clickable card are built by
 * COMPOSING this surface with the slots and other primitives — never by adding props here.
 *
 * @param props - Card props; see {@link CardProps}. Forwards every `<div>` attribute (incl. `ref`).
 * @returns The card surface element wrapping its slots.
 */
export function Card({
  className,
  variant = 'default',
  children,
  ...rest
}: Readonly<CardProps>) {
  return (
    <div className={clsx(cardVariants({ variant }), className)} {...rest}>
      <CardContext value={CARD_CONTEXT_VALUE}>{children}</CardContext>
    </div>
  )
}

/**
 * Card.Body — the padded content region of a Card (flex column with an inner gap). Textual content
 * lives here, since the root Card has no padding of its own. Throws if used outside `<Card>`.
 *
 * @param props - Standard `<div>` props; see {@link CardSlotProps}.
 * @returns The padded body element.
 */
export function CardBody({
  className,
  children,
  ...rest
}: Readonly<CardSlotProps>) {
  useCardContext('Body')
  return (
    <div className={clsx(CARD_BODY_CLASS, className)} {...rest}>
      {children}
    </div>
  )
}

/**
 * Card.Header — a padded header region (column layout, tight inner gap) for a title / subtitle.
 * Throws if used outside `<Card>`.
 *
 * @param props - Standard `<div>` props; see {@link CardSlotProps}.
 * @returns The padded header element.
 */
export function CardHeader({
  className,
  children,
  ...rest
}: Readonly<CardSlotProps>) {
  useCardContext('Header')
  return (
    <div className={clsx(CARD_HEADER_CLASS, className)} {...rest}>
      {children}
    </div>
  )
}

/**
 * Card.Footer — a padded footer region laying its children out in a row (e.g. actions). Throws if
 * used outside `<Card>`.
 *
 * @param props - Standard `<div>` props; see {@link CardSlotProps}.
 * @returns The padded footer element.
 */
export function CardFooter({
  className,
  children,
  ...rest
}: Readonly<CardSlotProps>) {
  useCardContext('Footer')
  return (
    <div className={clsx(CARD_FOOTER_CLASS, className)} {...rest}>
      {children}
    </div>
  )
}

Card.Body = CardBody
Card.Header = CardHeader
Card.Footer = CardFooter

export default Card
