import { type Row } from '@tanstack/react-table'

import { Badge } from '../../../../Badge'
import { TableCell } from '../../primitives/TableCell'

/**
 * Cell factory rendering an org value inside an outline {@link Badge} (or `-` when empty).
 *
 * Simplified from the original (which mapped the org type to a colour via `setBadgeParameter`): the DS
 * is neutral-by-default, so this renders a plain outline badge with the value as its text.
 *
 * @param keyName - Key to read the org value from the row.
 * @param className - Optional extra classes for the cell.
 * @returns A TanStack cell renderer for an org column.
 */
const BadgeOrgCell =
  (keyName: string, className?: string) =>
  <TData,>({ row }: { row: Row<TData> }) => {
    const value = row.getValue<string>(keyName)

    return (
      <TableCell className={className}>
        {value ? (
          <Badge variant="outline" size="sm">
            {value}
          </Badge>
        ) : (
          '-'
        )}
      </TableCell>
    )
  }

export default BadgeOrgCell
