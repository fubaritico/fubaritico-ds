import type { KeyboardLike } from '../common/types.js'

/**
 * Whether a modifier is held: Alt / Ctrl / Cmd + a key belong to the browser and assistive
 * technology (Alt+Arrow is history, Ctrl+Home a page jump…), never to a component's keyboard model.
 * Shift is not one: a service may read it (a larger step).
 *
 * @param event - Any keyboard event.
 * @returns `true` when the key must be left alone.
 */
export function hasModifier(event: KeyboardLike): boolean {
  return [event.altKey, event.ctrlKey, event.metaKey].some(
    (flag) => flag === true
  )
}
