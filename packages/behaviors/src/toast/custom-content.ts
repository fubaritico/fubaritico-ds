import type { ToastRecord } from './types.js'

/**
 * Reads a toast's free content for the adapter of one framework — the last check, for a toast
 * shown before the stack declared its `renderer`.
 *
 * @param record - A toast of the snapshot.
 * @param kind - The adapter's framework (`'react'`…).
 * @returns The node to render, or `undefined` when the toast has none (render its `message`).
 * @throws Error when the content belongs to another framework: it cannot be rendered here, and
 *   showing nothing would hide the misuse.
 */
export function customContentFor<C>(
  record: ToastRecord<C>,
  kind: string
): C | undefined {
  if (record.custom === undefined) return undefined
  if (record.custom.kind !== kind)
    throw new Error(
      `Toast: the toast "${record.id}" holds ${record.custom.kind} content, which a ${kind} ` +
        `stack cannot render. Send a \`message\` to share a toast across frameworks.`
    )
  return record.custom.value
}
