/**
 * Formats an `"HH:mm:ss"` duration string into a human-readable label (e.g. "1 hour 30 mins").
 * Native parsing (split on `:`) — no date library; non-numeric / missing segments coerce to 0.
 *
 * @param durationString - Duration in `"HH:mm:ss"` format.
 * @returns The formatted duration, or an empty string when every segment is 0.
 */
export const formatDuration = (durationString: string): string => {
  const [hours = 0, minutes = 0, seconds = 0] = durationString
    .split(':')
    .map(Number)

  const parts: string[] = []
  if (hours > 0) parts.push(`${String(hours)} hour${hours > 1 ? 's' : ''}`)
  if (minutes > 0) parts.push(`${String(minutes)} min${minutes > 1 ? 's' : ''}`)
  if (seconds > 0) parts.push(`${String(seconds)} sec${seconds > 1 ? 's' : ''}`)

  return parts.join(' ')
}
