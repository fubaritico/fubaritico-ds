import type { PropsWithChildren } from 'react'

interface WithTooltipProps extends PropsWithChildren {
  prop: unknown
}

export function WithTooltip(props: WithTooltipProps) {
  /* TODO document why this function 'WithTooltip' is empty */
  console.warn(props)
  return null
}
