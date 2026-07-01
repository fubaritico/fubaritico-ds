import { type Row } from '@tanstack/react-table'

import { Badge } from '../../Badge'
import { TableCell } from '../components/TableCell'

import type { IconName } from '../../Icon'
import type { BadgeVariant } from '@fubaritico-ds/variants'

/** Visual recipe (variant + optional leading icon) for a job status. */
interface StatusBadge {
  /** Badge variant. */
  variant: BadgeVariant
  /** Optional leading icon (decorative; the status text conveys the meaning). */
  icon?: IconName
}

/** Maps a (lowercased) job status to a Badge recipe. */
const STATUS_BADGE: Record<string, StatusBadge> = {
  completed: { variant: 'default', icon: 'Check' },
  running: { variant: 'secondary' },
  queued: { variant: 'outline' },
  cancelled: { variant: 'outline' },
  failed: { variant: 'destructive', icon: 'ExclamationCircle' },
}

/** Fallback recipe for an unknown status. */
const DEFAULT_BADGE: StatusBadge = { variant: 'secondary' }

/**
 * Cell factory rendering a job status as a {@link Badge}. Replaces the original `OdaBadge` +
 * `getFilledBadgeWithIconProps` with the DS Badge and a local status→variant map.
 *
 * @returns A TanStack cell renderer for the `status` column.
 */
const BadgeStatusCell =
  () =>
  <TData,>({ row }: { row: Row<TData> }) => {
    const status = row.getValue<string>('status')
    const { variant, icon } =
      STATUS_BADGE[status.toLowerCase()] ?? DEFAULT_BADGE

    return (
      <TableCell aria-label={status} tabIndex={0}>
        <Badge variant={variant} icon={icon}>
          {status}
        </Badge>
      </TableCell>
    )
  }

export default BadgeStatusCell
