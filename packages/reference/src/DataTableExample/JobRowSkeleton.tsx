import { Skeleton } from '../Skeleton'

import type { CSSProperties } from 'react'

/** A single skeleton bar (CSS lengths, matching the original placeholder dimensions). */
interface SkeletonBar {
  /** Bar width (CSS length). */
  width: string
  /** Bar height (CSS length). */
  height: string
}

/**
 * Column placeholders, faithfully recreated from the original `JobRowSkeleton` (7 cells; some cells
 * stack two bars — a title + subtitle — others a single bar; the last cell is a taller badge bar).
 */
const CELLS: readonly SkeletonBar[][] = [
  [
    { width: '150px', height: '20px' },
    { width: '100px', height: '16px' },
  ],
  [{ width: '100px', height: '16px' }],
  [
    { width: '100px', height: '20px' },
    { width: '75px', height: '16px' },
  ],
  [
    { width: '100px', height: '20px' },
    { width: '75px', height: '16px' },
  ],
  [
    { width: '100px', height: '20px' },
    { width: '75px', height: '16px' },
  ],
  [{ width: '75px', height: '16px' }],
  [{ width: '100px', height: '32px' }],
]

/** Cell box — mirrors the original `p-4` padding and middle vertical alignment. */
const CELL_STYLE: CSSProperties = { padding: '1rem', verticalAlign: 'middle' }

/** Stacks multiple bars in a column with the original `gap-1` (4px) spacing. */
const STACK_STYLE: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '4px',
}

/**
 * A single loading-state row for the jobs DataTable — rebuilt from the DS {@link Skeleton} (which
 * provides the shimmer), replacing the original hand-rolled `animate-pulse` placeholder divs.
 * Rendered N times in the table body while data is loading.
 *
 * @returns A `<tr>` of skeleton cells aligned to the jobs columns.
 */
export default function JobRowSkeleton() {
  return (
    <tr>
      {CELLS.map((bars, cellIndex) => (
        <td key={`cell-${String(cellIndex)}`} style={CELL_STYLE}>
          <div style={bars.length > 1 ? STACK_STYLE : undefined}>
            {bars.map((bar, barIndex) => (
              <Skeleton
                key={`bar-${String(cellIndex)}-${String(barIndex)}`}
                variant="line"
                width={bar.width}
                height={bar.height}
              />
            ))}
          </div>
        </td>
      ))}
    </tr>
  )
}
