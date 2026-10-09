/**
 * WithTooltip — UNFINISHED STUB, excluded from the published build.
 *
 * The start of the "tooltip on truncated text" feature: show a `Tooltip` only when a label is
 * actually ellipsised, replacing the `title` / `aria-label` stopgaps scattered across the
 * DataTable cells, `TruncatedContent`, `DateCell`, Badge `canTruncate` and the Listbox items.
 * Both ingredients already exist — the migrated `Tooltip` and the `useIsTextTruncated` hook — but
 * no logic has been written yet.
 *
 * It is kept in the tree on purpose (see the EN SUSPENS entry in `.claude/next.md`) and excluded
 * from `tsup` and from the declaration emit, so it cannot reach a consumer. It briefly did, in
 * 0.1.0, through the `./*` wildcard export.
 *
 * Naming is still open: `WithTooltip` versus `TruncateWithTooltip`.
 */
import type { PropsWithChildren } from 'react'

interface WithTooltipProps extends PropsWithChildren {
  prop: unknown
}

export function WithTooltip(props: WithTooltipProps) {
  /* TODO document why this function 'WithTooltip' is empty */
  console.warn(props)
  return null
}
